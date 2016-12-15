import GridPaginationController from "./GridPaginationController";

export default class GridPaginationDirective {
    constructor() {
        this.controller = GridPaginationController;
        this.controllerAs = 'gridPaginationCtrl';
        this.bindToController = true;
        this.scope = {
            provider: '<'
        };
        this.template = `
            <div class="col-lg-2 pagination">
                <span uib-dropdown>
                    <div class="btn btn-white" id="pagination-dropdown" uib-dropdown-toggle>
                        {{ gridPaginationCtrl.provider.pagination.items_per_page }}
                        <i class="caret"></i>
                    </div>
                    <ul class="dropdown-menu" aria-labelledby="pagination-dropdown" uib-dropdown-menu>
                        <li ng-repeat="count in gridPaginationCtrl.provider.pagination.variants">
                            <a href ng-click="gridPaginationCtrl.setItemsPerPage(count)">
                                <i class="fa fa-check" ng-class="{'invisible': count != gridPaginationCtrl.provider.pagination.items_per_page}"></i>
                                {{:: count }}
                            </a>
                        </li>
                    </ul>
                </span>
            </div>
            
            <div class="col-lg-8 text-center">
                <ul uib-pagination
                    ng-show="num_pages > 1"
                    total-items="gridPaginationCtrl.provider.pagination.total"
                    num-pages="num_pages"
                    max-size="3"
                    items-per-page="gridPaginationCtrl.provider.pagination.items_per_page"
                    ng-model="gridPaginationCtrl.provider.pagination.page"
                    ng-change="gridPaginationCtrl.provider.load()"
                    previous-text="&lsaquo;"
                    next-text="&rsaquo;">
                </ul>
            </div>
            
            <div class="col-lg-2 pagination text-right">
                <span ng-if="num_pages > 1">
                    {{ gridPaginationCtrl.provider.pagination.page }} / {{ num_pages }}
                </span>
            </div>
            <div class="clearfix"></div>
        `;
    }
}
