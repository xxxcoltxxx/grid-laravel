<?php


namespace Paramonov\Grid;


use Illuminate\Database\Eloquent\Builder;


abstract class GridDataProvider
{
    /**
     * @var array Соответствие алиаса столбца в grid столбцу в БД для сортировки
     */
    public $sorting_resolve;

    private $query;
    private $pagination;
    private $filters;
    private $default_sorting;
    private $data_url;
    private $templates;
    private $date_format;
    private $dates;


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
    final public function getQuery()
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
    final public function getPagination()
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
    final public function getFilters()
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
    final public function getTemplates()
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
    final public function getDefaultSorting()
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
    final public function getDataUrl()
    {
        if (is_null($this->data_url)) {
            $this->data_url = $this->dataUrl();
        }
        return $this->data_url;
    }


    /**
     * Формат вывода дат
     *
     * @return string
     */
    protected function dateFormat()
    {
        return 'Y-m-d';
    }


    /**
     * Получение формата вывода дат
     *
     * @return string
     */
    final public function getDateFormat()
    {
        if (is_null($this->date_format)) {
            $this->date_format = $this->dateFormat();
        }
        return $this->date_format;
    }


    /**
     * Поля типа "Дата"
     *
     * @return array
     */
    protected function dates()
    {
        return [];
    }


    /**
     * Получение полей типа "Дата"
     *
     * @return array
     */
    final public function getDates()
    {
        if (is_null($this->dates)) {
            $this->dates = $this->dates();
        }
        return $this->dates;
    }
}
