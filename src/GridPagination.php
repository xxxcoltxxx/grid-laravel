<?php

namespace Paramonov\Grid;

class GridPagination
{
    protected $limits;
    protected $page;
    protected $default;

    /**
     * GridPagination constructor.
     *
     * @param array $limits
     * @param int   $page
     * @param int   $default_index
     */
    public function __construct(array $limits = [10, 25, 50], $page = 1, $default_index = 0)
    {
        $this->limits = $limits;
        $this->page = $page;
        $this->default = $limits[0];
        $this->default = $limits[$default_index];
    }

    /**
     * @return array
     */
    public function getLimits()
    {
        return $this->limits;
    }

    /**
     * @return int
     */
    public function getDefault()
    {
        return $this->default;
    }

    /**
     * @return int
     */
    public function getLimit()
    {
        if (isset($_COOKIE['data_provider'])) {
            $data_provider = json_decode($_COOKIE['data_provider'], true);
            if ($limit = (int) array_get($data_provider, 'pagination.items_per_page')) {
                return $limit;
            }
        }

        return $this->getDefault();
    }
}
