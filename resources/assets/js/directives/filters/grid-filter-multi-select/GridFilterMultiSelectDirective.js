import GridFilterSelectDirective from "../grid-filter-select/GridFilterSelectDirective";
import GridFilterMultiSelectController from "./GridFilterMultiSelectController";

export default class GridFilterMultiSelectDirective extends GridFilterSelectDirective {
    constructor() {
        super();
        this.controller = GridFilterMultiSelectController;
    }
}
