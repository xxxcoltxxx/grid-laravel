<?php

namespace Paramonov\Grid\Filters;

use Paramonov\Grid\GridHelper;

class ILike extends Like
{
    protected $field_pattern;
    protected $value_pattern;

    const OPERATOR = 'ILIKE';

}
