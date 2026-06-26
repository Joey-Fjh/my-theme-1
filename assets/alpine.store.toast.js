(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineStoreGroups = window.__Theme__.AlpineStoreGroups || {};

    const StoreGroups = window.__Theme__.AlpineStoreGroups;

    StoreGroups.toast = {
        messages: [],
        config: {
            defaultDuration: 3000,
        },
        _timeouts: new Map(),
        /**
         * Configure toast defaults from theme settings.
         * @param {{ defaultDuration?: number }} options
         */
        configure(options) {
            if (options.defaultDuration != null) {
                this.config.defaultDuration = options.defaultDuration;
            }
        },
        /**
         * Show a toast notification.
         * @param {string} message - Display text
         * @param {'success'|'error'|'warning'|'info'} type - Visual style (default: 'info')
         * @param {number} [duration] - Auto-dismiss ms, 0 to persist. Falls back to global default when omitted.
         */
        show(message, type = 'info', duration) {
            const id = Date.now() + Math.random().toString(36).substring(2);

            this.messages.push({ id, message, type });

            const resolved = duration === 0 ? 0 : duration || this.config.defaultDuration;

            if (resolved > 0) {
                const timeoutId = setTimeout(() => {
                    this._timeouts.delete(id);
                    this.remove(id);
                }, resolved);
                this._timeouts.set(id, timeoutId);
            }
        },
        remove(id) {
            const timeoutId = this._timeouts.get(id);
            if (timeoutId != null) {
                clearTimeout(timeoutId);
                this._timeouts.delete(id);
            }
            this.messages = this.messages.filter((msg) => msg.id !== id);
        },
    };
})();
