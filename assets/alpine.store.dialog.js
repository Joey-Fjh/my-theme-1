(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineStoreGroups = window.__Theme__.AlpineStoreGroups || {};

    const StoreGroups = window.__Theme__.AlpineStoreGroups;

    const FOCUSABLE_SELECTOR = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    function isElementVisible(el) {
        if (!el.offsetParent && el !== document.body) {
            let ancestor = el.parentElement;
            while (ancestor && ancestor !== document.body) {
                if (getComputedStyle(ancestor).display === 'none') return false;
                ancestor = ancestor.parentElement;
            }
        }
        return getComputedStyle(el).visibility !== 'hidden';
    }

    function isFocusable(el) {
        if (el.hasAttribute('disabled')) return false;
        if (el.hasAttribute('inert')) return false;
        if (el.getAttribute('tabindex') === '-1') return false;
        if (!isElementVisible(el)) return false;
        return true;
    }

    function getFocusableElements(container) {
        return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isFocusable);
    }

    StoreGroups.dialog = {
        active: null,
        _returnFocusTo: null,
        _trapHandler: null,
        _openGeneration: 0,

        open(id) {
            if (typeof id !== 'string' || !id.trim()) return;

            const cleanId = id.trim();

            if (this.active === cleanId) return;

            this._returnFocusTo = document.activeElement;

            this.active = cleanId;

            document.body.style.overflow = 'hidden';

            const generation = ++this._openGeneration;

            requestAnimationFrame(() => {
                if (generation !== this._openGeneration) return;

                requestAnimationFrame(() => {
                    if (generation !== this._openGeneration) return;
                    if (this.active !== cleanId) return;

                    this._moveFocusIntoDialog();
                    this._attachTrap();
                });
            });
        },

        close() {
            if (!this.active) return;

            this._openGeneration += 1;

            const returnTo = this._returnFocusTo;

            this._detachTrap();
            this.active = null;
            this._returnFocusTo = null;

            document.body.style.overflow = '';

            if (
                returnTo &&
                returnTo.isConnected &&
                typeof returnTo.focus === 'function' &&
                isElementVisible(returnTo)
            ) {
                returnTo.focus();
            }
        },

        _getActivePanel() {
            const id = this.active;
            if (!id) return null;
            const root = document.querySelector(
                '[data-dialog-root][data-dialog-id="' + CSS.escape(id) + '"]',
            );
            if (!root) return null;
            return root.querySelector('[data-dialog-panel]');
        },

        _trapFocus(e) {
            if (e.key !== 'Tab') return;

            const panel = this._getActivePanel();
            if (!panel) return;

            const focusable = getFocusableElements(panel);
            if (focusable.length === 0) {
                e.preventDefault();
                panel.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first || document.activeElement === panel) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }

            if (!panel.contains(document.activeElement)) {
                e.preventDefault();
                (e.shiftKey ? last : first).focus();
            }
        },

        _moveFocusIntoDialog() {
            const panel = this._getActivePanel();
            if (!panel) return;

            const focusable = getFocusableElements(panel);
            if (focusable.length > 0) {
                focusable[0].focus();
            } else {
                panel.focus();
            }
        },

        _attachTrap() {
            this._detachTrap();
            this._trapHandler = this._trapFocus.bind(this);
            document.addEventListener('keydown', this._trapHandler, true);
        },

        _detachTrap() {
            if (this._trapHandler) {
                document.removeEventListener('keydown', this._trapHandler, true);
                this._trapHandler = null;
            }
        },
    };
})();
