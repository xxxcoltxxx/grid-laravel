import angular from 'angular';
import GridPagination from "./GridPagination";
import GridSorting from "./GridSorting";

export default class GridDataProvider {
    /**
     * @param {IndexedDBService} indexedDBService
     * @param {$q} $q
     * @param {$http} $http
     * @param {$timeout} $timeout
     * @param {String} url
     */
    constructor(indexedDBService, $q, $http, $timeout, url) {
        this.indexedDBService = indexedDBService;
        this.q = $q;
        this.http = $http;
        this.timeout = $timeout;
        this.url = url;
        this.items = [];
        this.pagination = {};
        this.sorting = {};
        this.extended_search = false;
        this.default_filters = {};
        this.name = 'Grid';
        this.loaded = false;

        /**
         * @type {Array.<Column>}
         */
        this.columns = [];
        this.headers = {};
        this.column_names = [];
        this.search = {};

        this.config().then(response => {
            this.load();
            this.columnsClasses();
        });
    }

    toggleExtendedSearch() {
        this.extended_search = ! this.extended_search;
        this.saveConfig();
    }

    columnsClasses() {
        this.timeout(() => {
            this.column_classes = {};
            this.columns.forEach((column, i) => {
                this.headers[column.field] = column.title;
                this.column_names[i] = column.field;
                this.column_classes[`column-hide-${i + 1}`] = ! column.selected;
            });
        });
        this.saveConfig();
    }

    config() {
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
                .then(() => {
                    this.indexedDBService.gridConfig(this.name).then(config => {

                        if (! config) {
                            resolve();
                            return true;
                        }

                        this.timeout(() => {
                            if (config.data.extended_search) {
                                this.extended_search = config.data.extended_search;
                            }

                            if (config.data.sorting) {
                                this.sorting = config.data.sorting;
                            }

                            if (config.data.pagination) {
                                this.pagination = new GridPagination(
                                    config.data.pagination.items_per_page,
                                    config.data.pagination.page,
                                    config.data.pagination.items_per_page * config.data.pagination.page
                                );
                            }

                            if (config.data.search) {
                                this.search = config.data.search;
                            }

                            if (config.data.hider) {
                                this.columns.forEach(column => {
                                    config.data.hider.forEach(stored_column => {
                                        if (stored_column.field != column.field) {
                                            return true;
                                        }

                                        column.selected = stored_column.selected;
                                    })
                                });
                            }

                            resolve();
                        });

                        return true;
                    });
                })
        });
    }

    saveConfig() {
        return this.indexedDBService.storeConfig(this.name, {
            extended_search: this.extended_search,
            sorting: {
                field: this.sorting.field,
                dir: this.sorting.dir,
            },
            pagination: {
                page: this.pagination.page,
                items_per_page: this.pagination.items_per_page
            },
            search: this.search,
            hider: this.columns
        });
    }

    load() {
        return this.saveConfig().then(config => {
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
                    });
                });
        });
    }

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
}
