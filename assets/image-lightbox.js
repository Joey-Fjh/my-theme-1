import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import * as DialogMotion from 'dialog-motion';

function getDialogMotionAdapter() {
    return DialogMotion;
}

define('imageLightbox', () => ({
    ...useDisposable(),
    imageCount: 1,
    lightboxOpen: false,
    lightboxClosing: false,
    lightboxIndex: 0,
    _previousBodyOverflow: null,
    _returnFocusTo: null,
    _trapHandler: null,
    _trapActive: false,
    _lightboxGeneration: 0,

    init() {
        const ds = this.$el?.dataset;
        if (!ds) return;
        if (ds.lightboxImageCount) {
            const parsed = Number(ds.lightboxImageCount);
            if (Number.isFinite(parsed) && parsed > 0) this.imageCount = parsed;
        }
    },

    get lightboxLabel() {
        return `${this.lightboxIndex + 1} / ${this.imageCount}`;
    },

    openLightbox(index = this.lightboxIndex) {
        const DialogMotion = getDialogMotionAdapter();

        this._returnFocusTo = document.activeElement;
        this.lightboxIndex = this._normalizeIndex(index);
        this.lightboxOpen = true;
        this.lightboxClosing = false;

        const generation = ++this._lightboxGeneration;
        const root = this.$refs.lightboxDialog;
        const usesMotion = DialogMotion && root && DialogMotion.hasMotion(root);

        const focusLightbox = () => {
            if (generation !== this._lightboxGeneration) return;
            if (!this.lightboxOpen) return;

            this._moveFocusIntoLightbox();
        };

        requestAnimationFrame(() => {
            if (generation !== this._lightboxGeneration) return;
            if (!this.lightboxOpen) return;

            this._attachTrap();
        });

        if (!usesMotion) {
            this._lockBodyScroll();
            requestAnimationFrame(() => {
                focusLightbox();
            });
            return;
        }

        DialogMotion.playEnter(root, {
            trigger: this._returnFocusTo,
            lockScroll: true,
            onEnterStart: focusLightbox,
        });
    },

    closeLightbox() {
        if (!this.lightboxOpen || this.lightboxClosing) return;

        const DialogMotion = getDialogMotionAdapter();

        this.lightboxClosing = true;
        this._lightboxGeneration += 1;

        const returnTo = this._returnFocusTo;
        const root = this.$refs.lightboxDialog;
        this._detachTrap();

        const unlock = () => {
            if (DialogMotion && typeof DialogMotion.unlockScroll === 'function') {
                DialogMotion.unlockScroll();
            } else {
                this._unlockBodyScroll();
            }
        };

        const finish = () => {
            this.lightboxOpen = false;
            this.lightboxClosing = false;
            unlock();
            this._returnFocusTo = null;

            if (
                returnTo &&
                returnTo.isConnected &&
                typeof returnTo.focus === 'function' &&
                this._isElementVisible(returnTo)
            ) {
                returnTo.focus({ preventScroll: true });
            }
        };

        if (DialogMotion && root && DialogMotion.hasMotion(root)) {
            DialogMotion.playExit(root, { trigger: returnTo }).then(finish);
            return;
        }

        finish();
    },

    nextLightbox() {
        this.lightboxIndex = this._normalizeIndex(this.lightboxIndex + 1);
    },

    prevLightbox() {
        this.lightboxIndex = this._normalizeIndex(this.lightboxIndex - 1);
    },

    _normalizeIndex(index) {
        const total = this.imageCount;
        return ((Number(index) % total) + total) % total;
    },

    _lockBodyScroll() {
        if (this._previousBodyOverflow === null) {
            this._previousBodyOverflow = document.body.style.overflow || '';
        }
        document.body.style.overflow = 'hidden';
    },

    _unlockBodyScroll() {
        if (this._previousBodyOverflow === null) return;
        document.body.style.overflow = this._previousBodyOverflow;
        this._previousBodyOverflow = null;
    },

    _FOCUSABLE_SELECTOR: [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled]):not([type="hidden"])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ].join(', '),

    _isElementVisible(el) {
        if (!el.offsetParent && el !== document.body) {
            let ancestor = el.parentElement;
            while (ancestor && ancestor !== document.body) {
                if (getComputedStyle(ancestor).display === 'none') return false;
                ancestor = ancestor.parentElement;
            }
        }
        return getComputedStyle(el).visibility !== 'hidden';
    },

    _isFocusable(el) {
        if (el.hasAttribute('disabled')) return false;
        if (el.hasAttribute('inert')) return false;
        if (el.getAttribute('tabindex') === '-1') return false;
        if (!this._isElementVisible(el)) return false;
        return true;
    },

    _getFocusableElements(container) {
        return Array.from(container.querySelectorAll(this._FOCUSABLE_SELECTOR)).filter((el) =>
            this._isFocusable(el),
        );
    },

    _moveFocusIntoLightbox() {
        const dialog = this.$refs.lightboxDialog;
        if (!dialog) return;

        const focusable = this._getFocusableElements(dialog);
        if (focusable.length > 0) {
            focusable[0].focus({ preventScroll: true });
        } else {
            dialog.focus({ preventScroll: true });
        }
    },

    _trapFocus(e) {
        if (e.key !== 'Tab') return;

        const dialog = this.$refs.lightboxDialog;
        if (!dialog) return;

        const focusable = this._getFocusableElements(dialog);
        if (focusable.length === 0) {
            e.preventDefault();
            dialog.focus();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first || document.activeElement === dialog) {
                e.preventDefault();
                last.focus();
            }
        } else if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }

        if (!dialog.contains(document.activeElement)) {
            e.preventDefault();
            (e.shiftKey ? last : first).focus();
        }
    },

    // The trap listens on the document in the capture phase, as the theme component did, so Tab
    // returns focus to the dialog even when it has left it; it is registered once and acts only
    // while the trap is active.
    _attachTrap() {
        if (!this.$refs.lightboxDialog) return;
        if (!this._trapHandler) {
            this._trapHandler = (e) => {
                if (this._trapActive) this._trapFocus(e);
            };
            this.on(document, 'keydown', this._trapHandler, true);
        }
        this._trapActive = true;
    },

    _detachTrap() {
        this._trapActive = false;
    },

    destroy() {
        this._lightboxGeneration += 1;
        this._detachTrap();
        if (this.lightboxOpen) this.closeLightbox();
        this.dispose();
    },
}));
