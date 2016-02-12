<?php

namespace Paramonov\Grid;


use Illuminate\Database\Eloquent\Builder;


abstract class GridDataProvider
{
    private $config;

    public function getConfig($alias)
    {
        return array_get($this->config, $alias);
    }

    public function setConfig($alias, $value)
    {
        array_set($this->config, $alias, $value);
    }

    /**
     * @return Builder
     */
    abstract public function query();

    /**
     * @return GridPagination
     */
    abstract public function pagination();

    /**
     * @return \Closure[]
     */
    abstract public function filters();

    /**
     * @return array
     */
    public function getDefaultSorting()
    {
        return [
            'field' => 'id',
            'dir' => 'asc'
        ];
    }

}