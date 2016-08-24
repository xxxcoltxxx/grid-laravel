<?php

namespace Paramonov\Grid;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class GridTable
{
    private $data_provider;
    private $request;
    private $system_fields = [
        'tools',
    ];

    const TYPE_STRING = 'string';
    const TYPE_DATE_RANGE = 'daterange';
    const TYPE_SELECT = 'select';
    const TYPE_BOOLEAN = 'boolean';
    const TYPE_MULTI_SELECT = 'multiselect';

    public function __construct(GridDataProvider $data_provider)
    {
        $this->data_provider = $data_provider;
    }

    protected function buildQuery($searches, $prefix = '')
    {
        if (! is_array($searches)) {
            return;
        }

        $filters = $this->data_provider->getFilters();
        foreach ($searches as $alias => $search) {
            $alias = $prefix . $alias;
            if (! is_numeric($search) && ! is_bool($search) && empty($search)) {
                continue;
            }

            if (isset($filters[$alias])) {
                $filters[$alias] ($this->data_provider->getQuery(), $search);
            } else {
                $this->buildQuery($search, $alias . '.');
            }
        }
    }

    private function addSelectsToDataProvider($columns)
    {
        $main_table = $this->data_provider->getQuery()->getModel()->getTable();
        // Добавляем селекты для уникальности полей в выборке
        /** @var Builder */
        $this->data_provider->getQuery()->addSelect($main_table . '.*');
        foreach ($columns as $field) {
            if (strpos($field, '.')) {
                $this->data_provider->getQuery()->addSelect($field . ' as ' . str_replace('.', ':', $field));
            }
        }
    }

    private function getRequestData($key, $default = null, $access_string = null)
    {
        $this->request = $this->request ?: app(Request::class);
        $data = json_decode($this->request->input($key), true);

        return $access_string ? array_get($data, $access_string, $default) : ($data ?: $default);
    }

    private function makeQuery($sorting = null, $limit = null, $page = null)
    {
        if ($sorting) {
            $sort_field = isset($this->data_provider->sorting_resolve[$sorting['field']]) ? $this->data_provider->sorting_resolve[$sorting['field']] : $sorting['field'];
            $this->data_provider->getQuery()->orderBy($sort_field, $sorting['dir']);
        }

        $query = $this->data_provider->getQuery();
        if ($limit && $this->data_provider->getPagination()) {
            $query->take($limit)->skip(($page - 1) * $limit);
        }

        return $query->get();
    }

    private function mapDataWithTemplates($data, $templates)
    {
        $result = collect();
        $data->map(function ($item) use ($templates, &$result) {
            $item_ = ! is_array($item) ? $item->toArray() : $item;
            foreach ($templates as $cell_name => $viewFunc) {
                if (in_array($cell_name, $this->data_provider->getDates())) {
                    if ($item->{$cell_name} && ! $item->{$cell_name} instanceof Carbon) {
                        $item->{$cell_name} = \Carbon\Carbon::parse($item->{$cell_name})->format($this->data_provider->getDateFormat());
                    }
                }

                $item_[$cell_name] = $viewFunc($item);
            }
            $result->push($item_);
        });

        return $result;
    }

    public function getData($template = null)
    {
        $columns = array_keys($this->getRequestData('column_names', $this->data_provider->getFilters()));
        $this->addSelectsToDataProvider($columns ?: array_keys($this->data_provider->getFilters()));

        $searches = $this->getRequestData('search');
        $sorting = $this->getRequestData('sorting', $this->getSorting());
        $limit = $this->getRequestData('pagination', $this->data_provider->getPagination() ? $this->data_provider->getPagination()->getLimit() : null, 'items_per_page');
        if (! (int) $limit && $this->data_provider->getPagination()) {
            $limit = $this->data_provider->getPagination()->getLimit();
        }
        $page = $this->getRequestData('pagination', 1, 'current_page');


        $this->buildQuery($searches);

        $total = $this->data_provider->getCount();
        $data = $this->makeQuery($sorting, $limit, $page);
        if ($template) {
            $templates = [];
             // TODO: Избавиться от foreach
            foreach ($columns as $field_name) {
                $templates[$field_name] = function($item) use ($template, $field_name) {
                    $field_name = $this->encodeField($field_name);

                    return view('grid::cell', compact('template', 'field_name', 'item'))->render();
                };
            }
            $data = $this->mapDataWithTemplates($data, $templates);
        }

        return [
            'data'    => $this->formatData($data),
            'limit'   => $limit,
            'sorting' => $sorting,
            'total'   => $total,
        ];
    }

    private function makeCsvOutput($data)
    {
        $output = collect();
        foreach ($data as $cells) {
            $output->push('"' . implode('";"', $cells) . '"');
        }

        return $output->implode(PHP_EOL);
    }

    private function encodeForCsv($string)
    {
        return iconv('UTF8', 'CP1251', $string);
    }

    public function getCSV($file_name, $template = null)
    {
        $columns = $this->getRequestData('column_names', array_keys($this->data_provider->getFilters()));
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
                $field_name = $this->encodeField($field_name);

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

        return response($this->makeCsvOutput($csv_data))->header('Content-Disposition', 'attachment; filename="' . $file_name . '.csv"');
    }

    public function setName($name)
    {
        $this->data_provider->setName($name);

        return $this;
    }

    public function render($columns, array $components = ['search_all', 'column_hider'], $use_cookie = true, $view = 'grid::main')
    {
        return view($view, [
            'use_cookie'      => $use_cookie,
            'data_provider'   => $this->data_provider,
            'columns'         => $columns,
            'sorting'         => $this->getSorting(),
            'data_url'        => $this->data_provider->getDataUrl(),
            'csv_url'         => $this->data_provider->getCsvUrl(),
            'components'      => $components,
            'headers'         => $this->getHeaders($columns ?: array_keys($this->data_provider->getFilters())),
            'system_fields'   => $this->system_fields,
            'default_filters' => $this->data_provider->getDefaultFilters(),
            'grid_name'       => $this->data_provider->getName(),
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
        if (isset($_COOKIE['data_provider']) && request('use_cookie', 0)) {
            $data_provider = json_decode($_COOKIE['data_provider'], true);
            if (! empty($data_provider['sorting'])) {
                return $data_provider['sorting'];
            } else {
                return $this->data_provider->getDefaultSorting();
            }
        } else {
            return $this->data_provider->getDefaultSorting();
        }
    }

    /**
     * @param Collection $data
     *
     * @return mixed
     */
    private function formatData(Collection $data)
    {
        return $data->transform(function($item) {
            return $this->data_provider->transform($item);
        });
    }

    private function encodeField($field)
    {
        return str_replace('.', ':', $field);
    }
}
