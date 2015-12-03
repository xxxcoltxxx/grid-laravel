<?php
use Paramonov\Grid\GridHelper;
?>
<form method="get">
    <table class='table table-condensed table-bordered'>
        <thead>
        <tr class="success">
            @foreach($config['columns'] as $field => $title)
                <th data-field="{{ $field }}">
                    {{ $title }}
                    <a href="{!! GridHelper::getQueryString([
                        'sort' => $field,
                        'direction' => (request('sort') != $field
                            ? (request('direction'))
                            : (request('direction') == 'asc' ? 'desc' : 'asc')
                        )
                    ]) !!}"
                        class="pull-right">
                        <span
                            @if (request('sort') != $field)
                                class="text-muted"
                            @endif
                        >
                            @if (request('direction', 'asc') == 'asc')
                                <i class="glyphicon glyphicon-triangle-top"></i>
                            @else
                                <i class="glyphicon glyphicon-triangle-bottom"></i>
                            @endif
                        </span>
                    </a>
                </th>
            @endforeach
        </tr>
        </thead>
        <tbody>
        @foreach($rows as $row)
            <tr>
                @foreach($config['columns'] as $field => $title)
                    <td>{{ $row[$field] }}</td>
                @endforeach
            </tr>
        @endforeach
        </tbody>
    </table>
    <div class="form-inline">

        <div class="pagination pull-left">
            <label>{{ trans('grid::main.recordsCount') }}
                <select class="form-control" name="limit" onchange="submitForm()">
                    @foreach($config['limits'] as $limit)
                        <option value="{{ $limit }}" @if ($limit == request('limit')) selected @endif>{{ $limit }}</option>
                    @endforeach
                </select>
            </label>
        </div>
        <div class="pagination pull-right">
            {{ count($rows) }} / {!! $rows->total() !!}
        </div>
        <div class="text-center no-margin">
            {!! $rows->render() !!}
        </div>
    </div>
</form>

<script>
    function submitForm() {
        location.href = (location.search.startsWith('?') ? location.search + '&' : '?') + $('form').serialize();
    }
</script>