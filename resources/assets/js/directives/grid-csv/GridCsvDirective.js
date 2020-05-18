export default class GridCsvDirective {
    constructor() {
        this.scope = {
            provider: '<'
        };

        this.template = `
            <button class="btn btn-white btn-sm grid-btn" type="submit"
                uib-tooltip="{{:: $root.lang('system.form.btn.download') }}"
                tooltip-placement="top-right"
                ng-click="provider.csv()"
            >
                <i class="fa fa-download"></i>
            </button>
        `;
    }
}