<?php

namespace Paramonov\Grid;


abstract class Filter
{
    public function getWhere(&$source, $field, $value, $type = 'and')
    {
        $source->whereRaw($this->getField($field) . ' ' . static::OPERATOR . ' ?', [$this->getValue($value)], $type);
    }

    protected function getField($field)
    {
        return empty($this->field_pattern) ? $field : str_replace('{field}', $field, $this->field_pattern);
    }

    protected function getValue($value)
    {
        return empty($this->value_pattern) ? $value : str_replace('{value}', $value, $this->value_pattern);
    }
}