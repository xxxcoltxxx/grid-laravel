export default class GridCollapseButtonDirective {
    constructor() {
        this.restrict = 'A';
        this.scope = {
            item: '<',
            provider: '<'
        };
        this.controller = () => {};
        this.controllerAs = 'collapseBtnCtrl';
        this.bindToController = true;
        this.template = `
            <span class="tree-marker icon-hive-eye-slash-down"
                  ng-if=":: collapseBtnCtrl.item.has_children && ! collapseBtnCtrl.item.has_allowed_children"
                  uib-tooltip="{{:: $root.lang('grid.no-allowed-children') }}"
                  data-tooltip-placement="top-left"
                  data-tooltip-append-to-body="true"></span>

            <span class="tree-marker icon-hive-eye-slash-up"
                  ng-if="! collapseBtnCtrl.item.has_allowed_parents"
                  uib-tooltip="{{:: $root.lang('grid.no-allowed-parent') }}"
                  data-tooltip-placement="top-left"
                  data-tooltip-append-to-body="true"></span>

            <div class="tree-marker"
                 ng-if=":: collapseBtnCtrl.item.has_children && collapseBtnCtrl.item.has_allowed_children"
                 ng-click="collapseBtnCtrl.provider.tree.toggleExpanded(collapseBtnCtrl.item)"
                 uib-tooltip="{{:: $root.lang('grid.' + (collapseBtnCtrl.item.expanded ? 'collapse' : 'expand')) }}"
                 data-tooltip-placement="top-left"
                 data-tooltip-append-to-body="true">
                <span ng-class="{'icon-hive-minus-square-o': collapseBtnCtrl.item.expanded, 'icon-hive-plus-square-o': ! collapseBtnCtrl.item.expanded}"></span>
            </div>
        `;
    }
}