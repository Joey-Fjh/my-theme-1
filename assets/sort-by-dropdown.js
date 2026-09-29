import { define, data } from 'alpine-adapter';

define('sortByDropdown', () => ({
    sortBy: '',
    optionActiveClass: '',
    optionInactiveClass: '',
    formId: '',

    init() {
        const ds = this.$el?.dataset;
        if (!ds) return;

        this.sortBy = ds.currentSort || '';
        this.formId = ds.formId || '';
        this.optionActiveClass = ds.optionActiveClass || '';
        this.optionInactiveClass = ds.optionInactiveClass || '';
    },

    isSelected(value) {
        return this.sortBy === value;
    },

    syncPeers(value) {
        document.querySelectorAll('[data-sort-by-dropdown]').forEach((dropdown) => {
            if (dropdown.dataset.formId !== this.formId) return;

            const scope = data(dropdown);
            if (scope) scope.sortBy = value;

            dropdown.querySelector('[data-sort-by-control]')?.setAttribute('value', value);
        });
    },

    select(value) {
        this.sortBy = value;

        if (this.formId) {
            this.syncPeers(value);
            this.$nextTick(() => {
                document
                    .getElementById(this.formId)
                    ?.dispatchEvent(new Event('change', { bubbles: true }));
            });
        } else {
            this.$dispatch('sort-change', this.sortBy);
        }
    },

    selectAndClose(value, depth) {
        this.select(value);
        const dropdownRoot = this.$el.closest('[data-module-id="dropdown"]');
        const dropdownScope = dropdownRoot ? data(dropdownRoot) : null;
        dropdownScope?.close?.(Number(depth) || 0);
    },
}));
