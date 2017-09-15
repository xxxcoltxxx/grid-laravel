import GridFilter from "../GridFilter";

export default class GridFilterAllDirective extends GridFilter {

    constructor() {
        super();

        this.scope = {
            ...this.scope,
            hideExtended: '<'
        }

        this.template = `
            <div class="input-group input-group-sm">
                <input class="form-control" type="text" ng-model="provider.search.all" placeholder="{{:: $root.lang('grid.search-all') }}" ng-change="provider.load()" />
                <span class="input-group-btn">
                    <span class="btn btn-default" ng-click="provider.resetSearch()">
                        <i class="fa fa-remove"></i>
                    </span>
                    <span ng-if="! hideExtended" uib-tooltip="{{:: lang('system.form.labels.extended-search') }}" ng-click="provider.toggleExtendedSearch()" class="btn btn-default">
                        <i ng-class="{'fa-search-minus' : provider.extended_search, 'fa-search-plus' : ! provider.extended_search }" class="fa "> </i>
                    </span>
                </span>
            </div>
        `;
    }
}
