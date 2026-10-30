import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';

define('ProductPrice', () => ({
    ...useDisposable(),
    sectionId: '',
    price: 0,
    comparePrice: 0,
    currency: 'USD',
    unitPriceText: '',
    unitPrices: {},
    _variantPrice: 0,
    _variantComparePrice: 0,
    _eventScope: null,

    _formatPrice(value) {
        const cents = Number(value || 0);
        if (typeof window.Shopify?.formatMoney === 'function') {
            return window.Shopify.formatMoney(cents);
        }
        const locale = document.documentElement.lang || undefined;
        const currency = window.Shopify?.currency?.active || this.currency || 'USD';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            currencyDisplay: 'narrowSymbol',
        }).format(cents / 100);
    },

    get formattedPrice() {
        return this._formatPrice(this.price);
    },
    get formattedComparePrice() {
        return this._formatPrice(this.comparePrice);
    },
    get hasComparePrice() {
        return this.comparePrice > this.price;
    },
    get hasUnitPrice() {
        return Boolean(this.unitPriceText);
    },

    _parseUnitPrices(raw) {
        if (!raw) {
            this.unitPrices = {};
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            this.unitPrices =
                parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
        } catch (_) {
            this.unitPrices = {};
        }
    },

    _lookupUnitPrice(variantId) {
        if (variantId == null || variantId === '') return '';
        const value = this.unitPrices[String(variantId)];
        return typeof value === 'string' && value.trim() ? value : '';
    },

    init() {
        const dataset = this.$el?.dataset || {};
        this.sectionId = this.sectionId || dataset.sectionId || '';
        this.price = Number(dataset.price ?? this.price ?? 0);
        this.comparePrice = Number(dataset.comparePrice ?? this.comparePrice ?? 0);
        this.currency = dataset.currency || this.currency || 'USD';
        this._parseUnitPrices(dataset.unitPrices);
        this.unitPriceText = this._lookupUnitPrice(dataset.variantId);
        this._variantPrice = this.price;
        this._variantComparePrice = this.comparePrice;

        const events = ThemeEvents.events;
        this._eventScope = ThemeEvents.createScope();

        const onVariantChange = (e) => {
            if (e.detail?.sectionId !== this.sectionId) return;
            const v = e.detail.variant;
            if (!v) {
                this.unitPriceText = '';
                return;
            }
            if (typeof v.price === 'number') {
                this._variantPrice = v.price;
                this.price = v.price;
            }
            if (v.compare_at_price == null || typeof v.compare_at_price === 'number') {
                this._variantComparePrice = Number(v.compare_at_price || 0);
                this.comparePrice = this._variantComparePrice;
            }
            this.unitPriceText = this._lookupUnitPrice(v.id);
        };

        const onSellingPlanChange = (e) => {
            if (e.detail?.sectionId !== this.sectionId) return;
            if (e.detail?.active && typeof e.detail.price === 'number') {
                this.price = e.detail.price;
                this.comparePrice = Number(e.detail.compareAtPrice || 0);
                return;
            }
            this.price = this._variantPrice;
            this.comparePrice = this._variantComparePrice;
        };

        this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);
        this._eventScope.on(events.PRODUCT_SELLING_PLAN_CHANGED, onSellingPlanChange);
    },

    destroy() {
        this._eventScope?.dispose?.();
        this._eventScope = null;
        this.dispose();
    },
}));
