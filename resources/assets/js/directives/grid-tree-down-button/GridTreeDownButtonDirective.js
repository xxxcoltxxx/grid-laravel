export default class GridTreeDownButtonDirective {
    constructor() {
        this.restrict = 'A';
        this.scope = {
            provider: '<'
        };
        this.controller = () => {};
        this.controllerAs = 'treeDownBtnCtrl';
        this.bindToController = true;
        this.template = `
            <td colspan="13" class="full-button task-show-column">
                <button data-ng-disabled="treeDownBtnCtrl.provider.tree.load_buttons.down.disabled"
                        ng-click="treeDownBtnCtrl.provider.tree.moveTree(treeDownBtnCtrl.provider.constants.LIMIT_LOADING)">
                    <i class="fa fa-long-arrow-down"></i>
                    <span ng-bind=":: $root.lang('grid.load-more')"></span>
                </button>
            </td>
        `;
    }
}