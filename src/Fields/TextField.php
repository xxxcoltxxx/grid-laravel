<?php

namespace Paramonov\Grid\Fields;

use Paramonov\Grid\Field;
use Paramonov\Grid\Filter;

class TextField extends Field
{
    public $name;
    public $title;
    /** @var Filter  */
    public $filter;

    public function __construct(Filter $filter, $name, $title = null)
    {
        $this->name = $name;
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