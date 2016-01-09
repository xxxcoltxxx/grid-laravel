<?php


namespace Paramonov\Grid;


class GridTable
{
    private $data_provider;

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

    public function getData($columns = [])
    {
        // TODO: Хранить где-то колонки, а не вытаскивать их из фильтров
        if (!$columns) {
            $columns = array_keys($this->data_provider->filters());
        }
        $request = \Request::capture();
        $searches = json_decode($request->input('search'), true);
        $pagination = json_decode($request->input('pagination'), true);
        $sorting = json_decode($request->input('sorting'), true);

        if (empty($sorting)) {
            $sorting = $this->getSorting();
        }
        if (empty($pagination['items_per_page'])) {
            $limit = $this->data_provider->pagination()->getLimit();
        } else {
            $limit = $pagination['items_per_page'];
        }
        if (empty($pagination['current_page'])) {
            $page = 1;
        } else {
            $page = $pagination['current_page'];
        }

        $main_table = $this->data_provider->query()->getModel()->getTable();
        // Добавляем селекты для уникальности полей в выборке
        $this->data_provider->query()->addSelect($main_table . '.*');
        foreach ($columns as $field) {
            if (strpos($field, '.')) {
                $this->data_provider->query()->addSelect($field . ' as ' . str_replace('.', ':', $field));
            }
        }

        $this->buildQuery($searches);
        $grid['total'] = $this->data_provider->query()->count();
        $grid['limit'] = $limit;
        $grid['sorting'] = $sorting;

        // TODO: Избавиться от проверки на таблицу
        if ($sorting) {
            if (!strpos($sorting['field'], '.')) {
                $sorting['field'] = $main_table . '.' . $sorting['field'];
            }
            $this->data_provider->query()->orderBy($sorting['field'], $sorting['dir']);
        }

        // TODO: Избавиться от костыля с копированием массива
        $data = $this->data_provider->query()->take($limit)->skip(($page - 1) * $limit)->get()->toArray();
        $grid['data'] = [];
        foreach ($data as $i => $item) {
            foreach ($item as $key => $value) {
                $pairs = explode(':', $key);
                if (count($pairs) > 1) {
                    $grid['data'] [$i] [$pairs[0]] [$pairs[1]] = $value;
                } else {
                    $grid['data'] [$i] [$key] = $value;
                }
            }
        }
        return $grid;
    }

    public function render($columns, array $components = ['search_all', 'active', 'column_hider'])
    {
        return view('grid::main', [
            'data_provider' => $this->data_provider,
            'columns' => $columns,
            'sorting' => $this->getSorting(),
            'components' => $components
        ]);
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
}