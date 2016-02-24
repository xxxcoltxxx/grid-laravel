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

            $sort_field = isset($this->data_provider->sorting_resolve[$sorting['field']]) ? $this->data_provider->sorting_resolve[$sorting['field']] : $sorting['field'];

            $this->data_provider->query()->orderBy($sort_field, $sorting['dir']);

        }
        $query = $this->data_provider->query();
        if ($limit) {
            $query->take($limit)->skip(($page - 1) * $limit);
        }
        return $query->get();
    }

    private function mapDataWithTemplates($data, $templates)
    {
        $result = [];
        $data->map(function ($item) use ($templates, &$result) {

            $item_ = !is_array($item) ? $item->toArray() : $item;
            foreach ($templates as $cell_name => $viewFunc) {
                $item_[$cell_name] = $viewFunc($item);;
            }
            $result[] = $item_;

        });

        return $result;
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

        $data = $this->makeQuery($sorting, $limit, $page);

        if ($cell_templates = $this->data_provider->getConfig('cells-template')) {

            /**
             * @TODO Избавиться от foreach
             */
            foreach ($cell_templates as $cell_name => $view) {

                $templates[$cell_name] = function ($item) use ($view) {
                    return view($view, compact('item'))->render();
                };

            }
            $data = $this->mapDataWithTemplates($data, $templates);

        }


        return [
            'data' => $this->formatData($data),
            'limit' => $limit,
            'sorting' => $sorting,
            'total' => $total,
        ];
    }

    private function makeCsvOutput($data)
    {
        $output = [];
        foreach ($data as $cells) {
            $output[] = '"' . implode('";"', $cells) . '"';
        }
        return implode("\n", $output);
    }

    private function encodeForCsv($string)
    {
        return iconv('UTF8', 'CP1251', $string);
    }

    public function getCSV($file_name, $template)
    {
        $columns = $this->getRequestData('column_names', array_keys($this->data_provider->filters()));
        $this->addSelectsToDataProvider($columns);
        $searches = $this->getRequestData('search');
        $headers = $this->getRequestData('headers');
        $sorting = $this->getRequestData('sorting', $this->getSorting());
        $this->buildQuery($searches);

        $csv_data = [];

        foreach (array_diff($columns, $this->system_fields) as $field_name) {
            $csv_data[0][] = $this->encodeForCsv($headers[$field_name]);
        }


        $data = $this->makeQuery($sorting);
        $templates = [];

        /**
         * @TODO Избавиться от foreach
         */

        foreach (array_diff($columns, $this->system_fields) as $field_name) {
                $templates[$field_name] = function ($item) use ($template, $field_name) {
                    return str_replace(["\n", '\n', '  '], ['', "\r\n", ''], $this->encodeForCsv(view('grid::cell', compact('field_name', 'item', 'template'))->render()));
                };
        }

        $data = $this->mapDataWithTemplates($data, $templates);


        foreach ($data as $row) {
            $cells = [];
            foreach (array_diff($columns, $this->system_fields) as $field_name) {
                $cells[] = $row[$field_name];
            }
            $csv_data[] = $cells;
        }


        \Debugbar::disable();
        return response($this->makeCsvOutput($csv_data))->header('Content-Disposition', 'attachment; filename="' . $file_name . '.csv"');


    }

    public function render($columns, array $components = ['search_all', 'active', 'column_hider'])
    {
        return view('grid::main', [
            'data_provider' => $this->data_provider,
            'columns' => $columns,
            'sorting' => $this->getSorting(),
            'components' => $components,
            'headers' => $this->getHeaders($columns ?: array_keys($this->data_provider->filters())),
            'system_fields' => $this->system_fields,
        ]);
    }

    private function getHeaders($columns)
    {
        $headers = [];
        foreach ($columns as $column_name => $column) {
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