import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import {
    hideForeignNewsletterStatus,
    ownsNewsletterReturn,
    toastNewsletterPostedSuccess,
} from 'newsletter-banner';

define('newsletterOverlay', () => ({
    ...useDisposable(),
    dialogId: '',
    displayMode: 'enable',
    showInHome: true,
    showForVisitor: true,
    isHomeTemplate: false,
    isVisitor: true,
    delay: 3,
    expired: 7,
    successMessage: '',
    errorMessage: '',
    timeId: null,
    storageKey: 'newsletter-overlay-expired',

    _hydrateFromDataset() {
        const ds = this.$el?.dataset;
        if (!ds) return;
        if (ds.newsletterDialogId) this.dialogId = ds.newsletterDialogId;
        if (ds.newsletterDisplayMode) this.displayMode = ds.newsletterDisplayMode;
        if (ds.newsletterShowInHome) this.showInHome = JSON.parse(ds.newsletterShowInHome);
        if (ds.newsletterShowForVisitor)
            this.showForVisitor = JSON.parse(ds.newsletterShowForVisitor);
        if (ds.newsletterIsHomeTemplate)
            this.isHomeTemplate = JSON.parse(ds.newsletterIsHomeTemplate);
        if (ds.newsletterIsVisitor) this.isVisitor = JSON.parse(ds.newsletterIsVisitor);
        if (ds.newsletterDelay) this.delay = JSON.parse(ds.newsletterDelay);
        if (ds.newsletterExpired) this.expired = JSON.parse(ds.newsletterExpired);
        if (ds.newsletterSuccessMessage) this.successMessage = ds.newsletterSuccessMessage;
        if (ds.newsletterErrorMessage) this.errorMessage = ds.newsletterErrorMessage;
    },

    init() {
        this._hydrateFromDataset();
        const formId = this.$root.querySelector('form')?.id;
        hideForeignNewsletterStatus(this.$root);
        // Read before the toast removes it: a signup through any form ends the popup for this visitor.
        const subscribed =
            new URL(window.location.href).searchParams.get('customer_posted') === 'true';
        toastNewsletterPostedSuccess(this.successMessage, formId);
        if (subscribed) this._setExpired();
        // A rejected signup from this form reloads the page with its error: reopen the overlay there.
        if (
            ownsNewsletterReturn(formId) &&
            this.$root.querySelector('[data-newsletter-form-error]')
        ) {
            this._open();
            this._focusEmailAfterOpen();
            return;
        }
        if (this.displayMode === 'test') {
            this._open();
            return;
        }

        if (!this._canShow()) return;

        this.timeId = setTimeout(
            () => {
                this._open();
            },
            Math.max(0, Number(this.delay) * 1000),
        );

        this.on(window, 'keydown', this._onWindowKeydown.bind(this));
    },

    _onWindowKeydown(event) {
        if (event.key === 'Escape') {
            this.hide();
        }
    },

    _canShow() {
        if (!this.showInHome && this.isHomeTemplate) return false;
        if (!this.showForVisitor && this.isVisitor) return false;
        if (!this._isExpired()) return false;
        return true;
    },

    _isExpired() {
        const saved = Number(window.localStorage.getItem(this.storageKey));
        const now = Date.now();
        return !saved || now > saved;
    },

    _setExpired() {
        const ttl = Math.max(1, Number(this.expired)) * 24 * 60 * 60 * 1000;
        window.localStorage.setItem(this.storageKey, String(Date.now() + ttl));
    },

    _open() {
        if (!this.dialogId) return;
        this.$store?.dialog?.open?.(this.dialogId);
    },

    _focusEmailAfterOpen() {
        // The dialog focuses its first control when it opens; the email field takes it after.
        requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                this.$root.querySelector('[data-newsletter-email]')?.focus({ preventScroll: true });
            }),
        );
    },

    hide() {
        this.$store?.dialog?.close?.();
        if (this.displayMode === 'enable') {
            this._setExpired();
        }
    },

    destroy() {
        if (this.timeId) {
            clearTimeout(this.timeId);
            this.timeId = null;
        }
        this.dispose();
    },
}));
