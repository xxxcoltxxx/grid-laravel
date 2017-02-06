import GridDataProvider from "../entities/GridDataProvider";

/**
 * @property {Object} grids
 * @property {GridDataProvider} grids.grid
 */
export default class GridService {
    /**
     * @param {IndexedDBService} IndexedDBService
     * @param {$q} $q
     * @param {$http} $http
     * @param {$timeout} $timeout
     */
    constructor(IndexedDBService, $q, $http, $timeout) {
        this.indexedDBService = IndexedDBService;
        this.q = $q;
        this.http = $http;
        this.timeout = $timeout;
        this.grids = {};
    }

    init(url, name = 'grid') {
        this.grids[name] = new GridDataProvider(this.indexedDBService, this.q, this.http, this.timeout, url);
        this.grids[name].container_selector = name;
    }
}

GridService.$inject = ['IndexedDBService', '$q', '$http', '$timeout'];
