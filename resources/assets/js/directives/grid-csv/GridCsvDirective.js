export default class GridCsvDirective {
    constructor() {
        this.scope = {
            provider: '<'
        };

        this.template = `
            <form action="{{ provider.url }}">
                <button class="btn btn-white btn-sm grid-btn" type="submit" uib-tooltip="{{:: $root.lang('system.form.btn.download') }}" tooltip-placement="top-right">
                    <i class="fa fa-download"></i>
                </button>

                <input type="hidden" name="type" value="csv" />
                <input type="hidden" name="search" ng-value="provider.search | json" />
                <input type="hidden" name="column_names" ng-value="provider.column_names | json"/>
                <input type="hidden" name="headers" ng-value="provider.headers | json" />
                <input type="hidden" name="sorting" ng-value="provider.sorting | json" />
            </form>
        `;
    }
}