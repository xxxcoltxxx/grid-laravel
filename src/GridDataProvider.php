<?php

namespace Paramonov\Grid;


use Illuminate\Database\Eloquent\Builder;


interface GridDataProvider
{
    /**
     * @return Builder
     */
    public function query();

    /**
     * @return GridPagination
     */
    public function pagination();

    /**
     * @return \Closure[]
     */
    public function filters();

    /**
     * @return array
     */
    public function getDefaultSorting();

}