angular.module('ngGrid', ['ui.bootstrap', 'daterangepicker', 'ngCookies', 'ngSanitize', 'angular-bootstrap-select'])
    .directive('ngGrid', function () {
        return {
            restrict: 'A',
            controller: ['$scope', '$http', '$cookies', '$timeout', '$q', '$sce', function ($scope, $http, $cookies, $timeout, $q, $sce) {
                $scope.data_provider = {
                    search: {},
                    sorting: {},
                    pagination: {
                        current_page: 1,
                        items_per_page: '10'
                    }
                };

                $scope.trustAsHtml = function (string) {
                    return $sce.trustAsHtml(string);
                };

                $scope.columns_hider = [];
                $scope.data_url = "";

                $scope.loading = false;
                $scope.loading_opacity = 0;

                var ajaxDelayTimeout = 300,
                    ajaxDelay = false,
                    canceler = $q.defer(),
                    min_opacity = 0,
                    max_opacity = 0.8;

                // Pagination
                $scope.totalItems = 0;
                $scope.maxSize = 5;

                $scope.loadGrid = function () {
                    if (ajaxDelay) {
                        $timeout.cancel(ajaxDelay);
                        $scope.loading = false;
                    }
                    ajaxDelay = $timeout(loadGrid, ajaxDelayTimeout);
                };


                $scope.showHideFilters = function () {
                    $scope.show_filters = !$scope.show_filters;
                    saveParamsToCookies();
                };


                $scope.sort = function ($event, field) {
                    $event.preventDefault();
                    if (field == $scope.data_provider.sorting.field) {
                        $scope.data_provider.sorting.dir = $scope.data_provider.sorting.dir == 'asc' ? 'desc' : 'asc';
                    } else {
                        $scope.data_provider.sorting.field = field;
                    }
                    return false;
                };

                $scope.showColumn = function (column) {
                    return $scope.columns_hider.indexOf(column) > -1;
                };

                $scope.clearPicker = function (scope) {
                    var counter = 0;
                    var element = $scope.data_provider.search;
                    var splitted = scope.split('.');
                    for (var i in splitted) {
                        counter++;
                        if (counter == splitted.length) {
                            break;
                        }
                        element = element[splitted[i]];
                    }

                    element[splitted.pop()] = {startDate: null, endDate: null};
                };

                $scope.defaultSearchPicker = function (scope) {
                    if ($scope.data_provider.search[scope] == undefined) {
                        $scope.data_provider.search[scope] = {startDate: null, endDate: null};
                    }
                };

                function loadGrid() {
                    canceler.resolve();
                    canceler = $q.defer();
                    saveParamsToCookies();
                    $scope.loading = true;
                    $scope.loading_opacity = max_opacity;

                    var params = angular.merge({}, angular.fromJson(angular.toJson($scope.data_provider)), {
                        getData: true,
                        column_names: $scope.headers,
                        use_cookie: $scope.use_cookie
                    });
                    $http.get(
                        $scope.data_url,
                        {
                            params: params,
                            timeout: canceler.promise,
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        })
                        .then(
                            function (response) {
                                $scope.data = response.data.data;
                                $scope.total = response.data.total;
                                $scope.data_provider.pagination.items_per_page = response.data.limit + '';
                                $scope.loading = false;
                                $scope.loading_opacity = min_opacity;
                                ajaxDelay = false;
                            }, function (response) {
                                ajaxDelay = false;
                            }
                        );
                }

                function saveParamsToCookies() {
                    if (!$scope.use_cookie) {
                        return;
                    }
                    var params = {
                        path: $scope.grid_name != 'grid' ? '/' : location.pathname ,
                        expires: new Date(+new Date + 14 * 24 * 60 * 60 * 1000)
                    };
                    $scope.setCookie('data_provider', angular.toJson($scope.data_provider), params);
                    $scope.setCookie('columnsHider', angular.toJson($scope.columns_hider), params);
                    $scope.setCookie('showFilters', angular.toJson($scope.show_filters), params);
                }

                function loadParamsFromCookies() {
                    try {
                        var data_provider = angular.fromJson($scope.getCookie('data_provider'));
                        if (data_provider) {
                            $scope.data_provider = angular.merge($scope.data_provider, data_provider);
                        }
                        $scope.show_filters = typeof $scope.getCookie('showFilters') == 'undefined' ? false : $scope.getCookie('showFilters') === 'true';
                    } catch (e) {

                    }
                    if ($scope.data_provider == undefined) {
                        $scope.data_provider = {};
                    }
                    if ($scope.data_provider.pagination == undefined) {
                        $scope.data_provider.pagination = {
                            current_page: 1,
                            items_per_page: '10'
                        };
                    }

                    if ($scope.data_provider.sorting != undefined && $scope.data_provider.sorting.field && $scope.headers ){

                        if (Object.keys($scope.headers).indexOf($scope.data_provider.sorting.field) == -1){
                            delete $scope.data_provider.sorting;
                        }

                    }

                    if ($scope.data_provider.sorting == undefined) {
                        $scope.data_provider.sorting = {
                            dir: $scope.default_sorting_dir,
                            field: $scope.default_sorting_field
                        }
                    }
                    $scope.data_provider.search = angular.merge({}, $scope.default_filters, $scope.data_provider.search);
                }

                $scope.getCookie = function (cookie_name) {
                    return $cookies.get($scope.grid_name + '-' + cookie_name);
                }
                $scope.setCookie = function (cookie_name, value, params) {
                    $cookies.put($scope.grid_name + '-' + cookie_name, value, params);
                }

                $scope.loadHider = function (params, grid_name) {
                    $scope.grid_name = grid_name;
                    if (!$scope.use_cookie) {
                        $scope.columns_hider = params;
                        return;
                    }
                    try {
                        var columns_hider = angular.fromJson($scope.getCookie('columnsHider'));
                        if (columns_hider) {
                            $scope.columns_hider = columns_hider;
                        } else {
                            $scope.columns_hider = params;
                        }
                    } catch (e) {
                        $scope.columns_hider = params;
                    }
                };

                $timeout(function () {
                    if ($scope.use_cookie == 1) {
                        loadParamsFromCookies();
                    }

                    $scope.$watch('data_provider', function () {
                        $scope.loadGrid();
                    }, true);

                    $scope.$watch('columns_hider', function () {
                        saveParamsToCookies();
                    }, true);
                });
            }]
        }
    });
