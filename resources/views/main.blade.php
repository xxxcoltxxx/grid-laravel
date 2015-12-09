<?php
use Paramonov\Grid\GridHelper;
?>
<form method="get" id="form">
    @if(!empty($config['filter_all']))
        <div class="form-group">
            <div class="input-group">
                <input type="text" class="form-control" name="filter::all" placeholder="{{ $config['filter_all']->title }}" value="{{ request($config['filter_all']->name) }}" />
                <span class="input-group-btn">
                    <button class="btn btn-primary" type="submit">{{ trans('grid::main.btn-search') }}</button>
                </span>
            </div>
        </div>
    @endif

    <table class='table table-condensed table-bordered'>
        <thead>
            <tr class="success">
                @foreach($config['columns'] as $field)
                    <th data-field="{!! $field->name !!}">
                        {!! $field->title !!}
                        @include('grid::elements.caret')
                    </th>
                @endforeach
            </tr>

            <tr>
                @foreach($config['columns'] as $field)
                    <th>
                        {!! $field !!}
                    </th>
                @endforeach
            </tr>
        </thead>
        <tbody>
        @foreach($rows as $row)
            <tr>
                @foreach($config['columns'] as $field)
                    <td>{{ $row[$field->name] }}</td>
                @endforeach
            </tr>
        @endforeach
        </tbody>
    </table>

    <div class="form-inline">
        <div class="pagination pull-left">
            <label>{{ trans('grid::main.recordsCount') }}
                <select class="form-control" name="limit" onchange="submitForm(true)">
                    @foreach($config['limits'] as $limit)
                        <option value="{{ $limit }}" @if ($limit == request('limit')) selected @endif>{{ $limit }}</option>
                    @endforeach
                </select>
            </label>
        </div>
        <div class="pagination pull-right">
            {{ ($rows->currentPage() - 1) * $rows->perPage() + 1 }} - {{ $rows->currentPage() * $rows->perPage() }} / {!! $rows->total() !!}
        </div>
        <div class="text-center no-margin">
            {!! $rows->render() !!}
        </div>
    </div>
    <input type="hidden" name="page" id="page" value="{{ request('page') }}" />
    <input type="hidden" name="sort" id="sort" value="{{ request('sort') }}" />
    <input type="hidden" name="direction" id="direction" value="{{ request('direction') }}" />
</form>

<script>
    $(document).ready(function() {
        $('#form').on('submit', function(e) {
            e.preventDefault();
            submitForm(true);
        });
        function submitForm(clear) {
            if (clear) {
                $('#page').val(1);
            }
            location.href = (location.search.startsWith('?') ? location.search + '&' : '?') + $('form').serialize();
        }
    });
</script>