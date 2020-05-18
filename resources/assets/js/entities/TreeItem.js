export default class TreeItem {
    constructor(id, parent_id, level, expanded = false) {
        this.id = id;
        this.parent_id = parent_id;
        this.level = level;
        this.expanded = expanded;
        this.is_hidden = true;

        this.parents = [parent_id];
        /**
         * @type {Array.<TreeItem>}
         */
        this.children = [];

        this.item = null;
        this.parent_allowed = true;
    }

    get uniqueKey() {
        return this.item ? this.item.version_key : this.id;
    }

    addChildren(items = []) {
        items.forEach(item => {
            this.children.push(item);
        });
    }

    hasChildren() {
        return this.children.length > 0;
    }

    /**
     * TODO: Закешировать в свойство
     *
     * @returns {boolean}
     */
    hasAllowedChildren() {
        let allowed = false;

        this.children.forEach(item => {
            if (item.item || item.hasAllowedChildren()) {
                allowed = true;

                return false;
            }
        });

        return allowed;
    }

    toggleExpanded(state = null) {
        if (state === null) {
            this.expanded = ! this.expanded;
        } else {
            this.expanded = state;
        }

        if (this.expanded) {
            this.calcIsHidden(this.expanded);
        } else {
            this.hideAll();
        }
    }

    hideAll() {
        this.children.forEach(item => {
            item.is_hidden = true;
            item.hideAll();
        });
    }

    calcIsHidden(parent_is_expanded) {
        this.children.forEach(item => {
            item.is_hidden = ! parent_is_expanded;
            item.calcIsHidden(parent_is_expanded ? item.expanded : false);
        });
    }
}
