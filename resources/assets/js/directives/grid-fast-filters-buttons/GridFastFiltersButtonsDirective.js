import GridFastFiltersButtonsController from "./GridFastFiltersButtonsController";

export default class GridFastFiltersButtonsDirective {
    constructor() {
        this.restrict = 'A';
        this.scope = {
            provider: '<',
        };
        this.controller = GridFastFiltersButtonsController;
        this.controllerAs = 'fastFiltersButtonsCtrl';
        this.bindToController = true;
        this.template = `
            <div class="btn-group btn-group-sm only-wide" role="group">
                <button type="button" class="btn btn-default"
                        ng-repeat="filter in :: fastFiltersButtonsCtrl.provider.fast_filters"
                        ng-class="{active: filter.is_active}"
                        ng-click="fastFiltersButtonsCtrl.provider.applyFastFilter(filter)"
                        ng-if="filter.visible"
                >
                    <span ng-bind=":: filter.title"></span>
                    <span ng-if="filter.count !== null">({{ filter.count }})</span>
                </button>
            </div>
        `;
    }
}
