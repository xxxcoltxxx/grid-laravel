export default class GridTreeUpButtonDirective {
    constructor() {
        this.restrict = 'A';
        this.scope = {
            provider: '<'
        };
        this.controller = () => {};
        this.controllerAs = 'treeUpBtnCtrl';
        this.bindToController = true;
        this.template = `
            <td colspan="13" class="full-button task-show-column">
                <button data-ng-disabled="treeUpBtnCtrl.provider.tree.load_buttons.up.disabled"
                        ng-click="treeUpBtnCtrl.provider.tree.moveTree(-treeUpBtnCtrl.provider.constants.LIMIT_LOADING)">
                    <i class="fa fa-long-arrow-up"></i>
                    <span ng-bind=":: $root.lang('grid.load-more')"></span>
                </button>
            </td>
        `;
    }
}