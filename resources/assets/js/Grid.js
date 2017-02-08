import angular from 'angular';

import IndexedDBService from "./services/IndexedDBService";
import GridService from './services/GridService';

import GridPaginationDirective from "./directives/pagination/GridPaginationDirective";
import GridColumnDirective from "./directives/grid-column/GridColumnDirective";
import GridHiderDirective from "./directives/grid-hider/GridHiderDirective";
import GridFilterAllDirective from "./directives/filters/grid-filter-all/GridFilterAllDirective";
import GridFilterTextDirective from "./directives/filters/grid-filter-text/GridFilterTextDirective";
import GridFilterBooleanDirective from "./directives/filters/grid-filter-bollean/GridFilterBooleanDirective";
import GridFilterSelectDirective from "./directives/filters/grid-filter-select/GridFilterSelectDirective";
import GridFilterDateRangeDirective from "./directives/filters/grid-filter-date-range/GridFilterDateRangeDirective";
import GridFilterMultiSelectDirective from "./directives/filters/grid-filter-multi-select/GridFilterMultiSelectDirective";
import GridCsvDirective from "./directives/grid-csv/GridCsvDirective";
import GridCollapseButtonDirective from "./directives/grid-collapse-button/GridCollapseButtonDirective";
import GridTreeUpButtonDirective from "./directives/grid-tree-up-button/GridTreeUpButtonDirective";
import GridTreeDownButtonDirective from "./directives/grid-tree-down-button/GridTreeDownButtonDirective";
import GridTreeFilterAllDirective from "./directives/filters/grid-tree-filter-all/GridTreeFilterAllDirective";

angular
    .module('Grid', [])

    .service('IndexedDBService', IndexedDBService)
    .service('GridService', GridService)

    .directive('gridPagination', () => new GridPaginationDirective())
    .directive('gridColumn', () => new GridColumnDirective())
    .directive('gridHider', () => new GridHiderDirective())
    .directive('gridCsv', () => new GridCsvDirective())
    .directive('gridFilterAll', () => new GridFilterAllDirective())
    .directive('gridTreeFilterAll', () => new GridTreeFilterAllDirective())
    .directive('gridFilterText', () => new GridFilterTextDirective())
    .directive('gridFilterBoolean', () => new GridFilterBooleanDirective())
    .directive('gridFilterSelect', () => new GridFilterSelectDirective())
    .directive('gridFilterMultiSelect', () => new GridFilterMultiSelectDirective())
    .directive('gridFilterDateRange', () => new GridFilterDateRangeDirective())
    .directive('gridCollapseButton', () => new GridCollapseButtonDirective())
    .directive('gridTreeUpButton', () => new GridTreeUpButtonDirective())
    .directive('gridTreeDownButton', () => new GridTreeDownButtonDirective())

;
