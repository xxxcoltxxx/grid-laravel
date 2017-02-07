import GridColumnController from "./GridColumnController";

export default class GridColumnDirective {
    constructor() {
        this.restrict = 'A';
        this.scope = {
            provider: '<',
            field: '@',
            title: '<',
            defaultHidden: '<',
            textOnly: '<'
        };
        this.controller = GridColumnController;
        this.controllerAs = 'columnCtrl';
        this.bindToController = true;
        this.template = `
            <span ng-if=":: columnCtrl.textOnly" ng-bind=":: columnCtrl.title" class="text-nowrap text-center"></span>
            <a ng-if=":: ! columnCtrl.textOnly" href="" ng-click="columnCtrl.sort()" class="text-nowrap text-center" ng-class="{'text-muted': columnCtrl.provider.sorting.field != columnCtrl.field}">
                <span ng-bind=":: columnCtrl.title"></span>
                <i class="fa" ng-class="{
                    'fa-caret-up': columnCtrl.provider.sorting.dir == 'asc',
                    'fa-caret-down': columnCtrl.provider.sorting.dir == 'desc'
                }"></i>
            </a>
        `;
    }
}
