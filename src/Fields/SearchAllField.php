<?php

namespace Paramonov\Grid\Fields;

use Paramonov\Grid\Field;
use Paramonov\Grid\Filter;

class SearchAllField extends Field
{
    public $columns;
    public $title;
    public $name = 'filter::all';

    public function __construct(Filter $filter, $title = null, $columns = ['*'])
    {
        $this->columns = $columns;
        $this->title = $title;
        $this->filter = $filter;
    }

    public function render()
    {
        return view('grid::fields.text', ['field' => $this])->render();
    }

    public function __toString()
    {
        return $this->render();
    }
}