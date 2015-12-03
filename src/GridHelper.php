<?php

namespace Paramonov\Grid;

use Illuminate\Http\Request;

class GridHelper
{
    public static function parseField($field)
    {
        return str_replace("::", ".", $field);
    }

    public static function getQueryString(array $new_params = [])
    {
        $params = Request::capture()->all();
        foreach ($new_params as $key => $value) {
            $params[$key] = $value;
        }
        return !empty($params) ? '?' . http_build_query($params) : '';
    }
}