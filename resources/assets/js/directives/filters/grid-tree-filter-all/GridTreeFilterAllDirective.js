import GridFilter from "../GridFilter";

export default class GridTreeFilterAllDirective extends GridFilter {
    constructor() {
        super();

        this.template = `
            <div class="input-group input-group-sm">
                <input class="form-control" type="text"
                       ng-model="provider.search.all" 
                       placeholder="{{:: $root.lang('grid.search-all') }}"
                       ng-change="provider.tree.search()" />
                
                <span class="input-group-addon" ng-if="provider.tree.current_search_result.index > -1 || provider.search.all">
                    {{ provider.tree.current_search_result.index + 1 }} / {{ provider.tree.search_results.length }}
                </span>
                
                <span class="input-group-btn">
                    <span class="btn btn-default" ng-click="provider.tree.resetSearch()">
                        <i class="fa fa-remove"></i>
                    </span>
                    
                    <span class="btn btn-default" 
                          ng-click="provider.tree.moveResult(-1)"
                          ng-if="provider.tree.current_search_result.index > -1 || provider.search.all"
                          uib-tooltip="{{:: $root.lang('grid.prev-search-result') }}"
                          data-tooltip-append-to-body="true"
                          >
                        <i class="fa fa-chevron-up"></i>
                    </span>
                    
                    <span class="btn btn-default"
                          ng-click="provider.tree.moveResult(1)" 
                          ng-if="provider.tree.current_search_result.index > -1 || provider.search.all"
                          uib-tooltip="{{:: $root.lang('grid.next-search-result') }}"
                          data-tooltip-append-to-body="true"
                          >
                        <i class="fa fa-chevron-down"></i>
                    </span>
                </span>
            </div>
        `;
    }
}