export default class GridPagination {
    /**
     * @param {number} page
     * @param {number} total
     * @param {Array.<Number>} variants
     * @param {number} items_per_page
     */
    constructor(items_per_page, page, total, variants = [10, 25, 50]) {
        this.fill(items_per_page, page, total, variants);
    }

    fill(items_per_page, page, total, variants = null) {
        this.items_per_page = items_per_page;
        this.page = page;
        this.total = total;
        if (variants) {
            this.variants = variants;
        }
    }
}
