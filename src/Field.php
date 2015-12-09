<?php

namespace Paramonov\Grid;

abstract class Field
{
    public $name;
    /** @var Filter  */
    public $filter;

    abstract public function render();

    public function parsedFieldName()
    {
        return GridHelper::parseField($this->name);
    }
}