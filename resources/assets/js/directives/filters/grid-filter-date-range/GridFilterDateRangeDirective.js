import GridFilter from "../GridFilter";

/**
 * @property {GridDataProvider} provider
 */
class GridFilterDateRange {
    /**
     * @param {$rootScope} $rootScope
     */
    constructor($rootScope) {
        this.rootScope = $rootScope;

        this.options = {
            'showDropdowns': true,
            'showWeekNumbers': true,
            'autoApply': true,
            'linkedCalendars': false,
            'opens': 'left',
            'eventHandlers': {
                'apply.daterangepicker': (ev, picker) => this.load()
            },
            'locale': {
                'format': this.rootScope.lang('datetimes.formats.date.datepicker'),
                'daysOfWeek': this.rootScope.lang('datetimes.daysOfWeek'),
                'monthNames': this.rootScope.lang('datetimes.monthNames'),
                'firstDay': this.rootScope.lang('datetimes.firstDay')
            }
        };
    }

    clear() {
        this.provider.search[this.field] = {startDate: null, endDate: null};
        this.load();

    }

    load() {
        this.provider.load();
    }
}

GridFilterDateRange.$inject = ['$rootScope'];

export default class GridFilterDateRangeDirective extends GridFilter {
    constructor() {
        super();
        this.controller = GridFilterDateRange;
        this.controllerAs = 'dateCtrl';
        this.bindToController = true;
        this.scope = {
            ...this.scope,
            field: '@'
        };

        this.template = `
            <div class="grid-date-range">
                <input type="text" class="grid-date-range__input"
                       date-range-picker
                       ng-init="dateCtrl.provider.search[dateCtrl.field] = {startDate: null, endDate: null}"
                       options="dateCtrl.options"
                       ng-model="dateCtrl.provider.search[dateCtrl.field]"
                />
                
                <span class="grid-label__clear" ng-click="dateCtrl.clear()">
                    <i class="fa fa-remove"></i>
                </span>
            </div>
        `;
    }
}
