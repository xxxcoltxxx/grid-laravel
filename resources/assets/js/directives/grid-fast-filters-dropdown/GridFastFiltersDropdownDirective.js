import GridFastFiltersDropdownController from "./GridFastFiltersDropdownController";

export default class GridFastFiltersDropdownDirective {
    constructor() {
        this.restrict = 'A';
        this.scope = {
            provider: '<',
        };
        this.controller = GridFastFiltersDropdownController;
        this.controllerAs = 'fastFiltersCtrl';
        this.bindToController = true;
        this.template = `
            <span data-auto-close="outsideClick" dropdown-append-to-body uib-dropdown>
                <a class="btn btn-white btn-sm grid-btn" id="grid-fast-filters" uib-dropdown-toggle uib-tooltip="{{:: $root.lang('grid.grid-fast-filters') }}" tooltip-placement="top-right">
                    <i class="fa fa-wrench"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="grid-fast-filters" uib-dropdown-menu>
                    <li ng-repeat="filter in fastFiltersCtrl.provider.fast_filters" ng-if="filter.can_hide">
                        <a href ng-click="filter.toggle()">
                            <i class="fa fa-check" ng-class="{'invisible': ! filter.visible}"></i>
                            {{:: filter.title }}
                        </a>
                    </li>
                </ul>
            </span>
        `;
    }
}
