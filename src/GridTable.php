<?php


namespace Paramonov\Grid;


use Carbon\Carbon;

class GridTable
{
    private $data_provider;
    private $request;
    private $system_fields = [
        'tools'
    ];

    public function __construct(GridDataProvider $data_provider)
    {
        $this->data_provider = $data_provider;
    }

    protected function buildQuery($searches, $prefix = '')
    {
        if (!is_array($searches)) {
            return;
        }

        $filters = $this->data_provider->filters();
        foreach ($searches as $alias => $search) {
            $alias = $prefix . $alias;
            if (!$search) {
                continue;
            }

            if (isset($filters[$alias])) {
                $filters[$alias] ($this->data_provider->query(), $search);
            } else {
                $this->buildQuery($search, $alias . '.');
            }
        }
    }

    private function addSelectsToDataProvider($columns)
    {
        $main_table = $this->data_provider->query()->getModel()->getTable();
        // Добавляем селекты для уникальности полей в выборке
        $this->data_provider->query()->addSelect($main_table . '.*');
        foreach ($columns as $field) {
            if (strpos($field, '.')) {
                $this->data_provider->query()->addSelect($field . ' as ' . str_replace('.', ':', $field));
            }
        }
    }

    private function getRequestData($key, $default = null, $access_string = null)
    {
        $this->request = $this->request ?: \Request::capture();

        $data = json_decode($this->request->input($key), true);

        return $access_string ? array_get($data, $access_string, $default) : ($data ?: $default);

    }

    private function makeQuery($sorting = null, $limit = null, $page = null)
    {
        if ($sorting) {

            $this->data_provider->query()->orderBy($sorting['field'], $sorting['dir']);

        }
        $query = $this->data_provider->query();
        if ($limit) {
            $query->take($limit)->skip(($page - 1) * $limit);
        }
        return $query->get();
    }

    public function getData($columns = [])
    {

        $this->addSelectsToDataProvider($columns ?: array_keys($this->data_provider->filters()));

        $searches = $this->getRequestData('search');
        $sorting = $this->getRequestData('sorting', $this->getSorting());
        $limit = $this->getRequestData('pagination', $this->data_provider->pagination()->getLimit(), 'items_per_page');
        $page = $this->getRequestData('pagination', 1, 'current_page');


        $this->buildQuery($searches);
        $total = $this->data_provider->query()->count();

        $data = $this->makeQuery($sorting, $limit, $page)->toArray();

        return [
            'data' => $this->formatData($data),
            'limit' => $limit,
            'sorting' => $sorting,
            'total' => $total,
        ];
    }

    public function getCSV($file_name, $template)
    {
        $columns = $this->getRequestData('column_names', array_keys($this->data_provider->filters()));
        $this->addSelectsToDataProvider($columns);
        $searches = $this->getRequestData('search');
        $headers = $this->getRequestData('headers');
        $sorting = $this->getRequestData('sorting', $this->getSorting());
        $this->buildQuery($searches);
        $output = [];
        $cells = [];



        foreach ($columns as $field_name){

            if (in_array($field_name, $this->system_fields)){
                continue;
            }

            $cells[] = iconv('UTF8', 'CP1251', $headers[$field_name]);
        }

        $output[] = implode(';', $cells);

        foreach ($this->makeQuery($sorting) as $item) {
            $cells = [];


            foreach ($columns as $field_name) {

                if (in_array($field_name, $this->system_fields)){
                    continue;
                }

                $cell =  "\"" . str_replace(["\n", '\n', '  '], ['', "\r\n", ''], view('grid::cell', compact('field_name', 'item', 'template'))) . "\"";
                $cells[] = iconv('UTF8', 'CP1251', $cell);
            }
            $output[] = implode(';', $cells);
        }

        \Debugbar::disable();
        return response(implode("\n", $output))->header('Content-Disposition', 'attachment; filename="'.$file_name.'.csv"');


    }

    public function render($columns, array $components = ['search_all', 'active', 'column_hider'])
    {
        return view('grid::main', [
            'data_provider' => $this->data_provider,
            'columns' => $columns,
            'sorting' => $this->getSorting(),
            'components' => $components,
            'headers' => $this->getHeaders($columns ?: array_keys($this->data_provider->filters())),
        ]);
    }

    private function getHeaders($columns)
    {
        $headers = [];
        foreach ($columns as $column_name => $column){
            $headers[$column_name] = $column['title'];
        }
        return $headers;

    }


    public function getSorting()
    {
        if (isset($_COOKIE['data_provider'])) {
            $data_provider = json_decode($_COOKIE['data_provider'], true);
            if (!empty($data_provider['sorting'])) {
                return $data_provider['sorting'];
            } else {
                return $this->data_provider->getDefaultSorting();
            }
        } else {
            return $this->data_provider->getDefaultSorting();
        }
    }

    /**
     * @param $grid
     * @param $data
     * @return mixed
     */
    private function formatData($data)
    {
        $grid_data = [];
        foreach ($data as $i => $item) {
            foreach ($item as $key => $value) {
                if ($this->data_provider->getConfig('dates') && $this->data_provider->getConfig('date-format') && in_array($key, $this->data_provider->getConfig('dates'))) {

                    $value = $value ? Carbon::parse($value)->format($this->data_provider->getConfig('date-format')) : null;
                }
                $pairs = explode(':', $key);
                if (count($pairs) > 1) {
                    $grid_data [$i] [$pairs[0]] [$pairs[1]] = $value;
                } else {
                    $grid_data [$i] [$key] = $value;
                }
            }
        }
        return $grid_data;
    }
}