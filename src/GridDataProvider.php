<?php


namespace Paramonov\Grid;


use Illuminate\Database\Eloquent\Builder;


abstract class GridDataProvider
{
    public $sorting_resolve;

    private $config;
    public $query;
    private $pagination;
    private $filters;
    private $default_sorting;
    private $data_url;
    private $templates;


    /**
     * Получение значения конфигурации
     *
     * @param $alias
     * @return mixed
     */
    public function getConfig($alias)
    {
        return array_get($this->config, $alias);
    }


    /**
     * Установка значения конфигурации
     *
     * @param $alias
     * @param $value
     */
    public function setConfig($alias, $value)
    {
        array_set($this->config, $alias, $value);
    }


    /**
     * Запрос для выборки данных для таблицы
     *
     * @return Builder
     */
    abstract protected function query();


    /**
     * Получение инстанса запроса
     *
     * @return Builder
     */
    public function getQuery()
    {
        if (is_null($this->query)) {
            $this->query = $this->query();
        }
        return $this->query;
    }


    /**
     * Пагинация
     *
     * @return GridPagination
     */
    protected function pagination()
    {
        return new GridPagination();
    }


    /**
     * Получение класса пагинации
     *
     * @return GridPagination
     */
    public function getPagination()
    {
        if (is_null($this->pagination)) {
            $this->pagination = $this->pagination();
        }
        return $this->pagination;
    }


    /**
     * Фильтрация выборки. Аналог scope в модели
     * Ключи массива должны совпадать с ключами массива из view
     *
     * @return \Closure[]
     */
    abstract protected function filters();


    /**
     * Получение фильтров
     *
     * @return \Closure[]
     */
    public function getFilters()
    {
        if (is_null($this->filters)) {
            $this->filters = $this->filters();
        }
        return $this->filters;
    }


    /**
     * Вьюшки для рендеринга отдельных ячеек
     *
     * @return array
     */
    protected function templates()
    {
        return [];
    }


    /**
     * Получение шаблонов для отдельных ячеек
     *
     * @return array
     */
    public function getTemplates()
    {
        if (is_null($this->templates)) {
            $this->templates = $this->templates();
        }
        return $this->templates;
    }

    /**
     * Сортировка по умолчанию
     *
     * @return array
     */
    protected function defaultSorting()
    {
        return [
            'field' => 'id',
            'dir' => 'asc'
        ];
    }


    /**
     * Получение сортировки по умолчанию
     *
     * @return array
     */
    public function getDefaultSorting()
    {
        if (is_null($this->default_sorting)) {
            $this->default_sorting = $this->defaultSorting();
        }
        return $this->default_sorting;
    }


    /**
     * url для подгрузки данных
     *
     * @return string
     */
    protected function dataUrl()
    {
        return '';
    }


    /**
     * Получение url для подгрузки данных
     *
     * @return string
     */
    public function getDataUrl()
    {
        if (is_null($this->data_url)) {
            $this->data_url = $this->dataUrl();
        }
        return $this->data_url;
    }
}
