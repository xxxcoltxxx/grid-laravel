<?php

namespace Paramonov\Grid;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class GridTable
{
    /** Builder */
    private $source;
    private $config;

    public function __construct(Builder $source, array $config)
    {
        $this->source = $source;
        $this->config = $config;
    }

    public function render()
    {
        $request = Request::capture();
        $limit      = $request->get('limit', reset($this->config['limits']));
        $sort       = $request->get('sort', !empty($cfg['sort']) ? $cfg['sort']['field'] : '');
        $direction  = $request->get('direction', !empty($cfg['sort']) ? $cfg['sort']['direction'] : '');

        if ($sort && $direction) {
            $this->source->orderBy(GridHelper::parseField($sort), $direction ?: 'asc');
        }

        $select = [];
        /**
         * @var  $field Field
         */
        foreach ($this->config['columns'] as $field) {
            $select[] = $field->parsedFieldName() . " AS " . $field->name;
            $value = $request->get($field->name, '');
            if ($value !== '') {
                $field->filter->getWhere($this->source, $field->parsedFieldName(), $value);
            }
        }
        if (!empty($this->config['filter_all'])) {
            $field = $this->config['filter_all'];
            $value = $request->get($field->name, '');
            if ($value !== '') {
                if ($field->columns === ['*']) {
                    $columns = collect($this->config['columns'])->lists('name');
                } else {
                    $columns = $field->columns;
                }
                $this->source->where(function(Builder $source) use ($field, $columns, $value) {
                    $filter = $field->filter;
                    foreach ($columns as $column) {
                        $field_str = GridHelper::parseField($column);
                        $filter->getWhere($source, $field_str, $value, 'or');
                    }
                });
            }
        }
        $this->source->select($select);
        $rows = $this->source->paginate($limit);

        foreach ($request->all() as $key => $value) {
            $rows->appends($key, $value);
        }

        return view('grid::main', [
            'config' => $this->config,
            'rows' => $rows
        ])->render();
    }

    public function __toString()
    {
        return $this->render();
    }
}