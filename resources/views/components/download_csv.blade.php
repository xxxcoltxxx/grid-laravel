<div class="pull-right">
    <form method="GET" action="{{ $csv_url ? $csv_url : '?' }}">
        <button class="btn btn-primary btn-sm" type="submit">
            <i class="fa fa-download"></i>
        </button>
        <input type="hidden" name="download_csv" value="download_csv"/>
        <input type="hidden" ng-value="columns_hider | json" name="column_names"/>
        <input type="hidden" ng-value="headers | json " name="headers"/>
        <input type="hidden" ng-value="data_provider.search | json " name="search"/>
        <input type="hidden" ng-value="data_provider.sorting | json" name="sorting"/>
    </form>
</div>
