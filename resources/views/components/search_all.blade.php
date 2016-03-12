<div class="input-group input-group-sm">
    <input class="form-control" type="text" ng-model="data_provider.search.all"
           placeholder="@lang('grid::main.search-all')"/>
    <span class="input-group-btn">
        <button class="btn btn-default" type="button" ng-click="data_provider.search = default_filters">
            <i class="fa fa-remove"></i>
        </button>
         <button type="button" ng-click="showHideFilters()" class="btn btn-default">
             <i ng-class="{'fa-search-minus' : show_filters, 'fa-search-plus' : !show_filters }" class="fa "> </i>
         </button>
    </span>
</div>
