import GridPagination from "../entities/GridPagination";

export default class IndexedDBService {
    /**
     * @param {$window} $window
     * @param {$q} $q
     */
    constructor($window, $q) {
        this.window = $window;
        this.q = $q;
        this.database = 'grids';
        this.version = 1;
        this.db = null;
    }

    connect() {
        return this.q((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
            } else {
                let request = this.window.indexedDB.open(this.database, this.version);

                request.onsuccess = event => {
                    this.db = event.target.result;
                    resolve(this.db);
                };

                request.onerror = event => {
                    reject(event);
                };

                request.onupgradeneeded = event => {
                    let db = event.target.result;
                    db.createObjectStore('grids', {keyPath: 'name', authIncrement: false});
                    return this.connect();
                }
            }
        });
    }

    /**
     * Конфиг грида
     *
     * @param {String} grid
     */
    gridConfig(grid) {
        return this.q((resolve, reject) => {
            this.connect().then(db => {
                let request = db.transaction(['grids'], 'readonly')
                    .objectStore('grids')
                    .get(grid);

                request.onsuccess = event => {
                    resolve(event.target.result);
                };

                request.onerror = event => {
                    reject(event);
                };
            }).catch(e => reject(e));
        })
    }

    /**
     * Сохранение данных грида
     *
     * @param {GridDataProvider} provider
     * @returns {Promise}
     */
    storeConfig(provider) {
        let data = {
            extended_search: provider.extended_search,
            sorting: {
                field: provider.sorting.field,
                dir: provider.sorting.dir,
            },
            pagination: {
                page: provider.pagination.page,
                items_per_page: provider.pagination.items_per_page
            },
            search: provider.search,
            hider: provider.columns,
            show_mode: provider.show_mode
        };

        return this.q((resolve, reject) => {
            this.connect().then(db => {
                let transaction = db.transaction(['grids'], 'readwrite');
                let request = transaction.objectStore('grids');
                let configRequest = request.get(provider.name);

                configRequest.onsuccess = event => {
                    for (let item in data) {
                        if (data[item] instanceof Object) {
                            for (let field in data[item]) {
                                if (
                                    data[item][field] instanceof Object &&
                                    data[item][field].hasOwnProperty('startDate') &&
                                    data[item][field].startDate !== null &&
                                    ! (data[item][field] instanceof Date)
                                ) {
                                    data[item][field].startDate = new Date(data[item][field].startDate);
                                    data[item][field].endDate = new Date(data[item][field].endDate);
                                }
                            }
                        }
                    }
                    request.put({name: provider.name, data: data});
                    resolve(event.target.result);
                };

                configRequest.onerror = event => {
                    request.add(data);
                    reject(event);
                };
            });
        });
    }

    /**
     * Загрузка конфига в провайдер
     *
     * @param {GridDataProvider} provider
     */
    loadConfig(provider) {
        return this.q((resolve, reject) => {
            this.gridConfig(provider.name).then(config => {

                if (! config) {
                    resolve();
                    return true;
                }

                provider.timeout(() => {
                    if (config.data.extended_search) {
                        provider.extended_search = config.data.extended_search;
                    }

                    if (config.data.sorting) {
                        provider.sorting = config.data.sorting;
                    }

                    if (config.data.pagination) {
                        provider.pagination = new GridPagination(
                            config.data.pagination.items_per_page,
                            config.data.pagination.page,
                            config.data.pagination.items_per_page * config.data.pagination.page
                        );
                    }

                    if (config.data.search) {
                        provider.search = config.data.search;
                    }

                    if (config.data.hider) {
                        provider.columns.forEach(column => {
                            config.data.hider.forEach(stored_column => {
                                if (stored_column.field != column.field) {
                                    return true;
                                }

                                column.selected = stored_column.selected;
                            })
                        });
                    }

                    if (! provider.show_mode && config.data.show_mode) {
                        provider.show_mode = config.data.show_mode;
                    }

                    resolve();
                });

                return true;
            });
        });
    }
}

IndexedDBService.$inject = ['$window', '$q'];
