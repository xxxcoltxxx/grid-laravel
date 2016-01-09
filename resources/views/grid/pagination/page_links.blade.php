<uib-pagination
        ng-show="num_pages > 1"
        total-items="total"
        num-pages="num_pages"
        items-per-page="data_provider.pagination.items_per_page"
        ng-model="data_provider.pagination.current_page"
        previous-text="&lsaquo;"
        next-text="&rsaquo;">
</uib-pagination>
