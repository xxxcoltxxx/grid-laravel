<select
    class="form-control input-sm selectpicker"
    data-style="btn-white"
    data-width="auto"
    ng-init="data_provider.pagination.items_per_page = '{!! $data_provider->pagination()->getLimit() !!}'"
    ng-model="data_provider.pagination.items_per_page">

    @foreach($data_provider->pagination()->getLimits() as $limit)
        <option value="{{ $limit }}">{{ $limit }}</option>
    @endforeach

</select>