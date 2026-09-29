import * as DialogMotion from './dialog-motion.js';
import * as DrawerMotion from './drawer-motion.js';

/**
 * Global dialog layer store (modal and drawer shells).
 * @see assets/alpine.store.dialog.js (theme source)
 */
export function createDialogStore() {
    function getDialogMotion(root) {
        if (!root) return null;

        if (DrawerMotion.hasMotion(root)) {
            return DrawerMotion;
        }

        if (DialogMotion.hasMotion(root)) {
            return DialogMotion;
        }

        return null;
    }

    function lockPageScroll() {
        if (typeof DialogMotion.lockScroll === 'function') {
            DialogMotion.lockScroll();
            return;
        }
        document.body.style.overflow = 'hidden';
    }

    function unlockPageScroll() {
        if (typeof DialogMotion.unlockScroll === 'function') {
            DialogMotion.unlockScroll();
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

    function normalizeDialogId(id) {
        if (typeof id !== 'string' || !id.trim()) return '';
        return id.trim();
    }

    function clearDialogMotionState(root) {
        const motion = getDialogMotion(root);
        if (!motion || !root || typeof motion.clearMotionState !== 'function') return;

        const target =
            root.querySelector('[data-dialog-motion-target]') ||
            root.querySelector('[data-drawer-motion-target]');
        const backdrop =
            root.querySelector('[data-dialog-motion-backdrop]') ||
            root.querySelector('[data-drawer-motion-backdrop]');
        motion.clearMotionState(target, backdrop);
    }

    return {
        active: null,
        closing: null,
        _returnFocusTo: null,
        _trapHandler: null,
        _openGeneration: 0,

        isOpen(id) {
            const cleanId = normalizeDialogId(id);
            return Boolean(cleanId) && this.active === cleanId && this.closing !== cleanId;
        },

        isClosing(id) {
            const cleanId = normalizeDialogId(id);
            return Boolean(cleanId) && this.closing === cleanId;
        },

        _dismissReplacedDialog(id) {
            const cleanId = normalizeDialogId(id);
            if (!cleanId) return;
            if (this.active !== cleanId && this.closing !== cleanId) return;

            clearDialogMotionState(getDialogRoot(cleanId));
            this.forceClose(cleanId);
        },

        open(id) {
            const cleanId = normalizeDialogId(id);
            if (!cleanId) return;

            if (this.active === cleanId && this.closing !== cleanId) return;

            if (this.closing === cleanId) {
                this.forceClose(cleanId);
            } else if (this.active && this.active !== cleanId) {
                this._dismissReplacedDialog(this.active);
            } else if (this.closing && this.closing !== cleanId) {
                this._dismissReplacedDialog(this.closing);
            }

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
            const closeGeneration = ++this._openGeneration;

            this.closing = cleanId;
            this._detachTrap();

            const root = getDialogRoot(cleanId);
            const motion = getDialogMotion(root);

            const finish = () => {
                if (closeGeneration !== this._openGeneration) return;
                if (this.closing !== cleanId) return;

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

        forceClose(id) {
            const cleanId = normalizeDialogId(id);
            if (!cleanId) return;
            if (this.active !== cleanId && this.closing !== cleanId) return;

            this._openGeneration += 1;
            this._detachTrap();
            this.active = null;
            this.closing = null;
            this._returnFocusTo = null;
            unlockPageScroll();
        },

        refreshOpenContent(id, { returnFocusTo = null, focusElement = null } = {}) {
            const cleanId = normalizeDialogId(id);
            if (!cleanId || this.active !== cleanId || this.closing === cleanId) return false;

            if (returnFocusTo && returnFocusTo.isConnected) {
                this._returnFocusTo = returnFocusTo;
            }

            if (!this._trapHandler) {
                this._attachTrap();
            }

            if (
                focusElement &&
                focusElement.isConnected &&
                typeof focusElement.focus === 'function' &&
                isElementVisible(focusElement)
            ) {
                focusElement.focus({ preventScroll: true });
                return true;
            }

            this._moveFocusIntoDialog();
            return true;
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
}
