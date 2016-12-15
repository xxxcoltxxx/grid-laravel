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
            });
        })
    }

    /**
     * Конфиг грида
     *
     * @param {String} grid
     * @param {Object} data
     */
    storeConfig(grid, data) {
        return this.q((resolve, reject) => {
            this.connect().then(db => {
                let transaction = db.transaction(['grids'], 'readwrite');
                let request = transaction.objectStore('grids');
                let configRequest = request.get(grid);

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
                    request.put({name: grid, data: data});
                    resolve(event.target.result);
                };

                configRequest.onerror = event => {
                    request.add(data);
                    reject(event);
                };
            });
        });
    }
}

IndexedDBService.$inject = ['$window', '$q'];
