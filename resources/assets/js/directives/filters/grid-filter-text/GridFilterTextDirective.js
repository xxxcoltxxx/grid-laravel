import GridFilter from "../GridFilter";
import GridFilterTextController from "./GridFilterTextController";

export default class GridFilterTextDirective extends GridFilter {
    constructor() {
        super();

        this.scope = {
            ...this.scope,
            field: '@'
        };

        this.controller = GridFilterTextController;
        this.controllerAs = 'textCtrl';
        this.bindToController = true;

        this.template = `
            <div class="grid-text">
                <input class="input-sm form-control grid-text__input" type="text" ng-model="textCtrl.provider.search[textCtrl.field]" ng-change="textCtrl.provider.load()" />
                <span class="grid-label__clear" ng-click="textCtrl.clearSearch()"><i class="fa fa-remove"></i></span>
            </div>
        `
    }
}