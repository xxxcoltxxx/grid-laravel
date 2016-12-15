/**
 * @property {GridDataProvider} provider
 */
export default class GridPaginationController {

    /**
     * Устанавливает количество отображаемых строк на одной странице
     *
     * @param count
     */
    setItemsPerPage(count) {
        this.provider.pagination.items_per_page = count;
        this.provider.load();
    }
}

