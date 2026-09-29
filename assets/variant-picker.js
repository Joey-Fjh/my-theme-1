import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';

define('VariantPicker', () => ({
    ...useDisposable(),
    sectionId: '',
    productId: null,
    productFormId: '',
    galleryId: '',
    updateUrl: false,
    variants: [],
    selectedOptions: {},
    currentVariant: null,
    currentVariantId: null,
    _eventScope: null,
    _optionNames: [],

    init() {
        const dataset = this.$el?.dataset || {};
        this.sectionId = dataset.sectionId || this.sectionId || '';
        this.productId = Number(dataset.productId || this.productId || 0) || null;
        this.productFormId = dataset.productFormId || this.productFormId || '';
        this.galleryId = dataset.galleryId || this.galleryId || '';
        this.updateUrl = dataset.updateUrl === 'true';

        let variants = [];
        if (dataset.variants) {
            try {
                const parsed = JSON.parse(dataset.variants);
                variants = Array.isArray(parsed) ? parsed : [];
            } catch (_) {
                variants = [];
            }
        }

        let quantityMeta = {};
        if (dataset.variantsQuantityMeta) {
            try {
                const parsed = JSON.parse(dataset.variantsQuantityMeta);
                quantityMeta =
                    parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
            } catch (_) {
                quantityMeta = {};
            }
        }

        this.variants = this._mergeQuantityMeta(variants, quantityMeta);

        this._buildOptionNames();
        this._setInitialSelection();
        this._resolveVariant();

        this.$nextTick(() => this._dispatchChange());
    },

    _mergeQuantityMeta(variants, quantityMeta) {
        return (variants || []).map((variant) => {
            if (!variant || typeof variant !== 'object') return variant;
            const meta = quantityMeta?.[String(variant.id)] || quantityMeta?.[variant.id];
            if (!meta || typeof meta !== 'object') return { ...variant };
            return {
                ...variant,
                inventory_management: meta.inventory_management,
                inventory_policy: meta.inventory_policy,
                inventory_quantity: meta.inventory_quantity,
                quantity_rule: meta.quantity_rule,
            };
        });
    },

    _buildOptionNames() {
        this._optionNames = [];
        const children = this.$el.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const legend = child.querySelector('legend');
            const label = child.querySelector('label');
            const textEl = legend || label;
            if (!textEl) continue;
            this._optionNames.push(textEl.textContent.split(':')[0].trim());
        }
    },

    _setInitialSelection() {
        const first = this.variants.find((v) => v.available) || this.variants[0];
        if (!first) return;
        first.options.forEach((val, i) => {
            const name = this._optionNameByPosition(i + 1);
            if (name) this.selectedOptions[name] = val;
        });
        this.currentVariant = first;
        this.currentVariantId = first.id;
    },

    _optionNameByPosition(pos) {
        return this._optionNames[pos - 1] || null;
    },

    onVariantChange() {
        this._resolveVariant();
        this._dispatchChange();
    },

    _resolveVariant() {
        const match = this.variants.find((v) =>
            v.options.every((val, i) => {
                const name = this._optionNameByPosition(i + 1);
                return name && this.selectedOptions[name] === val;
            }),
        );

        this.currentVariant = match || null;
        this.currentVariantId = match?.id || null;
    },

    _dispatchChange() {
        const variant = this.currentVariant;
        const Events = ThemeEvents;
        const events = Events.events;
        const detail = {
            sectionId: this.sectionId,
            productId: this.productId,
            variant,
        };

        Events.emit(events.PRODUCT_VARIANT_CHANGED, detail);

        if (variant?.featured_image?.position) {
            const galleryDetail = {
                index: variant.featured_image.position - 1,
            };
            if (this.galleryId) {
                galleryDetail.id = this.galleryId;
            }
            Events.emit(events.PRODUCT_GALLERY_SLIDE_TO_REQUEST, galleryDetail);
        }

        this._updateUrl(variant);
    },

    _updateUrl(variant) {
        if (!variant || !this.updateUrl) return;
        const url = new URL(window.location);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url);
    },

    isValueAvailable(optionName, value) {
        const test = {
            ...this.selectedOptions,
            [optionName]: value,
        };
        return this.variants.some((v) => {
            if (!v.available) return false;
            return v.options.every((val, i) => {
                const name = this._optionNameByPosition(i + 1);
                return !name || !(name in test) || test[name] === val;
            });
        });
    },

    destroy() {
        this.dispose();
    },
}));
