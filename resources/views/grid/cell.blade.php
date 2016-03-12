@if ($template)
    @include($template, compact('item'))
@endif
@yield($field_name, $item[$field_name])
