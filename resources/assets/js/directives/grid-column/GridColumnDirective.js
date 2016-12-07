import GridColumnController from "./GridColumnController";

export default class GridColumnDirective {
    constructor() {
        this.restrict = 'A';
        this.scope = {
            provider: '<',
            field: '@',
            title: '<',
            defaultHidden: '<'
        };
        this.controller = GridColumnController;
        this.controllerAs = 'columnCtrl';
        this.bindToController = true;
        this.template = `
            <a href="" ng-click="columnCtrl.sort()" class="text-nowrap text-center" ng-class="{'text-muted': columnCtrl.provider.sorting.field != columnCtrl.field}">
                <span ng-bind=":: columnCtrl.title"></span>
                <i class="fa" ng-class="{
                    'fa-caret-up': columnCtrl.provider.sorting.dir == 'asc',
                    'fa-caret-down': columnCtrl.provider.sorting.dir == 'desc'
                }"></i>
            </a>
        `;
    }
}
