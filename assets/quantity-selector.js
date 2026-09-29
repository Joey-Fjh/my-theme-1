import { define, store } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';
import QuantityConstraints from './quantity-constraints.js';

define('QuantitySelector', () => ({
    ...useDisposable(),
    qty: 1,
    min: 1,
    max: null,
    step: 1,
    canPurchase: true,
    surface: 'product',
    variantId: null,
    cartQuantity: 0,
    _eventScope: null,
    _sectionId: null,
    _variant: null,
    _cartUnwatch: null,

    get canDecrement() {
        return this.canPurchase && this.qty > this.min;
    },
    get canIncrement() {
        if (!this.canPurchase) return false;
        if (this.max === null) return true;
        return this.qty + this.step <= this.max;
    },

    _cartItems() {
        return store('cart')?.items || [];
    },

    _parseConstraintsJson(raw) {
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch (_) {
            return null;
        }
    },

    _applyResolved(resolved, { resetQty = false } = {}) {
        if (!resolved) return;
        this.min = resolved.min;
        this.max = resolved.max;
        this.step = resolved.step;
        this.canPurchase = resolved.canPurchase !== false;
        this.cartQuantity = resolved.cartQuantity || 0;

        if (!this.canPurchase) {
            this.qty = this.max != null ? this.max : 0;
        } else if (resetQty || this.qty < this.min) {
            this.qty = this.min;
        } else if (this.max !== null && this.qty > this.max) {
            this.qty = this.max;
        }

        if (this.$el) {
            this.$el.dataset.qtyCanPurchase = this.canPurchase ? 'true' : 'false';
        }
    },

    _resolveFromVariant(variant, { resetQty = false } = {}) {
        if (!variant) return;

        let cartQuantity = this.cartQuantity;
        if (this.surface === 'product') {
            cartQuantity = QuantityConstraints.cartQuantityForVariant(
                variant.id,
                this._cartItems(),
            );
        }

        const resolved = QuantityConstraints.fromVariant(variant, {
            surface: this.surface,
            cartQuantity,
        });
        this._variant = variant;
        this.variantId = variant.id || null;
        this._applyResolved(resolved, { resetQty });
    },

    _hydrateFromDataset() {
        const ds = this.$el?.dataset;
        if (!ds) return;

        this.surface = ds.qtySurface === 'cart' ? 'cart' : 'product';
        if (ds.qtySectionId) this._sectionId = ds.qtySectionId;
        if (ds.qtyVariantId) this.variantId = Number(ds.qtyVariantId) || null;
        if (ds.qtyMsgMax) this._msgMax = ds.qtyMsgMax;
        if (ds.qtyMsgMin) this._msgMin = ds.qtyMsgMin;
        if (ds.qtyMsgBelowMin) this._msgBelowMin = ds.qtyMsgBelowMin;
        if (ds.qtyMsgAboveMax) this._msgAboveMax = ds.qtyMsgAboveMax;

        const parsed = this._parseConstraintsJson(ds.qtyConstraints);
        if (parsed) {
            this._applyResolved(
                {
                    min: Number(parsed.min) || 1,
                    max: parsed.max == null ? null : Number(parsed.max),
                    step: Number(parsed.step) || 1,
                    cartQuantity: Number(parsed.cart_quantity) || 0,
                    canPurchase: parsed.can_purchase !== false,
                },
                { resetQty: true },
            );
            this.qty = Number(parsed.value);
            if (!Number.isFinite(this.qty)) this.qty = this.min;
            if (parsed.id || parsed.quantity_rule) {
                this._variant = {
                    id: parsed.id || this.variantId,
                    quantity_rule: parsed.quantity_rule,
                    inventory_management: parsed.inventory_management,
                    inventory_policy: parsed.inventory_policy,
                    inventory_quantity: parsed.inventory_quantity,
                };
                this.variantId = this._variant.id || this.variantId;
            }
            return;
        }

        if (ds.qtyValue) this.qty = Number(ds.qtyValue) || 1;
        if (ds.qtyMin) this.min = Number(ds.qtyMin) || 1;
        if (ds.qtyMax && ds.qtyMax !== 'null') this.max = Number(ds.qtyMax);
        else if (ds.qtyMax === 'null' || ds.qtyMax === '') this.max = null;
        if (ds.qtyStep) this.step = Number(ds.qtyStep) || 1;
        this.canPurchase = ds.qtyCanPurchase !== 'false';
        this.cartQuantity = Number(ds.qtyCartQuantity) || 0;
    },

    _syncFromCart() {
        if (this.surface !== 'product' || !this._variant) return;
        this._resolveFromVariant(this._variant, { resetQty: false });
        this._notify();
    },

    init() {
        this._hydrateFromDataset();

        const Events = ThemeEvents;
        const events = Events.events;
        this._eventScope = Events.createScope();

        const sectionId = this._sectionId;
        if (sectionId) {
            const onVariantChange = (e) => {
                if (e.detail?.sectionId !== sectionId) return;
                const variant = e.detail.variant;
                if (!variant) return;
                this._resolveFromVariant(variant, { resetQty: true });
                this._notify();
            };
            this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);
        }

        if (this.surface === 'product') {
            this.$nextTick(() => {
                const cart = store('cart');
                if (!cart || typeof this.$watch !== 'function') return;
                this._cartUnwatch = this.$watch(
                    () => {
                        const current = store('cart');
                        return `${current?.item_count || 0}:${(current?.items || [])
                            .map((item) => `${item.variant_id || item.id}:${item.quantity}`)
                            .join(',')}`;
                    },
                    () => this._syncFromCart(),
                );
            });
        }
    },

    _snapToStep(raw) {
        const min = this.min;
        const step = this.step || 1;
        let next = raw;
        if (this.max !== null && next > this.max) next = this.max;
        if (next < min) next = min;
        const offset = next - min;
        const snapped = min + Math.round(offset / step) * step;
        next = snapped;
        if (this.max !== null && next > this.max) {
            const floored = min + Math.floor((this.max - min) / step) * step;
            next = Math.max(min, floored);
        }
        if (next < min) next = min;
        return next;
    },

    increment() {
        if (!this.canIncrement) {
            this._toast(this._msgMax, '%%MAX%%', this.max);
            return;
        }
        this.qty = this.qty + this.step;
        this._notify();
    },

    decrement() {
        if (!this.canDecrement) {
            this._toast(this._msgMin, '%%MIN%%', this.min);
            return;
        }
        this.qty = Math.max(this.min, this.qty - this.step);
        this._notify();
    },

    onInput() {
        const raw = parseInt(this.qty, 10);
        if (isNaN(raw) || raw < this.min) {
            this._toast(this._msgBelowMin, '%%MIN%%', this.min);
            this.qty = this.min;
            this._notify();
            return;
        }
        if (this.max !== null && raw > this.max) {
            this._toast(this._msgAboveMax, '%%MAX%%', this.max);
            this.qty = this.max;
            this._notify();
            return;
        }
        this.qty = this._snapToStep(raw);
        this._notify();
    },

    _notify() {
        const Events = ThemeEvents;
        const events = Events.events;
        const detail = {
            value: this.qty,
            min: this.min,
            max: this.max,
            step: this.step,
            canPurchase: this.canPurchase,
            variantId: this.variantId,
        };
        Events.emit(events.PRODUCT_QUANTITY_CHANGED, detail, {
            target: this.$el,
            bubbles: true,
        });
    },

    _toast(template, key, value) {
        const msg = template ? template.replace(key, String(value)) : '';
        if (msg) store('toast')?.show?.(msg, 'info');
    },

    destroy() {
        if (typeof this._cartUnwatch === 'function') this._cartUnwatch();
        this._cartUnwatch = null;
        this._eventScope?.dispose?.();
        this._eventScope = null;
        this._variant = null;
        this.dispose();
    },
}));
