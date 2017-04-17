export function is_empty(value) {
    if (value instanceof Array) {
        return value.length === 0;
    }

    return ! value;
}
