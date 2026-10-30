import { define, store } from 'alpine-adapter';

define('contactFormSuccess', () => ({
    init() {
        const message = this.$el?.dataset?.successMessage;
        if (!message) return;
        this.$nextTick(() => {
            store('toast')?.show?.(message, 'success');
            this.$el.hidden = true;
        });
    },
}));
