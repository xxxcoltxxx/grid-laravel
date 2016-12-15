/**
 * @property {GridDataProvider} provider
 */
export default class GridHiderController {

    constructor($timeout) {
        this.timeout = $timeout;
    }

    /**
     * Скрывает/отображает колонку
     *
     * @param {Column} column
     */
    toggle(column) {
        column.selected = ! column.selected;
        this.provider.columnsClasses();
    }

    resetToDefaults() {
        this.timeout(() => {
            this.provider.columns.forEach(column => column.selected = ! column.default_hidden);
            this.provider.columnsClasses();
        });
    }
}

GridHiderController.$inject = ['$timeout'];
