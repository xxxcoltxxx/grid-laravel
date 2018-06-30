export default class TreeItem {
    constructor(id, parent_id, is_allowed = false) {
        this.id = id;
        this.parent_id = parent_id;
        this.expanded = false;
        this.is_allowed = is_allowed;

        this.parents = [parent_id];
        /**
         * @type {Array.<TreeItem>}
         */
        this.children = [];

        this.item = null;
    }

    get uniqueKey() {
        return this.item ? this.item.version_key : this.id;
    }

    set has_allowed_parents(value) {
        this._has_allowed_parents = value;

        if (! this.is_allowed) {
            this.is_hidden = true;
        } else if (this.isRoot()) {
            this.is_hidden = false;
        } else if (this.parent_id) {
            this.is_hidden = !! this.has_allowed_parents;
        } else {
            this.is_hidden = false;
        }
    }

    isRoot() {
        return ! this.parent_id || this.level == 1;
    }

    get has_allowed_parents() {
        return this._has_allowed_parents;
    }

    addChildren(items = []) {
        items.forEach(item => {
            this.children.push(item);
        });

        this.has_children = this.hasChildren();
        this.has_allowed_children = this.hasAllowedChildren();
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
            if (item.is_allowed || item.hasAllowedChildren()) {
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
