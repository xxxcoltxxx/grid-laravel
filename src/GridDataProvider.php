<?php

namespace Paramonov\Grid;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

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
    private $default_filters;
    private $data_url;
    private $csv_url;
    private $date_format;
    private $dates;
    private $count;

    /**
     * @var string Название грида
     */
    protected $name = 'grid';

    /**
     * Запрос для выборки данных для таблицы.
     *
     * @return Builder
     */
    abstract protected function query();

    /**
     * Получение инстанса запроса.
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
     * Пагинация.
     *
     * @return GridPagination
     */
    protected function pagination()
    {
        return new GridPagination();
    }

    /**
     *  Получение кол-ва страниц.
     *
     * @return int
     */
    final public function getCount()
    {
        if (is_null($this->count)) {
            $this->count = $this->count();
        }

        return $this->count;
    }

    protected function count()
    {
        return $this->getQuery()->count();
    }

    /**
     * Получение класса пагинации.
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
     * Ключи массива должны совпадать с ключами массива из view.
     *
     * @return \Closure[]
     */
    abstract protected function filters();

    /**
     * Получение фильтров.
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
     * Сортировка по умолчанию.
     *
     * @return array
     */
    protected function defaultSorting()
    {
        return [
            'field' => 'id',
            'dir'   => 'asc',
        ];
    }

    /**
     * Получение сортировки по умолчанию.
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
     * url для подгрузки данных.
     *
     * @return string
     */
    protected function dataUrl()
    {
        return '';
    }

    /**
     * Получение url для подгрузки данных.
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
     * url для загрузки CSV-файла.
     *
     * @return string
     */
    protected function csvUrl()
    {
        return '';
    }

    /**
     * Получение url для загрузки CSV-файла.
     *
     * @return string
     */
    final public function getCsvUrl()
    {
        if (is_null($this->csv_url)) {
            $this->csv_url = $this->csvUrl();
        }

        return $this->csv_url;
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
     * Поля типа "Дата".
     *
     * @return array
     */
    protected function dates()
    {
        return [];
    }

    /**
     * Получение полей типа "Дата".
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

    /**
     * Фильтры по-умолчанию
     * Они применяются, если фильтры отсутствуют или пользователь сбросил все фильтры.
     *
     * @return array
     */
    protected function defaultFilters()
    {
        return [];
    }

    /**
     * Получение фильтров по-умолчанию.
     *
     * @return mixed
     */
    final public function getDefaultFilters()
    {
        if (is_null($this->default_filters)) {
            $this->default_filters = array_merge($this->getDefaultDates(), $this->defaultFilters());
        }

        return $this->default_filters;
    }

    /**
     * Получение фильтров по-умолчанию для полей типа "дата"
     * Поля с возможностью выбора периода должны быть с полями startDate, endDate, иначе в консоли сыпятся ошибки.
     *
     * @return array
     */
    private function getDefaultDates()
    {
        $filters = [];
        foreach ($this->getDates() as $field) {
            array_set($filters, $field, ['startDate' => null, 'endDate' => null]);
        }

        return $filters;
    }

    /**
     * Метод для конвертации полученных из БД данных в данные, которые должны вернуться для грида.
     *
     * @param $item
     *
     * @return array
     */
    public function transform($item)
    {
        $data = [];
        if ($item instanceof Model) {
            $item = $item->toArray();
        }
        foreach ($item as $key => $value) {
            $key = $this->decodeField($key);
            if ($this->getDateFormat() && in_array($key, $this->getDates())) {
                $value = $value ? Carbon::parse($value)->format($this->getDateFormat()) : null;
            }
            $pairs = explode('.', $key);
            if (count($pairs) > 1) {
                $data [$pairs[0]] [$pairs[1]] = $value;
            } else {
                $data [$key] = $value;
            }
        }

        return $data;
    }

    private function decodeField($field)
    {
        return str_replace(':', '.', $field);
    }

    final public function setName($name)
    {
        $this->name = $name;
    }

    final public function getName()
    {
        return $this->name;
    }
}
