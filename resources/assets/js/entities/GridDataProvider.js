import angular from 'angular';
import GridPagination from "./GridPagination";
import GridSorting from "./GridSorting";
import Tree from "./Tree";

export const MODE_LIST = 1;
export const MODE_TREE = 2;
export const LIMIT_VISIBLE = 50;
export const LIMIT_LOADING = 25;

export default class GridDataProvider {

    /**
     * @param {IndexedDBService} indexedDBService
     * @param {$q} $q
     * @param {$http} $http
     * @param {$timeout} $timeout
     * @param {String} url
     */
    constructor(indexedDBService, $q, $http, $timeout, url) {
        // Сервисы
        this.indexedDBService = indexedDBService;
        this.q = $q;
        this.http = $http;
        this.timeout = $timeout;

        /**
         * Url для загрузки грида
         *
         * @type {String}
         */
        this.url = url;
        this.root = {id: null};
        this.constants = {
            LIMIT_VISIBLE,
            LIMIT_LOADING
        };

        this.init();
    }

    set container_selector(value) {
        this.selector = '#' + value + '-container';
    }

    get container() {
        return $(this.selector);
    }

    csv() {
        let params = {
            type: 'csv',
            search: JSON.stringify(this.search),
            column_names: JSON.stringify(this.column_names),
            headers: JSON.stringify(this.headers),
            sorting: JSON.stringify(this.sorting),
        };

        location.href = `${this.url}?${this.encodeQueryData(params)}`;
    }

    encodeQueryData(data) {
        let ret = [];
        for (let d in data)
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
        return ret.join('&');
    }


    /**
     * Переключение состояния отображения фильтров колонок
     */
    toggleExtendedSearch() {
        this.extended_search = ! this.extended_search;
        this.cacheGridChanges();
    }


    /**
     * Пересчет css-классов колонок грида для их отображения/скрытия
     */
    updateColumnClasses() {
        this.timeout(() => {
            this.column_classes = {};
            this.columns.forEach((column, i) => {
                this.headers[column.field] = column.title;
                this.column_names[i] = column.field;
                this.column_classes[`column-hide-${i + 1}`] = ! column.selected;
            });

            this.cacheGridChanges();
        });
    }


    /**
     * Загрузка конфига грида с сервера
     *
     * @returns {Promise}
     */
    loadConfig() {
        return this.q(resolve => {
            return this.http
                .get(this.url, {params: {type: 'config'}})
                .then(response => {
                    this.default_filters = response.data.default_filters;
                    this.name = `${response.data.name}${this.name}`;
                    this.timeout(() => {
                        angular.copy(this.default_filters, this.search);
                    });

                    return true;
                })
                .then(() => this.indexedDBService.loadConfig(this)
                    .then(() => resolve())
                    .catch(() => resolve())
                )
                .catch(() => resolve());
        });
    }


    /**
     * Сохранение конфига
     *
     * @returns {Promise}
     */
    cacheGridChanges() {
        return this.indexedDBService.storeConfig(this);
    }

    /**
     * Загрузка строк грида
     *
     * @returns {Promise}
     */
    load(fetch_data = true) {
        this.loaded = false;

        if (! this.show_mode) {
            this.show_mode = MODE_LIST;
        }

        return this.cacheGridChanges().then(config => {

            if (this.show_mode == MODE_TREE) {

                console.debug('Загрузка дерева...');
                return this.loadTree().then(() => {
                    console.debug('Загрузка данных для дерева...');
                    if (! fetch_data) {
                        this.loaded = true;
                        return true;
                    }

                    return this.tree.moveTree().then(() => {
                        this.loaded = true;
                    });
                });
            }

            console.debug('Загрузка строк...');
            return this.http
                .get(this.url, {params: {
                    type: 'json',
                    sorting: {
                        field: this.sorting.field,
                        dir: this.sorting.dir,
                    },
                    pagination: {
                        current_page: this.pagination.page,
                        items_per_page: this.pagination.items_per_page
                    },
                    search: this.search
                }})
                .then(response => {
                    this.timeout(() => {
                        this.loaded = true;
                        this.items = response.data.items;

                        let { page, limit, total } = response.data.pagination;
                        if (this.pagination instanceof GridPagination) {
                            this.pagination.fill(limit, page, total);
                        } else {
                            this.pagination = new GridPagination(limit, page, total);
                        }

                        let { field, dir } = response.data.sorting;
                        this.sorting = new GridSorting(field, dir);
                        console.debug('Готово');
                    });
                });
        });
    }

    /**
     * Сброс значения фильтра на значение по-умолчанию
     *
     * @param {?String} field
     * @param {?*} default_value
     */
    resetSearch(field = null, default_value = null) {
        if (field) {
            if (this.default_filters.hasOwnProperty(field)) {
                this.search[field] = angular.copy(this.default_filters[field]);
            } else {
                this.search[field] = default_value;
            }
        } else {
            angular.copy(this.default_filters, this.search);
        }

        this.load();
    }

    /**
     * Установка режима отображения
     *
     * @param {?number} mode
     * @param fetch_data
     */
    setMode(mode = null, fetch_data = true) {
        let old_mode = this.show_mode;

        if (mode == null) {
            if (this.show_mode == MODE_LIST) {
                this.show_mode = MODE_TREE;
            } else {
                this.show_mode = MODE_LIST;
            }
        } else {
            this.show_mode = mode;
        }

        if (this.show_mode == old_mode) {
            let q = this.q.defer();
            q.resolve();

            return q.promise;
        } else {
            return this.load(fetch_data);
        }
    }

    /**
     * Загрузка дерева
     *
     * @returns {Promise}
     */
    loadTree() {
        return this.q(resolve => {
            if (this.tree !== null) {
                console.debug('Дерево уже было загружено');
                resolve();
                return;
            }

            this.http
                .get(this.url, {params: {type: 'tree'}})
                .then(response => {
                    console.debug('Построение дерева...');
                    this.tree = new Tree(this, response.data, this.root);
                    console.debug('Дерево построено');
                    resolve();
                })
        });
    }


    /**
     * Инициализация и запуск
     */
    init() {

        /**
         * Список данных для строк грида
         *
         * @type {Object[]}
         */
        this.items = [];

        /**
         * Параметры пагинации
         *
         * @type {GridPagination}
         */
        this.pagination = {};

        /**
         * Параметры сортировки
         *
         * @type {GridSorting}
         */
        this.sorting = {};

        /**
         * Состояние отображения расширенного поиска
         *
         * @type {boolean}
         */
        this.extended_search = false;

        /**
         * Фильтра по-умолчанию
         *
         * @type {Object.<String, *>}
         */
        this.default_filters = {};

        /**
         * Имя грида
         *
         * @type {string}
         */
        this.name = 'Grid';

        /**
         * Индикатор загрузки
         *
         * @type {boolean}
         */
        this.loaded = false;

        /**
         * @type {?Tree} Дерево элементов
         **/
        this.tree = null;

        /**
         * Режим просмотра
         *
         * @type {number}
         */
        this.show_mode = null;

        /**
         * Колонки грида
         *
         * @type {Array.<Column>}
         */
        this.columns = [];

        /**
         * Заголовки колонок (для выгрузки в csv)
         *
         * @deprecated
         * @type {Object.<String, String>}
         */
        this.headers = {};

        /**
         * Алиасы колонок
         *
         * @type {String[]}
         */
        this.column_names = [];

        /**
         * Значения фильтров
         *
         * @type {Object.<String, *>}
         */
        this.search = {};

        /**
         * Режимы просмотра
         *
         * @type {{list: number, tree: number}}
         */
        this.modes = {
            list: MODE_LIST,
            tree: MODE_TREE
        };
    }

    run(fetch_data = false) {
        return this.loadConfig().then(response => {
            if (fetch_data) {
                fetch_data = fetch_data();
            } else {
                fetch_data = true;
            }
            let load = this.load(fetch_data);
            this.updateColumnClasses();
            return load;
        });
    }
}
