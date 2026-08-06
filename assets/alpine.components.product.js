(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineComponentGroups = window.__Theme__.AlpineComponentGroups || {};

    const AlpineComponentsFactory = window.__Theme__?.AlpineComponentsFactory;
    const ComponentGroups = window.__Theme__.AlpineComponentGroups;

    if (!AlpineComponentsFactory) return;

    ComponentGroups.product = {
        ProductPrice({ sectionId, price = 0, comparePrice = 0, currency = 'USD' } = {}) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                sectionId,
                price,
                comparePrice,
                currency,
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
                            parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                                ? parsed
                                : {};
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

                    const Events = window.__Theme__.Events;
                    const events = Events.events;
                    this._eventScope = Events.createScope();

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
            };
        },

        ProductPaymentTerms() {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                sectionId: '',
                _eventScope: null,
                _idInput: null,

                init() {
                    const dataset = this.$el?.dataset || {};
                    this.sectionId = dataset.sectionId || '';
                    this._idInput = this.$el.querySelector('input[name="id"]');

                    const Events = window.__Theme__.Events;
                    const events = Events.events;
                    this._eventScope = Events.createScope();

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
            };
        },

        VariantPicker() {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                sectionId: '',
                productId: null,
                productFormId: '',
                variants: [],
                selectedOptions: {},
                currentVariant: null,
                currentVariantId: null,
                _eventScope: null,

                init() {
                    const dataset = this.$el?.dataset || {};
                    this.sectionId = dataset.sectionId || this.sectionId || '';
                    this.productId = Number(dataset.productId || this.productId || 0) || null;
                    this.productFormId = dataset.productFormId || this.productFormId || '';

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
                                parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                                    ? parsed
                                    : {};
                        } catch (_) {
                            quantityMeta = {};
                        }
                    }

                    this.variants = this._mergeQuantityMeta(variants, quantityMeta);

                    const Events = window.__Theme__.Events;
                    const events = Events.events;
                    this._eventScope = Events.createScope();

                    this._buildOptionNames();
                    this._setInitialSelection();
                    this._resolveVariant();

                    this.$nextTick(() => this._dispatchChange());

                    const onVariantSetRequest = (e) => {
                        if (e.detail?.sectionId !== this.sectionId) return;
                        if (e.detail.options) {
                            Object.assign(this.selectedOptions, e.detail.options);
                            this._resolveVariant();
                            this._dispatchChange();
                        }
                    };

                    this._eventScope.on(events.PRODUCT_VARIANT_SET_REQUEST, onVariantSetRequest);
                },

                _mergeQuantityMeta(variants, quantityMeta) {
                    return (variants || []).map((variant) => {
                        if (!variant || typeof variant !== 'object') return variant;
                        const meta =
                            quantityMeta?.[String(variant.id)] || quantityMeta?.[variant.id];
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

                _optionNames: [],

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
                    const Events = window.__Theme__.Events;
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
                        Events.emit(events.PRODUCT_GALLERY_SLIDE_TO_REQUEST, galleryDetail);
                    }

                    this._updateUrl(variant);
                },

                _updateUrl(variant) {
                    if (!variant) return;
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
                    this._eventScope?.dispose?.();
                    this._eventScope = null;
                    this.dispose();
                },
            };
        },

        QuantitySelector({ value = 1, min = 1, max = null, step = 1, sectionId = null } = {}) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                qty: value,
                min,
                max,
                step,
                canPurchase: true,
                surface: 'product',
                variantId: null,
                cartQuantity: 0,
                _eventScope: null,
                _sectionId: sectionId,
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

                _constraintsApi() {
                    return window.__Theme__?.QuantityConstraints;
                },

                _cartItems() {
                    return window.Alpine?.store?.('cart')?.items || [];
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
                    const api = this._constraintsApi();
                    if (!api || !variant) return;

                    let cartQuantity = this.cartQuantity;
                    if (this.surface === 'product') {
                        cartQuantity = api.cartQuantityForVariant(variant.id, this._cartItems());
                    }

                    const resolved = api.fromVariant(variant, {
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
                    else this.max = null;
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

                    const Events = window.__Theme__.Events;
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
                            const cart = window.Alpine?.store?.('cart');
                            if (!cart || typeof this.$watch !== 'function') return;
                            this._cartUnwatch = this.$watch(
                                () => {
                                    const current = window.Alpine.store('cart');
                                    return `${current?.item_count || 0}:${(current?.items || [])
                                        .map(
                                            (item) =>
                                                `${item.variant_id || item.id}:${item.quantity}`,
                                        )
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
                    const Events = window.__Theme__.Events;
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
                    if (msg) window.Alpine?.store('toast')?.show?.(msg, 'info');
                },

                destroy() {
                    if (typeof this._cartUnwatch === 'function') this._cartUnwatch();
                    this._cartUnwatch = null;
                    this._eventScope?.dispose?.();
                    this._eventScope = null;
                    this._variant = null;
                    this.dispose();
                },
            };
        },

        GiftCardRecipient() {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                jsReady: false,
                enabled: false,
                showErrorSummary: false,
                _copy: {
                    expanded: '',
                    collapsed: '',
                    emailBlank: '',
                    emailInvalid: '',
                    nameTooLong: '',
                    messageTooLong: '',
                    sendOnInvalid: '',
                    errorHeading: '',
                },
                _sendOnMin: '',
                _sendOnMax: '',

                init() {
                    const dataset = this.$el?.dataset || {};
                    this._copy.expanded = dataset.expandedText || '';
                    this._copy.collapsed = dataset.collapsedText || '';
                    this._copy.emailBlank = dataset.emailBlankText || '';
                    this._copy.emailInvalid = dataset.emailInvalidText || '';
                    this._copy.nameTooLong = dataset.nameTooLongText || '';
                    this._copy.messageTooLong = dataset.messageTooLongText || '';
                    this._copy.sendOnInvalid = dataset.sendOnInvalidText || '';
                    this._copy.errorHeading = dataset.errorHeading || '';
                    this._sendOnMin = dataset.sendOnMin || '';
                    this._sendOnMax = dataset.sendOnMax || '';

                    this.enabled = dataset.hasErrors === 'true';
                    this.showErrorSummary = dataset.hasErrors === 'true';
                    this.jsReady = true;

                    if (this.$refs.offset) {
                        this.$refs.offset.value = String(new Date().getTimezoneOffset());
                    }

                    this.$nextTick(() => {
                        this._syncLiveRegion();
                        this._applyDateBounds();
                    });
                },

                onToggle() {
                    if (!this.enabled) {
                        this._clearInputValues();
                        this.clearErrors();
                    } else {
                        this._applyDateBounds();
                        if (this.$refs.offset) {
                            this.$refs.offset.value = String(new Date().getTimezoneOffset());
                        }
                    }
                    this._syncLiveRegion();
                },

                _syncLiveRegion() {
                    if (!this.$refs.liveRegion) return;
                    this.$refs.liveRegion.textContent = this.enabled
                        ? this._copy.expanded
                        : this._copy.collapsed;
                },

                _applyDateBounds() {
                    const input = this.$refs.sendOn;
                    if (!input) return;
                    if (this._sendOnMin) input.min = this._sendOnMin;
                    if (this._sendOnMax) input.max = this._sendOnMax;
                },

                _clearInputValues() {
                    ['email', 'name', 'message', 'sendOn'].forEach((refName) => {
                        const field = this.$refs[refName];
                        if (field) field.value = '';
                    });
                },

                _fieldMap() {
                    return {
                        email: this.$refs.email,
                        name: this.$refs.name,
                        message: this.$refs.message,
                        send_on: this.$refs.sendOn,
                    };
                },

                _errorNodeMap() {
                    return {
                        email: this.$refs.emailError,
                        name: this.$refs.nameError,
                        message: this.$refs.messageError,
                        send_on: this.$refs.sendOnError,
                    };
                },

                _isValidEmail(value) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },

                _normalizeErrorText(value) {
                    if (Array.isArray(value)) {
                        return value.filter(Boolean).join(', ');
                    }
                    if (typeof value === 'string') return value.trim();
                    if (value == null) return '';
                    return String(value);
                },

                clearErrors() {
                    this.showErrorSummary = false;
                    if (this.$refs.errorList) {
                        this.$refs.errorList.replaceChildren();
                    }
                    if (this.$refs.errorHeading) {
                        this.$refs.errorHeading.textContent = this._copy.errorHeading;
                    }

                    const fields = this._fieldMap();
                    const errorNodes = this._errorNodeMap();
                    Object.keys(fields).forEach((key) => {
                        const field = fields[key];
                        const errorNode = errorNodes[key];
                        if (field) {
                            field.removeAttribute('aria-invalid');
                            if (errorNode?.id) {
                                const remaining = (field.getAttribute('aria-describedby') || '')
                                    .split(/\s+/)
                                    .filter(Boolean)
                                    .filter((id) => id !== errorNode.id);
                                if (remaining.length) {
                                    field.setAttribute('aria-describedby', remaining.join(' '));
                                } else {
                                    field.removeAttribute('aria-describedby');
                                }
                            }
                        }
                        if (errorNode) {
                            errorNode.hidden = true;
                            errorNode.textContent = '';
                        }
                    });
                },

                _setFieldError(key, message) {
                    const field = this._fieldMap()[key];
                    const errorNode = this._errorNodeMap()[key];
                    if (!message) return;
                    const text = message.endsWith('.') ? message : `${message}.`;

                    if (errorNode) {
                        errorNode.hidden = false;
                        errorNode.textContent = text;
                    }

                    if (field && errorNode?.id) {
                        field.setAttribute('aria-invalid', 'true');
                        const describedBy = new Set(
                            (field.getAttribute('aria-describedby') || '')
                                .split(/\s+/)
                                .filter(Boolean),
                        );
                        describedBy.add(errorNode.id);
                        field.setAttribute('aria-describedby', Array.from(describedBy).join(' '));
                    }

                    if (this.$refs.errorList) {
                        const li = document.createElement('li');
                        if (field?.id) {
                            const link = document.createElement('a');
                            link.href = `#${field.id}`;
                            link.className = 'underline';
                            link.textContent = text;
                            li.appendChild(link);
                        } else {
                            li.textContent = text;
                        }
                        this.$refs.errorList.appendChild(li);
                    }
                },

                displayErrors(errors, heading) {
                    this.clearErrors();
                    const headingText =
                        typeof heading === 'string' && heading.trim()
                            ? heading.trim()
                            : this._copy.errorHeading;
                    if (this.$refs.errorHeading) {
                        this.$refs.errorHeading.textContent = headingText;
                    }

                    let hasFieldErrors = false;
                    if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
                        Object.entries(errors).forEach(([key, value]) => {
                            const message = this._normalizeErrorText(value);
                            if (!message) return;
                            if (key === 'form') {
                                if (this.$refs.errorList) {
                                    const li = document.createElement('li');
                                    li.textContent = message;
                                    this.$refs.errorList.appendChild(li);
                                }
                                hasFieldErrors = true;
                                return;
                            }
                            this._setFieldError(key, message);
                            hasFieldErrors = true;
                        });
                    } else {
                        const message = this._normalizeErrorText(errors);
                        if (message && this.$refs.errorList) {
                            const li = document.createElement('li');
                            li.textContent = message;
                            this.$refs.errorList.appendChild(li);
                            hasFieldErrors = true;
                        }
                    }

                    this.showErrorSummary = hasFieldErrors;
                    if (hasFieldErrors) {
                        this.$nextTick(() => {
                            this.$refs.errorSummary?.focus?.();
                        });
                    }
                },

                displayCartErrors(err) {
                    const data = err?.data && typeof err.data === 'object' ? err.data : null;
                    if (!data) return;
                    const errors = data.errors || data.description || data.message;
                    const heading =
                        typeof data.message === 'string' ? data.message : this._copy.errorHeading;
                    this.displayErrors(errors, heading);
                },

                validate() {
                    if (!this.enabled) {
                        this.clearErrors();
                        return true;
                    }

                    this.clearErrors();
                    const email = (this.$refs.email?.value || '').trim();
                    const name = (this.$refs.name?.value || '').trim();
                    const message = this.$refs.message?.value || '';
                    const sendOn = (this.$refs.sendOn?.value || '').trim();
                    let valid = true;

                    if (!email) {
                        this._setFieldError('email', this._copy.emailBlank);
                        valid = false;
                    } else if (!this._isValidEmail(email)) {
                        this._setFieldError('email', this._copy.emailInvalid);
                        valid = false;
                    }

                    if (name.length > 255) {
                        this._setFieldError('name', this._copy.nameTooLong);
                        valid = false;
                    }

                    if (message.length > 200) {
                        this._setFieldError('message', this._copy.messageTooLong);
                        valid = false;
                    }

                    if (sendOn) {
                        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                        if (
                            !datePattern.test(sendOn) ||
                            (this._sendOnMin && sendOn < this._sendOnMin) ||
                            (this._sendOnMax && sendOn > this._sendOnMax)
                        ) {
                            this._setFieldError('send_on', this._copy.sendOnInvalid);
                            valid = false;
                        }
                    }

                    this.showErrorSummary = !valid;
                    if (!valid) {
                        this.$nextTick(() => {
                            const firstInvalid =
                                this.$el?.querySelector?.('[aria-invalid="true"]') ||
                                this.$refs.errorSummary;
                            firstInvalid?.focus?.();
                        });
                    }
                    return valid;
                },

                resetAfterSuccess() {
                    if (!this.enabled) return;
                    this.enabled = false;
                    this._clearInputValues();
                    this.clearErrors();
                    this._syncLiveRegion();
                },

                destroy() {
                    this.dispose();
                },
            };
        },

        BuyButtons({
            sectionId,
            productFormId,
            available = true,
            variantId = null,
            openCartOnAdd = false,
            openDialogId = '',
            successMessage = '',
            requestSections = '',
            showBuyNow = false,
            cartType = 'drawer',
            cartUrl = '',
        } = {}) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                sectionId,
                productFormId,
                available,
                variantId,
                openCartOnAdd,
                openDialogId,
                successMessage,
                requestSections,
                showBuyNow,
                cartType,
                cartUrl,
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

                    const Events = window.__Theme__.Events;
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

                    const api = window.__Theme__?.QuantityConstraints;
                    if (!api || !variant) {
                        this.canPurchaseQuantity = root?.dataset?.qtyCanPurchase !== 'false';
                        return;
                    }

                    const cartItems = window.Alpine?.store?.('cart')?.items || [];
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
                        document.querySelector(
                            `input[name="quantity"][form="${this.productFormId}"]`,
                        );
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
                    if (!root || typeof window.Alpine?.$data !== 'function') return null;
                    return window.Alpine.$data(root);
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
                    if (
                        !this.available ||
                        !this.variantId ||
                        this.isLoading ||
                        !this._quantityAllowsSubmit()
                    )
                        return;

                    const recipient = this._getRecipientApi();
                    if (
                        recipient &&
                        typeof recipient.validate === 'function' &&
                        !recipient.validate()
                    ) {
                        return;
                    }

                    this.isLoading = true;
                    const cart = window.Alpine?.store('cart');
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
                                    window.Alpine?.store('toast')?.show?.(
                                        this.successMessage,
                                        'success',
                                    );
                                }
                                window.location.assign(this.cartUrl);
                            } else {
                                if (this.openCartOnAdd && this.openDialogId) {
                                    window.Alpine?.store('dialog')?.open?.(this.openDialogId);
                                }

                                if (this.successMessage) {
                                    window.Alpine?.store('toast')?.show?.(
                                        this.successMessage,
                                        'success',
                                    );
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
                    if (
                        !this.available ||
                        !this.variantId ||
                        this.isLoading ||
                        !this._quantityAllowsSubmit()
                    )
                        return;

                    const recipient = this._getRecipientApi();
                    if (recipient?.enabled) {
                        return;
                    }
                    if (
                        recipient &&
                        typeof recipient.validate === 'function' &&
                        !recipient.validate()
                    ) {
                        return;
                    }

                    this.isLoading = true;
                    const cart = window.Alpine?.store('cart');
                    if (!cart) {
                        this.isLoading = false;
                        return;
                    }

                    cart.add([this._buildCartItem()], [])
                        .then(() => {
                            window.location.assign(
                                (window.Shopify?.routes?.root || '/').replace(/\/+$/, '') +
                                    '/checkout',
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
            };
        },

        PickupAvailability({
            sectionId,
            variantId = null,
            rootUrl = '/',
            loadingText = '',
            errorText = '',
            retryText = '',
        } = {}) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                sectionId,
                variantId,
                rootUrl,
                loadingText,
                errorText,
                retryText,
                isLoading: false,
                hasContent: false,
                showError: false,
                _abortController: null,
                _eventScope: null,

                init() {
                    const dataset = this.$el?.dataset || {};
                    this.sectionId = this.sectionId || dataset.sectionId || '';
                    this.rootUrl = dataset.rootUrl || this.rootUrl || '/';
                    this.variantId = Number(dataset.variantId || this.variantId || 0) || null;
                    this.loadingText = dataset.loadingText || this.loadingText;
                    this.errorText = dataset.errorText || this.errorText;
                    this.retryText = dataset.retryText || this.retryText;

                    const Events = window.__Theme__.Events;
                    const events = Events.events;
                    this._eventScope = Events.createScope();

                    const onVariantChange = (e) => {
                        if (e.detail?.sectionId !== this.sectionId) return;
                        this.variantId = e.detail?.variant?.id || null;
                        this.load();
                    };

                    this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);

                    this.load();
                },

                get requestUrl() {
                    if (!this.variantId) return '';
                    const normalizedRoot = String(this.rootUrl || '/').replace(/\/?$/, '/');
                    return `${normalizedRoot}variants/${this.variantId}/?section_id=pickup-availability`;
                },

                retry() {
                    if (this.isLoading) return;
                    this.load();
                },

                get contentTarget() {
                    return this.$el?.querySelector('[data-pickup-availability-content]') || null;
                },

                buildDomMap() {
                    if (!this.sectionId) return {};
                    return {
                        'pickup-availability': {
                            targetSelector: `[data-pickup-availability-root="${CSS.escape(this.sectionId)}"]`,
                            innerSelectors: ['[data-pickup-availability-content]'],
                        },
                    };
                },

                clearContent() {
                    this.hasContent = false;
                    this.showError = false;
                    this.contentTarget?.replaceChildren();
                },

                load() {
                    if (!this.requestUrl) {
                        this.clearContent();
                        return;
                    }

                    if (this._abortController) this._abortController.abort();
                    this._abortController = new AbortController();
                    const ctrl = this._abortController;

                    this.isLoading = true;
                    this.showError = false;

                    const Http = window.ShopifyHttp;
                    const SectionRefresher = window.ShopifySectionRefresher;
                    if (!Http?.request || !SectionRefresher) {
                        this.isLoading = false;
                        this.showError = true;
                        return;
                    }

                    Http.request(this.requestUrl, {
                        method: 'GET',
                        headers: { Accept: 'text/html' },
                        signal: ctrl.signal,
                    })
                        .then((res) => res.text())
                        .then((html) => {
                            const doc = new DOMParser().parseFromString(html, 'text/html');
                            const rendered = doc.querySelector(
                                '[data-pickup-availability-content]',
                            );
                            const isEmpty = rendered?.dataset?.empty === 'true';

                            if (!rendered || isEmpty) {
                                this.clearContent();
                                return;
                            }

                            SectionRefresher.render(
                                { 'pickup-availability': html },
                                this.buildDomMap(),
                            );
                            this.hasContent = true;
                            this.showError = false;
                        })
                        .catch((err) => {
                            if (err?.isAbort || err?.name === 'AbortError') return;
                            console.error('Pickup availability load failed:', err);
                            this.showError = true;
                        })
                        .finally(() => {
                            if (this._abortController === ctrl) {
                                this._abortController = null;
                            }
                            this.isLoading = false;
                        });
                },

                destroy() {
                    this._eventScope?.dispose?.();
                    this._eventScope = null;
                    if (this._abortController) this._abortController.abort();
                    this._abortController = null;
                    this.dispose();
                },
            };
        },

        productLayout() {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                stickySide: 'none',
                _resizeObserver: null,
                _frame: 0,
                _desktopQuery: null,
                _mediaTarget: null,
                _mediaPanel: null,
                _infoTarget: null,
                _infoBlocks: null,
                _descriptionBlock: null,
                _description: null,

                init() {
                    const el = this.$el;
                    this._mediaTarget = el.querySelector('[data-product-media-sticky-target]');
                    this._mediaPanel = el.querySelector('[data-product-media-panel]');
                    this._infoTarget = el.querySelector('[data-product-info-sticky-target]');
                    this._infoBlocks = el.querySelector(
                        '[data-product-info-panel] [data-product-info-blocks]',
                    );
                    this._descriptionBlock = this._infoBlocks?.querySelector(
                        '[data-product-description-block]',
                    );
                    this._description = this._descriptionBlock?.querySelector(
                        '[data-product-description]',
                    );

                    if (!this._mediaTarget || !this._infoTarget) return;

                    this._desktopQuery = window.matchMedia('(min-width: 48rem)');

                    this._resizeObserver = new ResizeObserver(() => this._sync());
                    this._resizeObserver.observe(this._mediaTarget);
                    this._resizeObserver.observe(this._infoTarget);
                    if (this._infoBlocks) {
                        Array.from(this._infoBlocks.children).forEach((child) => {
                            if (child !== this._descriptionBlock) {
                                this._resizeObserver.observe(child);
                            }
                        });
                    }

                    this.on(window, 'resize', () => this._sync());
                    this.on(window.visualViewport, 'resize', () => this._sync());
                    this.on(this._desktopQuery, 'change', () => this._sync());
                    this._sync();
                },

                _getViewportHeight() {
                    return window.visualViewport?.height || window.innerHeight;
                },

                _clearSticky(target) {
                    if (!target) return;
                    target.style.removeProperty('position');
                    target.style.removeProperty('top');
                    target.style.removeProperty('transition');
                },

                _applySticky(target) {
                    if (!target) return;
                    // Do not set align-self. Media sticky targets live in a flex-col
                    // column; align-self:start shrinks them on the cross axis and
                    // collapses gallery width when the info column grows.
                    target.style.position = 'sticky';
                    target.style.top = 'var(--product-sticky-top, 0px)';
                    target.style.transition = 'top 120ms ease-out';
                },

                _setStickyOffset() {
                    this.$el.style.setProperty('--product-sticky-top', '0px');
                },

                _resetDescription() {
                    this._infoBlocks?.style.removeProperty('max-height');
                    this._descriptionBlock?.style.removeProperty('max-height');
                    this._description?.style.removeProperty('max-height');
                    this._description?.removeAttribute('data-product-description-scrollable');
                    this._description?.removeAttribute('tabindex');
                },

                _setDescriptionLimit(maxHeight) {
                    if (!this._description) return;

                    this._descriptionBlock?.style.removeProperty('max-height');

                    const hasLimit = Number.isFinite(maxHeight);
                    const nextValue = hasLimit ? `${Math.max(0, Math.floor(maxHeight))}px` : '';
                    if (hasLimit) {
                        if (this._description.style.maxHeight !== nextValue) {
                            this._description.style.maxHeight = nextValue;
                        }
                    } else {
                        this._description.style.removeProperty('max-height');
                    }

                    const isScrollable =
                        hasLimit &&
                        this._description.scrollHeight > this._description.clientHeight + 1;
                    this._description.toggleAttribute(
                        'data-product-description-scrollable',
                        isScrollable,
                    );
                    if (isScrollable) {
                        this._description.setAttribute('tabindex', '0');
                    } else {
                        this._description.removeAttribute('tabindex');
                    }
                },

                _syncDescription(availableViewport) {
                    if (
                        !this._mediaPanel ||
                        !this._infoBlocks ||
                        !this._descriptionBlock ||
                        !this._description
                    ) {
                        this._resetDescription();
                        return;
                    }

                    const mediaPanelHeight = this._mediaPanel.getBoundingClientRect().height;
                    if (mediaPanelHeight <= 0 || availableViewport <= 0) {
                        this._resetDescription();
                        return;
                    }

                    const referenceHeight = Math.min(mediaPanelHeight, availableViewport);
                    const styles = window.getComputedStyle(this._infoBlocks);
                    const gap = parseFloat(styles.rowGap || styles.gap) || 0;
                    const paddingY =
                        (parseFloat(styles.paddingTop) || 0) +
                        (parseFloat(styles.paddingBottom) || 0);
                    const children = Array.from(this._infoBlocks.children).filter(
                        (child) =>
                            child instanceof HTMLElement &&
                            window.getComputedStyle(child).display !== 'none',
                    );
                    const otherBlocksHeight = children.reduce((total, child) => {
                        if (child === this._descriptionBlock) return total;
                        return total + child.getBoundingClientRect().height;
                    }, 0);
                    const gapsHeight = gap * Math.max(children.length - 1, 0);
                    const available = Math.floor(
                        referenceHeight - paddingY - gapsHeight - otherBlocksHeight,
                    );
                    const naturalHeight = this._description.scrollHeight;
                    const descriptionStyles = window.getComputedStyle(this._description);
                    const lineHeight = parseFloat(descriptionStyles.lineHeight) || 24;
                    const minimumScrollableHeight = Math.min(
                        naturalHeight,
                        Math.max(96, lineHeight * 4),
                    );

                    if (naturalHeight <= available + 1) {
                        this._setDescriptionLimit(null);
                        return;
                    }

                    this._setDescriptionLimit(Math.max(available, minimumScrollableHeight));
                },

                _resetSticky() {
                    this._clearSticky(this._mediaTarget);
                    this._clearSticky(this._infoTarget);
                    this.stickySide = 'none';
                },

                _reset() {
                    this._resetSticky();
                    this._resetDescription();
                },

                _sync() {
                    if (this._frame) cancelAnimationFrame(this._frame);
                    this._frame = requestAnimationFrame(() => {
                        this._frame = 0;
                        this._setStickyOffset();

                        if (!this._desktopQuery.matches) {
                            this._reset();
                            return;
                        }

                        const availableViewport = Math.max(0, this._getViewportHeight());
                        if (availableViewport <= 0) {
                            this._reset();
                            return;
                        }

                        this._clearSticky(this._mediaTarget);
                        this._clearSticky(this._infoTarget);
                        this._syncDescription(availableViewport);

                        const mediaHeight = this._mediaTarget.getBoundingClientRect().height;
                        const infoHeight = this._infoTarget.getBoundingClientRect().height;
                        if (mediaHeight <= 0) {
                            this._reset();
                            return;
                        }

                        const heightTolerance = 24;
                        const nextStickySide =
                            mediaHeight + heightTolerance < infoHeight ? 'media' : 'info';
                        const stickyTarget =
                            nextStickySide === 'media' ? this._mediaTarget : this._infoTarget;
                        const stickyHeight = nextStickySide === 'media' ? mediaHeight : infoHeight;

                        if (stickyHeight <= availableViewport) {
                            this._applySticky(stickyTarget);
                            this.stickySide = nextStickySide;
                        } else {
                            this.stickySide = 'none';
                        }
                    });
                },

                destroy() {
                    if (this._frame) cancelAnimationFrame(this._frame);
                    if (this._resizeObserver) this._resizeObserver.disconnect();
                    this._reset();
                    this.dispose();
                },
            };
        },

        SellingPlanPicker() {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                sectionId: '',
                variantId: null,
                requiresSellingPlan: false,
                variants: {},
                groups: [],
                availablePlans: [],
                selectedPlanId: '',
                oneTimeLabel: '',
                purchaseOptionsLabel: '',
                _eventScope: null,

                init() {
                    const dataset = this.$el?.dataset || {};
                    this.sectionId = dataset.sectionId || '';
                    this.variantId = Number(dataset.variantId) || null;
                    this.oneTimeLabel = dataset.oneTimeLabel || '';
                    this.purchaseOptionsLabel = dataset.purchaseOptionsLabel || '';

                    let payload = {};
                    try {
                        payload = dataset.sellingPlans ? JSON.parse(dataset.sellingPlans) : {};
                    } catch (_) {
                        payload = {};
                    }

                    this.requiresSellingPlan = Boolean(payload.requiresSellingPlan);
                    this.variants =
                        payload.variants && typeof payload.variants === 'object'
                            ? payload.variants
                            : {};
                    this.groups = Array.isArray(payload.groups) ? payload.groups : [];

                    const Events = window.__Theme__.Events;
                    const events = Events.events;
                    this._eventScope = Events.createScope();

                    const onVariantChange = (e) => {
                        if (e.detail?.sectionId !== this.sectionId) return;
                        this.variantId = e.detail?.variant?.id || null;
                        this._syncPlansForVariant({ preferCurrent: false });
                    };

                    this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);
                    this._syncPlansForVariant({ preferCurrent: true });
                },

                groupName(groupId) {
                    const group = this.groups.find((item) => String(item.id) === String(groupId));
                    return group?.name || '';
                },

                selectOneTime() {
                    this.selectedPlanId = '';
                    this._emitPlanChange(null);
                },

                selectPlan(planId) {
                    this.selectedPlanId = planId == null ? '' : String(planId);
                    const plan = this.availablePlans.find(
                        (item) => String(item.id) === String(this.selectedPlanId),
                    );
                    this._emitPlanChange(plan || null);
                },

                _plansForVariant(variantId) {
                    if (variantId == null || variantId === '') return [];
                    const plans = this.variants[String(variantId)];
                    return Array.isArray(plans) ? plans : [];
                },

                _syncPlansForVariant({ preferCurrent = false } = {}) {
                    this.availablePlans = this._plansForVariant(this.variantId);

                    if (this.availablePlans.length === 0) {
                        this.selectedPlanId = '';
                        this._emitPlanChange(null);
                        return;
                    }

                    const currentStillValid =
                        preferCurrent &&
                        this.selectedPlanId !== '' &&
                        this.availablePlans.some(
                            (plan) => String(plan.id) === String(this.selectedPlanId),
                        );

                    if (currentStillValid) {
                        this.selectPlan(this.selectedPlanId);
                        return;
                    }

                    if (this.requiresSellingPlan) {
                        this.selectPlan(this.availablePlans[0].id);
                        return;
                    }

                    this.selectOneTime();
                },

                _emitPlanChange(plan) {
                    const Events = window.__Theme__?.Events;
                    if (!Events?.emit || !Events.events?.PRODUCT_SELLING_PLAN_CHANGED) return;

                    Events.emit(Events.events.PRODUCT_SELLING_PLAN_CHANGED, {
                        sectionId: this.sectionId,
                        active: Boolean(plan),
                        sellingPlanId: plan?.id || null,
                        price: plan?.price,
                        compareAtPrice: plan?.compareAtPrice,
                    });
                },

                destroy() {
                    this._eventScope?.dispose?.();
                    this._eventScope = null;
                    this.dispose();
                },
            };
        },
    };
})();
