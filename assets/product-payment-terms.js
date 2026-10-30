import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';

define('ProductPaymentTerms', () => ({
    ...useDisposable(),
    sectionId: '',
    _eventScope: null,
    _idInput: null,

    init() {
        const dataset = this.$el?.dataset || {};
        this.sectionId = dataset.sectionId || '';
        this._idInput = this.$el.querySelector('input[name="id"]');

        const events = ThemeEvents.events;
        this._eventScope = ThemeEvents.createScope();

        const onVariantChange = (e) => {
            if (e.detail?.sectionId !== this.sectionId) return;
            this._syncVariantId(e.detail?.variant?.id ?? null);
        };

        this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);
    },

    _setTermsAvailable(available) {
        if (!this.$el) return;
        this.$el.hidden = !available;
    },

    _syncVariantId(variantId) {
        if (!this._idInput) return;

        const next = variantId == null || variantId === '' ? '' : String(variantId);

        if (this._idInput.value !== next) {
            this._idInput.value = next;
            this._idInput.dispatchEvent(new Event('input', { bubbles: true }));
            this._idInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        this._setTermsAvailable(Boolean(next));
    },

    destroy() {
        this._eventScope?.dispose?.();
        this._eventScope = null;
        this._idInput = null;
        this.dispose();
    },
}));
