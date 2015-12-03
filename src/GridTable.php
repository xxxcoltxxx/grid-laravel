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
        foreach ($this->config['columns'] as $field => $title) {
            $select[] = GridHelper::parseField($field) . " AS " . $field;
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