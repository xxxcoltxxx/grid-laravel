<select
        class="form-control input-sm"
        data-style="btn-white"
        data-width="auto"
        selectpicker
        ng-init="data_provider.pagination.items_per_page = '{!! $data_provider->getPagination()->getLimit() !!}'"
        ng-model="data_provider.pagination.items_per_page">

    @foreach($data_provider->getPagination()->getLimits() as $limit)
        <option value="{{ $limit }}">{{ $limit }}</option>
    @endforeach

</select>