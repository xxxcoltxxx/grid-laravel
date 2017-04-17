<?php

namespace Paramonov\Grid;


use JsonSerializable;


class GridFastFilter implements JsonSerializable
{
    /**
     * Алиас для фильтра
     *
     * @var null|string
     */
    public $alias = null;

    /**
     * Название фильтра
     *
     * @var null|string
     */
    public $title = null;

    /**
     * Массив с параметрами фильтра
     *
     * @var array|null
     */
    public $search = null;

    /**
     * Режим отображения по-умолчанию
     *
     * @var int|null
     */
    public $default_mode = null;

    /**
     * Отображается по-умолчанию
     */
    const DEFAULT_VISIBLE = 1;
    /**
     * Не отображается по-умолчанию
     */
    const DEFAULT_HIDDEN = 2;
    /**
     * Отображается по умолчанию, если есть записи
     */
    const DEFAULT_VISIBLE_WHEN_EXISTS = 3;


    /**
     * GridFastFilter constructor.
     *
     * @param string   $alias
     * @param string   $title
     * @param array    $search
     * @param int|null $default
     */
    public function __construct(string $alias, string $title, array $search, $default = self::DEFAULT_VISIBLE)
    {
        $this->alias = $alias;
        $this->title = $title;
        $this->default_mode = $default;
        $this->search = $search;
    }


    function jsonSerialize()
    {
        return [
            'alias'        => $this->alias,
            'title'        => $this->title,
            'default_mode' => $this->default_mode,
            'search'       => $this->search,
        ];
    }
}
