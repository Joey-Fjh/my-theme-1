import ThemeEvents from 'events';
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
        _levels: [],
        _scrollLockHeld: false,
        _trapHandler: null,
        _trapOff: null,
        _openGeneration: 0,

        _syncActiveClosing() {
            const top = this._levels[this._levels.length - 1];
            if (!top) {
                this.active = null;
                this.closing = null;
                return;
            }
            this.active = top.id;
            this.closing = top.state === 'closing' ? top.id : null;
        },

        _findLevel(id) {
            const cleanId = normalizeDialogId(id);
            if (!cleanId) return null;
            return this._levels.find((level) => level.id === cleanId) || null;
        },

        _topLevel() {
            return this._levels[this._levels.length - 1] || null;
        },

        _ensureScrollLock() {
            if (this._levels.length > 0 && !this._scrollLockHeld) {
                lockPageScroll();
                this._scrollLockHeld = true;
            }
        },

        _releaseScrollLock() {
            if (this._levels.length === 0 && this._scrollLockHeld) {
                unlockPageScroll();
                this._scrollLockHeld = false;
            }
        },

        isShown(id) {
            const level = this._findLevel(id);
            return Boolean(level && (level.state === 'open' || level.state === 'closing'));
        },

        isOpen(id) {
            const level = this._findLevel(id);
            return Boolean(level && level.state === 'open');
        },

        isClosing(id) {
            const cleanId = normalizeDialogId(id);
            return Boolean(cleanId) && this.closing === cleanId;
        },

        _removeLevelsFrom(index) {
            if (index < 0 || index >= this._levels.length) return [];
            return this._levels.splice(index);
        },

        /**
         * Clear motion state only after the library has hidden the level. Alpine applies an
         * x-show hide in the next animation frame, so clear one frame later; skip the clear
         * when the level has been shown again meanwhile.
         */
        _clearMotionAfterHide(id) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (this.isShown(id)) return;
                    clearDialogMotionState(getDialogRoot(id));
                });
            });
        },

        /** Move focus back to `returnTo` when usable, otherwise into the top level. */
        _restoreFocus(returnTo) {
            if (
                returnTo &&
                returnTo.isConnected &&
                typeof returnTo.focus === 'function' &&
                isElementVisible(returnTo)
            ) {
                returnTo.focus({ preventScroll: true });
                return;
            }

            if (this._levels.length > 0) this._moveFocusIntoDialog();
        },

        /**
         * Remove `index` and every level above it without exit motion. Focus returns to the
         * lowest removed level's opener (or into the level that stays open), unless the caller
         * opens a replacement right away and passes `restoreFocus: false`.
         * @returns {Array<{ id: string, returnFocusTo: Element | null }>} removed levels
         */
        _dismissLevelsFrom(index, { restoreFocus = true } = {}) {
            const removed = this._removeLevelsFrom(index);
            if (!removed.length) return removed;

            removed.forEach((level) => this._clearMotionAfterHide(level.id));
            this._syncActiveClosing();
            this._detachTrap();

            if (this._levels.length > 0) {
                // A lower level stays open: it owns the trap again.
                this._attachTrap();
            } else {
                this._releaseScrollLock();
            }

            if (restoreFocus) this._restoreFocus(removed[0].returnFocusTo);
            return removed;
        },

        _dismissReplacedDialog(id) {
            const cleanId = normalizeDialogId(id);
            if (!cleanId) return;
            const index = this._levels.findIndex((level) => level.id === cleanId);
            if (index === -1) return;
            this._dismissLevelsFrom(index);
        },

        _canStackOnto(cleanId) {
            if (!this._levels.length || this.closing) return false;
            const root = getDialogRoot(cleanId);
            return Boolean(root && root.hasAttribute('data-dialog-stack'));
        },

        /**
         * @param {string} id
         * @param {{ opener?: Element | null }} [options] `opener`: the control that asked for
         *   the dialog, when the call happens after focus has moved (for example after an
         *   async request). Defaults to the focused element.
         */
        open(id, { opener = null } = {}) {
            const cleanId = normalizeDialogId(id);
            if (!cleanId) return;

            const existing = this._findLevel(cleanId);
            if (existing && existing.state === 'open' && this._topLevel()?.id === cleanId) {
                return;
            }

            // Read before any dismissal below moves focus.
            const trigger = opener && opener.isConnected ? opener : document.activeElement;
            let returnFocusTo = trigger;

            const removed = [];

            if (existing && existing.state === 'closing') {
                this._openGeneration += 1;
                removed.push(
                    ...this._dismissLevelsFrom(this._levels.indexOf(existing), {
                        restoreFocus: false,
                    }),
                );
            }

            const stackOnto = this._canStackOnto(cleanId);

            if (!stackOnto && this._levels.length) {
                removed.unshift(...this._dismissLevelsFrom(0, { restoreFocus: false }));
            }

            // Opened from inside a dialog it removes (for example add to cart in quick view):
            // return focus to the lowest removed dialog's opener, which stays on the page.
            const openerInsideRemoved = removed.some((level) =>
                getDialogRoot(level.id)?.contains(returnFocusTo),
            );
            if (openerInsideRemoved) returnFocusTo = removed[0].returnFocusTo;

            this._levels.push({ id: cleanId, returnFocusTo, state: 'open' });
            this._syncActiveClosing();

            const generation = ++this._openGeneration;
            const root = getDialogRoot(cleanId);
            const motion = getDialogMotion(root);

            const focusDialog = () => {
                if (generation !== this._openGeneration) return;
                if (!this.isOpen(cleanId)) return;

                this._moveFocusIntoDialog();
            };

            const attachTrapWhenReady = () => {
                requestAnimationFrame(() => {
                    if (generation !== this._openGeneration) return;
                    if (!this.isShown(cleanId)) return;

                    this._attachTrap();
                });
            };

            attachTrapWhenReady();
            this._ensureScrollLock();

            if (!motion) {
                requestAnimationFrame(() => {
                    focusDialog();
                });
                return;
            }

            motion.playEnter(root, {
                trigger,
                lockScroll: false,
                onEnterStart: focusDialog,
            });
        },

        close(id) {
            const top = this._topLevel();
            if (!top || top.state === 'closing') return;

            const cleanId = normalizeDialogId(id);
            if (cleanId && top.id !== cleanId) return;

            const levelId = top.id;
            const returnTo = top.returnFocusTo;
            const closeGeneration = ++this._openGeneration;

            top.state = 'closing';
            this._syncActiveClosing();
            this._detachTrap();

            const root = getDialogRoot(levelId);
            const motion = getDialogMotion(root);

            let closeSettled = false;
            const finish = () => {
                if (closeSettled) return;
                if (closeGeneration !== this._openGeneration) return;
                const currentTop = this._topLevel();
                if (!currentTop || currentTop.id !== levelId || currentTop.state !== 'closing') {
                    return;
                }

                closeSettled = true;

                this._levels.pop();
                this._syncActiveClosing();
                this._clearMotionAfterHide(levelId);

                if (this._levels.length > 0) {
                    this._attachTrap();
                } else {
                    this._releaseScrollLock();
                }

                this._restoreFocus(returnTo);
            };

            if (motion && root && motion.hasMotion(root)) {
                const exitMs =
                    typeof motion.getExitDurationMs === 'function'
                        ? motion.getExitDurationMs(root)
                        : 500;
                // Safety net only: playExit settles on animationend or its own fallback timer.
                // This fires when animation frames stall (for example a background tab), with
                // enough margin not to cut a running exit animation short.
                const exitTimer = window.setTimeout(finish, exitMs + 1000);
                const settleExit = () => {
                    window.clearTimeout(exitTimer);
                    finish();
                };

                try {
                    motion.playExit(root, { trigger: returnTo }).then(settleExit, settleExit);
                } catch (error) {
                    console.error('[DialogStore] playExit failed', error);
                    settleExit();
                }
                return;
            }

            finish();
        },

        forceClose(id) {
            const cleanId = normalizeDialogId(id);
            if (!cleanId) return;

            const index = this._levels.findIndex((level) => level.id === cleanId);
            if (index === -1) return;

            this._openGeneration += 1;
            this._dismissLevelsFrom(index);
        },

        refreshOpenContent(id, { returnFocusTo = null, focusElement = null } = {}) {
            const cleanId = normalizeDialogId(id);
            const level = this._findLevel(cleanId);
            if (!level || level.state !== 'open') return false;

            if (returnFocusTo && returnFocusTo.isConnected) {
                level.returnFocusTo = returnFocusTo;
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
            const top = this._topLevel();
            if (!top) return null;
            const root = getDialogRoot(top.id);
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
            this._trapOff = ThemeEvents.on('keydown', this._trapHandler, {
                target: document,
                capture: true,
            });
        },

        _detachTrap() {
            if (this._trapOff) {
                this._trapOff();
                this._trapOff = null;
            }
            this._trapHandler = null;
        },
    };
}
