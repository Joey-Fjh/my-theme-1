import { define, store } from 'alpine-adapter';

export function toastNewsletterPostedSuccess(successMessage) {
    if (!successMessage) return false;
    try {
        const url = new URL(window.location.href);
        if (url.searchParams.get('customer_posted') !== 'true') return false;
        store('toast')?.show?.(successMessage, 'success');
        url.searchParams.delete('customer_posted');

        const formHash = url.hash;
        window.history.replaceState({}, '', `${url.pathname}${url.search}`);
        if (formHash && formHash.length > 1) {
            window.location.hash = formHash;
        }
        return true;
    } catch (_) {
        return false;
    }
}

define('newsletterBanner', () => ({
    successMessage: '',

    _hydrateFromDataset() {
        const ds = this.$el?.dataset;
        if (!ds) return;
        if (ds.newsletterSuccessMessage) {
            this.successMessage = ds.newsletterSuccessMessage;
        }
    },

    init() {
        this._hydrateFromDataset();
        toastNewsletterPostedSuccess(this.successMessage);
    },
}));
