import { define } from 'alpine-adapter';

/**
 * Toast stack host; reads duration and Theme Editor preview from data-*.
 * @see assets/alpine.components.ui.js toastContainer (line 1058)
 */
define('toastContainer', () => ({
    init() {
        const ds = this.$el.dataset;

        this.$store.toast.configure({
            defaultDuration: Number(ds.toastDuration),
        });

        if (typeof this.$store.cart?.configure === 'function') {
            this.$store.cart.configure({
                errorMessages: {
                    generic: ds.cartToastGeneric || '',
                    rateLimited: ds.cartToastRateLimited || '',
                    serverError: ds.cartToastServerError || '',
                    timeout: ds.cartToastTimeout || '',
                    networkError: ds.cartToastNetworkError || '',
                },
            });
        }

        if (ds.toastPreview === 'true') {
            const previewDuration = ds.toastPreviewPersistent === 'true' ? 0 : undefined;

            requestAnimationFrame(() => {
                this.$store.toast.show(
                    ds.toastPreviewMessage,
                    ds.toastPreviewType,
                    previewDuration,
                );
            });
        }
    },
}));
