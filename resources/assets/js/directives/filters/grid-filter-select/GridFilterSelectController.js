const COUNT = 40;

/**
 * @property {GridDataProvider} provider
 * @property {Array.<Object>} items
 * @property {String} field
 * @property {String} uniqueKey
 * @property {String} value
 * @property {String} placeholder
 */
export default class GridFilterSelectController {
    /**
     * @param {$timeout} $timeout
     */
    constructor($timeout) {
        this.timeout = $timeout;
        this.search = '';
        this.filter_limit = 0;
        this.is_open = false;
        this.placeholder = '--//--';
        this.initModel();
    }

    /**
     * Инициализация модели
     */
    initModel() {
        if (! this.provider.search.hasOwnProperty(this.field)) {
            this.provider.search[this.field] = null;
        }
    }

    /**
     * Отобразить/скрыть список
     */
    toggleList() {
        this.timeout(() => {
            if (! this.is_open) {
                this.reorder();
            }
            this.is_open = ! this.is_open
        });
    }

    reorder() {
        this.items.sort((a, b) => {
            let has_a = this.provider.search[this.field] == a[this.uniqueKey];
            let has_b = this.provider.search[this.field] == b[this.uniqueKey];

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

    /**
     * Скрыть список
     */
    closeList() {
        if (! this.is_open) {
            return;
        }

        this.timeout(() => {
            this.is_open = false;
            this.clearFilter();
        });
    }

    /**
     * Очистка строки поиска по списку
     */
    clearFilter() {
        this.search = '';
    }

    /**
     * Выбирает/убирает из выбранных пунктов списка
     *
     * @param {Object} item
     */
    toggle(item) {
        if (item && item[this.uniqueKey] != this.provider.search[this.field]) {
            this.provider.search[this.field] = item[this.uniqueKey];
        } else {
            this.provider.search[this.field] = null;
        }


        this.provider.load();
    }

    /**
     * Автоподгрузка списка
     */
    scrolling() {
        if (this.items && this.filter_limit >= this.items.length) {
            return;
        }

        this.filter_limit += COUNT;
    }

    /**
     * Сброс на значение по умолчанию
     */
    resetToDefaults() {
        this.provider.resetSearch(this.field);
    }

    /**
     * Проверка, что элемент выбран
     *
     * @param {Object} item
     * @returns {boolean}
     */
    selected(item) {
        if (! this.provider.search[this.field]) {
            return false;
        }

        return item[this.uniqueKey] == this.provider.search[this.field];
    }

    /**
     * Отображение выбранного значения/значений
     *
     * @returns {String}
     */
    displayLabel() {
        if (! this.provider.search[this.field]) {
            return this.placeholder;
        }

        let item = this.items.find(item => item[this.uniqueKey] == this.provider.search[this.field]);

        return item ? item[this.value] : this.placeholder;
    }
}

GridFilterSelectController.$inject = ['$timeout'];
