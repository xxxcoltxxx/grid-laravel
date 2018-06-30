import {is_empty} from "../utils";
const DEFAULT_VISIBLE = 1;
const DEFAULT_HIDDEN = 2;
const DEFAULT_VISIBLE_WHEN_EXISTS = 3;

/**
 * @property {boolean,null} checked
 * @property {number,null} checked
 * @property {Array.<number>} default_modes
 */
export default class GridFastFilter {
    /**
     * @param {GridDataProvider} provider
     * @param {String} alias
     * @param {String} title
     * @param {Array} search
     * @param {number} default_mode
     */
    constructor(provider, alias, title, search, default_mode) {
        this.provider = provider;
        this.alias = alias;
        this.title = title;
        this.default_mode = default_mode ? default_mode : DEFAULT_VISIBLE;
        this.checked = null;
        this.count = null;
        this.search = {
            ...angular.copy(this.provider.default_filters),
            ...angular.copy(search)
        };

        for (let sub_field of ['startDate', 'endDate']) {
            for (let [field, value] of Object.entries(this.search)) {
                if (value.hasOwnProperty(sub_field) && value[sub_field]) {
                    this.search[field][sub_field] = new Date(value[sub_field]);
                }
            }
        }

        this.default_modes = {
            DEFAULT_VISIBLE,
            DEFAULT_HIDDEN,
            DEFAULT_VISIBLE_WHEN_EXISTS,
        };
    }

    get can_hide() {
        return this.default_mode === DEFAULT_HIDDEN;
    }

    get is_active() {
        for (let [first, second] of [[this.search, this.provider.search], [this.provider.search, this.search]]) {
            for (let [field, value] of Object.entries(first)) {
                if (! second.hasOwnProperty(field)) {
                    if (is_empty(value)) {
                        continue;
                    }

                    return false;
                }

                if (! angular.equals(second[field], value)) {
                    return false;
                }
            }
        }

        return true;
    }

    toggle() {
        this.checked = ! this.visible;
        this.provider.enableStoreFastFilters();
        this.provider.cacheGridChanges();
    }

    /**
     * @returns {boolean}
     */
    get visible() {
        if (this.can_hide && this.checked !== null) {
            return !! this.checked;
        }

        return this.default_mode === DEFAULT_VISIBLE ||
                this.default_mode === DEFAULT_VISIBLE_WHEN_EXISTS && this.count > 0;
    }
}
