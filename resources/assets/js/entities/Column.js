export default class Column {
    constructor(field, title, default_hidden) {
        this.field = field;
        this.title = title;
        this.default_hidden = default_hidden;
        this.selected = ! default_hidden;
    }
}
