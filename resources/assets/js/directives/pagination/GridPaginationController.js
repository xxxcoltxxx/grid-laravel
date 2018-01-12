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

    get start_number() {
        return (this.provider.pagination.page - 1) * this.provider.pagination.items_per_page + 1;
    }

    get end_number() {
        return Math.min(this.provider.pagination.page * this.provider.pagination.items_per_page, this.provider.pagination.total);
    }
}

