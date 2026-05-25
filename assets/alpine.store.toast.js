(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineStoreGroups = window.__Theme__.AlpineStoreGroups || {};

    const StoreGroups = window.__Theme__.AlpineStoreGroups;

    StoreGroups.toast = {
        messages: [],
        /**
         * Show a toast notification.
         * @param {string} message - Display text
         * @param {'success'|'error'|'info'} type - Visual style (default: 'info')
         * @param {number} duration - Auto-dismiss ms, 0 to persist (default: 3000)
         */
        show(message, type = 'info', duration = 3000) {
            const id = Date.now() + Math.random().toString(36).substring(2);

            this.messages.push({ id, message, type });

            if (duration > 0) {
                setTimeout(() => {
                    this.remove(id);
                }, duration);
            }
        },
        remove(id) {
            this.messages = this.messages.filter((msg) => msg.id !== id);
        },
    };
})();
