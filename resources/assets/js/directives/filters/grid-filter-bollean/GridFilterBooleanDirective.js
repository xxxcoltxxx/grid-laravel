import GridFilterBooleanController from "./GridFilterBooleanController";
import GridFilterSelectDirective from "../grid-filter-select/GridFilterSelectDirective";

export default class GridFilterBooleanDirective extends GridFilterSelectDirective {
    constructor() {
        super();

        this.scope = {
            ...this.scope,
            trueText: '@',
            falseText: '@',
        };

        this.controller = GridFilterBooleanController;
    }
}
