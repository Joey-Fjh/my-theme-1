import { define, store, data } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';
import QuantityConstraints from './quantity-constraints.js';

define('BuyButtons', () => ({
    ...useDisposable(),
    sectionId: '',
    productFormId: '',
    available: true,
    variantId: null,
    openCartOnAdd: false,
    openDialogId: '',
    successMessage: '',
    requestSections: '',
    showBuyNow: false,
    cartType: 'drawer',
    cartUrl: '',
    isLoading: false,
    canPurchaseQuantity: true,
    _eventScope: null,
    _buttonLabels: {
        addToCart: '',
        soldOut: '',
        maximumInCart: '',
        unavailable: '',
    },

    get buttonText() {
        const labels = this._buttonLabels || {};
        if (!this.variantId) return labels.unavailable || '';
        if (!this.available) return labels.soldOut || '';
        if (!this.canPurchaseQuantity) {
            return labels.maximumInCart || labels.addToCart || '';
        }
        return labels.addToCart || '';
    },

    init() {
        const dataset = this.$el?.dataset || {};
        this._buttonLabels = {
            addToCart: dataset.addToCartText || '',
            soldOut: dataset.soldOutText || '',
            maximumInCart: dataset.maximumInCartText || '',
            unavailable: dataset.unavailableText || '',
        };

        this.sectionId = this.sectionId || dataset.sectionId || '';
        this.productFormId = this.productFormId || dataset.productFormId || '';

        if (dataset.available !== undefined && dataset.available !== '') {
            this.available = dataset.available === 'true';
        }

        if (dataset.variantId !== undefined && dataset.variantId !== '') {
            this.variantId = Number(dataset.variantId) || null;
        }

        if (dataset.openCartOnAdd !== undefined && dataset.openCartOnAdd !== '') {
            this.openCartOnAdd = dataset.openCartOnAdd === 'true';
        }

        if (dataset.openDialogId !== undefined) {
            this.openDialogId = dataset.openDialogId || '';
        }

        if (dataset.successMessage !== undefined) {
            this.successMessage = dataset.successMessage || '';
        }

        if (dataset.showBuyNow !== undefined && dataset.showBuyNow !== '') {
            this.showBuyNow = dataset.showBuyNow === 'true';
        }

        if (dataset.cartType !== undefined && dataset.cartType !== '') {
            this.cartType = dataset.cartType;
        }

        if (dataset.cartUrl !== undefined && dataset.cartUrl !== '') {
            this.cartUrl = dataset.cartUrl;
        }

        if (dataset.requestSections !== undefined) {
            this.requestSections = dataset.requestSections
                ? dataset.requestSections
                      .split(',')
                      .map((value) => value.trim())
                      .filter(Boolean)
                : [];
        }

        const Events = ThemeEvents;
        const events = Events.events;
        this._eventScope = Events.createScope();

        const onVariantChange = (e) => {
            if (e.detail?.sectionId !== this.sectionId) return;
            const variant = e.detail.variant;
            this.variantId = variant?.id || null;
            this.available = variant?.available || false;
            this._syncQuantityPurchaseState(variant);
        };

        const onQuantityChange = (e) => {
            const root = e.target?.closest?.('.quantity-selector') || e.target;
            const rootSection = root?.dataset?.qtySectionId;
            if (rootSection && rootSection !== String(this.sectionId)) return;
            if (!rootSection && !this.$el?.contains?.(e.target)) return;
            if (typeof e.detail?.canPurchase === 'boolean') {
                this.canPurchaseQuantity = e.detail.canPurchase;
            }
        };

        this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);
        this._eventScope.on(events.PRODUCT_QUANTITY_CHANGED, onQuantityChange);
        this.$nextTick(() => this._syncQuantityPurchaseState());
    },

    _quantityRoot() {
        return (
            this.$el?.querySelector?.('.quantity-selector') ||
            document.querySelector(
                `.quantity-selector[data-qty-section-id="${CSS.escape(this.sectionId || '')}"]`,
            )
        );
    },

    _syncQuantityPurchaseState(variant) {
        const root = this._quantityRoot();
        if (root?.dataset?.qtyCanPurchase === 'false') {
            this.canPurchaseQuantity = false;
            return;
        }

        const api = QuantityConstraints;
        if (!variant) {
            this.canPurchaseQuantity = root?.dataset?.qtyCanPurchase !== 'false';
            return;
        }

        const cartItems = store('cart')?.items || [];
        const cartQuantity = api.cartQuantityForVariant(variant.id, cartItems);
        const resolved = api.fromVariant(variant, {
            surface: 'product',
            cartQuantity,
        });
        this.canPurchaseQuantity = resolved.canPurchase !== false;
    },

    _getQuantity() {
        const form = document.getElementById(this.productFormId);
        const qtyInput =
            form?.querySelector('input[name="quantity"]') ||
            document.querySelector(`input[name="quantity"][form="${this.productFormId}"]`);
        return qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
    },

    _quantityAllowsSubmit() {
        if (!this.canPurchaseQuantity) return false;
        const root = this._quantityRoot();
        if (!root) return true;
        if (root.dataset?.qtyCanPurchase === 'false') return false;
        const input = root.querySelector('input[name="quantity"]');
        if (!input) return true;
        const qty = parseInt(input.value, 10);
        const min = input.min !== '' ? Number(input.min) : 1;
        const max = input.max !== '' ? Number(input.max) : null;
        if (!Number.isFinite(qty) || qty < min) return false;
        if (Number.isFinite(max) && qty > max) return false;
        return true;
    },

    _getSections() {
        return Array.isArray(this.requestSections)
            ? this.requestSections
            : typeof this.requestSections === 'string' && this.requestSections.trim()
              ? this.requestSections
                    .split(',')
                    .map((value) => value.trim())
                    .filter(Boolean)
              : this.sectionId
                ? [this.sectionId]
                : [];
    },

    _getRecipientApi() {
        const root = this.$el?.querySelector?.('[data-gift-card-recipient]');
        if (!root) return null;
        return data(root);
    },

    _collectLineItemProperties() {
        const form = document.getElementById(this.productFormId);
        if (!form) return null;

        const formData = new FormData(form);
        const properties = {};
        let hasProperties = false;

        formData.forEach((value, key) => {
            const match = /^properties\[(.*)\]$/.exec(key);
            if (!match) return;
            properties[match[1]] = value;
            hasProperties = true;
        });

        return hasProperties ? properties : null;
    },

    _buildCartItem() {
        const item = {
            id: this.variantId,
            quantity: this._getQuantity(),
        };
        const properties = this._collectLineItemProperties();
        if (properties) item.properties = properties;

        const sellingPlanInput = this.$el?.querySelector?.(
            'input[name="selling_plan"]:not(:disabled)',
        );
        const sellingPlanId = sellingPlanInput?.value;
        if (sellingPlanId) {
            item.selling_plan = Number(sellingPlanId) || sellingPlanId;
        }

        return item;
    },

    addToCart() {
        if (!this.available || !this.variantId || this.isLoading || !this._quantityAllowsSubmit())
            return;

        const recipient = this._getRecipientApi();
        if (recipient && typeof recipient.validate === 'function' && !recipient.validate()) {
            return;
        }

        this.isLoading = true;
        const cart = store('cart');
        if (!cart) {
            this.isLoading = false;
            return;
        }

        const sections = this._getSections();

        cart.add([this._buildCartItem()], sections)
            .then(() => {
                if (recipient && typeof recipient.resetAfterSuccess === 'function') {
                    recipient.resetAfterSuccess();
                }

                if (this.cartType === 'page') {
                    if (this.successMessage) {
                        store('toast')?.show?.(this.successMessage, 'success');
                    }
                    window.location.assign(this.cartUrl);
                } else {
                    if (this.openCartOnAdd && this.openDialogId) {
                        store('dialog')?.open?.(this.openDialogId);
                    }

                    if (this.successMessage) {
                        store('toast')?.show?.(this.successMessage, 'success');
                    }
                }
            })
            .catch((err) => {
                if (recipient && typeof recipient.displayCartErrors === 'function') {
                    recipient.displayCartErrors(err);
                }
            })
            .finally(() => {
                this.isLoading = false;
            });
    },

    buyNow() {
        if (!this.available || !this.variantId || this.isLoading || !this._quantityAllowsSubmit())
            return;

        const recipient = this._getRecipientApi();
        if (recipient?.enabled) {
            return;
        }
        if (recipient && typeof recipient.validate === 'function' && !recipient.validate()) {
            return;
        }

        this.isLoading = true;
        const cart = store('cart');
        if (!cart) {
            this.isLoading = false;
            return;
        }

        cart.add([this._buildCartItem()], [])
            .then(() => {
                window.location.assign(
                    (window.Shopify?.routes?.root || '/').replace(/\/+$/, '') + '/checkout',
                );
            })
            .catch((err) => {
                if (recipient && typeof recipient.displayCartErrors === 'function') {
                    recipient.displayCartErrors(err);
                }
            })
            .finally(() => {
                this.isLoading = false;
            });
    },

    destroy() {
        this._eventScope?.dispose?.();
        this._eventScope = null;
        this.dispose();
    },
}));
