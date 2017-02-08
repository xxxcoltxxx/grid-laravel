import GridFilter from "../GridFilter";
import GridFilterSelectController from "../grid-filter-select/GridFilterSelectController";

export default class GridFilterBooleanDirective extends GridFilter {
    constructor() {
        super();

        this.scope = {
            ...this.scope,
            items: '<',
            field: '@'
        };

        this.controller = GridFilterSelectController;
        this.controllerAs = 'booleanCtrl';
        this.bindToController = true;

        this.template = `
            <div class="grid-boolean">
                <select
                        class="form-control input-sm"
                        data-style="btn-default btn-sm"
                        data-none-results-text=""
                        data-size="7"
                        selectpicker
                        ng-model="booleanCtrl.provider.search[booleanCtrl.field]"
                        ng-change="booleanCtrl.provider.load()"
                >
                    <option value="">--//--</option>
                    <option value="1" data-icon="fa fa-check"></option>
                    <option value="-1" data-icon="fa fa-minus"></option>
                </select>
            </div>
        `
    }
}