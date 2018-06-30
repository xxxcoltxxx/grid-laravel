import GridFilterSelectController from "../grid-filter-select/GridFilterSelectController";

/**
 * @property {GridDataProvider} provider
 * @property {Array.<Object>} items
 * @property {String} field
 * @property {String} uniqueKey
 * @property {String} value
 * @property {String} placeholder
 */
export default class GridFilterMultiSelectController extends GridFilterSelectController {

    initModel() {
        this.normalizeField();
    }

    toggle(item) {
        this.normalizeField();
        if (! item) {
            this.provider.search[this.field] = [];
        }

        let index = this.provider.search[this.field].findIndex(model => angular.equals(item[this.uniqueKey], model));

        if (index > -1) {
            this.provider.search[this.field].splice(index, 1);
        } else {
            this.provider.search[this.field].push(item[this.uniqueKey]);
        }

        this.provider.load();
    }

    reorder() {
        if (! this.reorderOnOpen) {
            return;
        }
        this.normalizeField();

        this.items.sort((a, b) => {
            let has_a = this.provider.search[this.field].indexOf(a[this.uniqueKey]) > -1;
            let has_b = this.provider.search[this.field].indexOf(b[this.uniqueKey]) > -1;

            if (has_a == has_b) {
                return a[this.value] > b[this.value] ? 1 : -1;
            }

            if (has_a) {
                return -1;
            }

            if (has_b) {
                return 1;
            }
        });
    }

    normalizeField() {
        if (! this.provider.search[this.field] || typeof this.provider.search[this.field] != 'object') {
            this.provider.search[this.field] = [];
        }
    }

    selected(item) {
        if (! this.provider.search[this.field]) {
            return false;
        }

        return !! this.provider.search[this.field].find(model => angular.equals(item[this.uniqueKey], model));
    }

    displayLabel() {
        this.normalizeField();
        if (! this.provider.search[this.field]) {
            return this.placeholder;
        }

        if (this.provider.search[this.field].length === 0) {
            return this.placeholder;
        }

        if (this.provider.search[this.field].length > 1) {
            return this.valuesText.replace('%n', this.provider.search[this.field].length.toString());
        }

        let values = [];
        this.provider.search[this.field].forEach(model => {
            let item = this.items.find(item => angular.equals(item[this.uniqueKey], model));
            values.push(item[this.value]);
        });

        return values.join(', ');
    }
}

GridFilterMultiSelectController.$inject = ['$timeout'];