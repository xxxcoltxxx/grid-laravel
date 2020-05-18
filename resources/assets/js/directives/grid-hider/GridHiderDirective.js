import GridHiderController from "./GridHiderController";

export default class GridHiderDirective {
    constructor() {
        this.scope = {
            provider: '<'
        };
        this.controller = GridHiderController;
        this.controllerAs = 'gridHider';
        this.bindToController = true;
        this.template = `
            <span data-auto-close="outsideClick" dropdown-append-to-body uib-dropdown>
                <a class="btn btn-white btn-sm grid-btn" id="grid-hider" uib-dropdown-toggle uib-tooltip="{{:: $root.lang('grid.column-hider') }}" tooltip-placement="top-right">
                    <i class="fa fa-cog"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="grid-hider" uib-dropdown-menu>
                    <li ng-repeat="column in gridHider.provider.columns">
                        <a href ng-click="gridHider.toggle(column)">
                            <i class="fa fa-check" ng-class="{'invisible': ! column.selected}"></i>
                            {{:: column.title }}
                        </a>
                    </li>
                    <li class="divider"></li>
                    <li>
                        <a href ng-click="gridHider.resetToDefaults()">
                            <i class="fa fa-repeat"></i>
                            {{:: $root.lang('grid.reset-columns') }}
                        </a>
                    </li>
                </ul>
            </span>
        `;
    }
}
