import GridFooterController from "./GridFooterController";

export default class GridFooterDirective {
    constructor() {
        this.scope = {
            provider: '<'
        };

        this.controller = GridFooterController;
        this.controllerAs = 'gridFooterCtrl';
        this.bindToController = true;

        this.template = `
            <tr ng-if="! gridFooterCtrl.is_loading && ! gridFooterCtrl.provider.items.length" class="text-center">
                <td colspan="{{:: gridFooterCtrl.provider.columns.length }}" ng-bind=":: $root.lang('grid.rows-not-found')"></td>
            </tr>
            <tr ng-if="gridFooterCtrl.is_loading && ! gridFooterCtrl.provider.items.length" class="text-center">
                <td colspan="{{:: gridFooterCtrl.provider.columns.length }}" ng-bind=":: $root.lang('grid.loading')"></td>
            </tr>
        `;
    }
}
