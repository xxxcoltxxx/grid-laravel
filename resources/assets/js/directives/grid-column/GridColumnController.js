import Column from "../../entities/Column";

/**
 * @property {GridDataProvider} provider
 * @property {String} title
 * @property {String} field
 */
export default class GridColumnController {
    constructor() {
        if (! this.provider.columns.find(column => column.field == this.field)) {
            this.provider.columns.push(new Column(this.field, this.title, !!this.defaultHidden));
        }
    }

    sort() {
        if (this.provider.sorting.field == this.field) {
            this.provider.sorting.dir = this.provider.sorting.dir == 'asc' ? 'desc' : 'asc';
        }
        this.provider.sorting.field = this.field;
        this.provider.load();
    }

    filtered() {
        var value = this.provider.search[this.field];

        if (! value) {
            return false;
        }

        if (value instanceof Array) {
            return value.length;
        }

        if (typeof value === 'object' && value.hasOwnProperty('startDate')) {
            return value.startDate;
        }

        return !! value;
    }
}
