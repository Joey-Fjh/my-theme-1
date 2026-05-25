(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineStoreGroups = window.__Theme__.AlpineStoreGroups || {};

    const StoreGroups = window.__Theme__.AlpineStoreGroups;

    StoreGroups.dialog = {
        active: null,
        open(id) {
            if (typeof id !== 'string' || !id.trim()) return;

            this.active = id.trim();

            document.body.style.overflow = 'hidden';
        },
        close() {
            this.active = null;

            document.body.style.overflow = '';
        },
    };
})();
