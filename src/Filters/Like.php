<?php

namespace Paramonov\Grid\Filters;

use Paramonov\Grid\Filter;
use Paramonov\Grid\GridHelper;

class Like extends  Filter
{
    protected $field_pattern;
    protected $value_pattern;

    const OPERATOR = 'LIKE';

    public function __construct($field_pattern = 'CAST({field} AS TEXT)', $value_pattern = '%{value}%')
    {
        $this->field_pattern = $field_pattern;
        $this->value_pattern = $value_pattern;
    }
}
