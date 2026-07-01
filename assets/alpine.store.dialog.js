(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineStoreGroups = window.__Theme__.AlpineStoreGroups || {};

    const StoreGroups = window.__Theme__.AlpineStoreGroups;
    const DialogMotion = () => window.__Theme__.DialogMotion;
    const DrawerMotion = () => window.__Theme__.DrawerMotion;

    function getDialogMotion(root) {
        if (!root) return null;

        const drawerMotion = DrawerMotion();
        if (drawerMotion && drawerMotion.hasMotion(root)) {
            return drawerMotion;
        }

        const dialogMotion = DialogMotion();
        if (dialogMotion && dialogMotion.hasMotion(root)) {
            return dialogMotion;
        }

        return null;
    }

    function lockPageScroll() {
        const motion = DialogMotion();
        if (motion && typeof motion.lockScroll === 'function') {
            motion.lockScroll();
            return;
        }
        document.body.style.overflow = 'hidden';
    }

    function unlockPageScroll() {
        const motion = DialogMotion();
        if (motion && typeof motion.unlockScroll === 'function') {
            motion.unlockScroll();
            return;
        }
        document.body.style.overflow = '';
    }

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

    function getDialogRoot(id) {
        if (!id) return null;
        return document.querySelector(
            '[data-dialog-root][data-dialog-id="' + CSS.escape(id) + '"]',
        );
    }

    StoreGroups.dialog = {
        active: null,
        closing: null,
        _returnFocusTo: null,
        _trapHandler: null,
        _openGeneration: 0,

        open(id) {
            if (typeof id !== 'string' || !id.trim()) return;

            const cleanId = id.trim();

            if (this.active === cleanId) return;

            this.closing = null;
            this._returnFocusTo = document.activeElement;
            this.active = cleanId;

            const generation = ++this._openGeneration;
            const root = getDialogRoot(cleanId);
            const trigger = this._returnFocusTo;
            const motion = getDialogMotion(root);

            const focusDialog = () => {
                if (generation !== this._openGeneration) return;
                if (this.active !== cleanId) return;

                this._moveFocusIntoDialog();
            };

            const attachTrapWhenReady = () => {
                requestAnimationFrame(() => {
                    if (generation !== this._openGeneration) return;
                    if (this.active !== cleanId) return;

                    this._attachTrap();
                });
            };

            attachTrapWhenReady();

            if (!motion) {
                lockPageScroll();
                requestAnimationFrame(() => {
                    focusDialog();
                });
                return;
            }

            motion.playEnter(root, {
                trigger,
                lockScroll: true,
                onEnterStart: focusDialog,
            });
        },

        close() {
            if (!this.active || this.closing) return;

            const cleanId = this.active;
            const returnTo = this._returnFocusTo;

            this.closing = cleanId;
            this._openGeneration += 1;
            this._detachTrap();

            const root = getDialogRoot(cleanId);
            const motion = getDialogMotion(root);

            const finish = () => {
                this.active = null;
                this.closing = null;
                this._returnFocusTo = null;
                unlockPageScroll();

                if (
                    returnTo &&
                    returnTo.isConnected &&
                    typeof returnTo.focus === 'function' &&
                    isElementVisible(returnTo)
                ) {
                    returnTo.focus({ preventScroll: true });
                }
            };

            if (motion && root && motion.hasMotion(root)) {
                motion.playExit(root, { trigger: returnTo }).then(finish);
                return;
            }

            finish();
        },

        _getActivePanel() {
            const id = this.active || this.closing;
            if (!id) return null;
            const root = getDialogRoot(id);
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
                focusable[0].focus({ preventScroll: true });
            } else {
                panel.focus({ preventScroll: true });
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
