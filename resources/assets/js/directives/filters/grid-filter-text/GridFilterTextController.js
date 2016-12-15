/**
 * @property {GridDataProvider} provider
 * @property {String} field
 */
export default class GridFilterTextController {
    constructor() {
        this.provider.search[this.field] = '';
    }

    clearSearch() {
        this.provider.search[this.field] = '';
        this.provider.load();
    }
}