import GridFilter from "../GridFilter";
import GridFilterSelectController from './GridFilterSelectController';

export default class GridFilterSelectDirective extends GridFilter {
    constructor() {
        super();

        this.scope = {
            ...this.scope,
            items: '<',
            field: '@',
            uniqueKey: '@',
            value: '@',
            placeholder: '@',
            multiple: '<',
            valuesText: '@',
            hideResetButton: '<',
            hideLiveSearch: '<',
            reorderOnOpen: '<'
        };

        this.controller = GridFilterSelectController;
        this.controllerAs = 'selectCtrl';
        this.bindToController = true;

        this.template = `
            <span class="grid-select">
                <div class="grid-select__label-container">
                    <div class="grid-select__label" ng-click="selectCtrl.toggleList()">
                        <span class="grid-select__title" ng-bind="selectCtrl.displayLabel()"></span>
                        <span class="grid-select__caret"><i class="caret"></i></span>
                    </div>
                    <div class="grid-label__clear" ng-click="selectCtrl.resetToDefaults()" ng-if="! selectCtrl.hideResetButton">
                        <i class="fa fa-remove"></i>
                    </div>
                
                    <div auto-position=".grid-select__label-container" ng-if="selectCtrl.is_open">
                        <div outside-click="selectCtrl.closeList()" class="grid-select__list-container ng-hide" ng-show="selectCtrl.is_open">
                            <div class="grid-select__searchbox" ng-if="! selectCtrl.hideLiveSearch">
                                <input type="text" ng-model="selectCtrl.search" ng-change="filter()" class="grid-select__searchbox-input" focus-me="selectCtrl.is_open" />
                                <span class="grid-label__clear" ng-click="selectCtrl.clearFilter()"><i class="fa fa-remove"></i></span>
                            </div>
                            
                            <div when-scroll-ends="selectCtrl.scrolling()" class="grid-select__list">
                                <div class="grid-select__list-item" ng-click="selectCtrl.toggle(item)" ng-repeat="item in selectCtrl.items | filter: selectCtrl.search | limitTo: selectCtrl.filter_limit">
                                    <i class="fa fa-check grid-select__list-item-check" ng-class="{'invisible': ! selectCtrl.selected(item)}"></i>
                                    <span class="grid-select__list-item-value" ng-bind=":: item[selectCtrl.value]"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </span>
        `;
    }
}