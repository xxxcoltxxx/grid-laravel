import GridFilterSelectController from "../grid-filter-select/GridFilterSelectController";

export default class GridFilterBooleanController extends GridFilterSelectController {
    /**
     *
     * @param $timeout
     * @param gridBooleanConfig
     */
    constructor($timeout, gridBooleanConfig) {
        super($timeout);
        this.items = [
            {id: 1, value: this.trueText || gridBooleanConfig.yes},
            {id: -1, value: this.falseText || gridBooleanConfig.no}
        ];
        this.uniqueKey = 'id';
        this.value = 'value';
        this.hideLiveSearch = true;
    }
}

GridFilterBooleanController.$inject = ['$timeout', 'gridBooleanConfig'];
