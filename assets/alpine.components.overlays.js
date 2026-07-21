(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineComponentGroups = window.__Theme__.AlpineComponentGroups || {};

    const AlpineComponentsFactory = window.__Theme__?.AlpineComponentsFactory;
    const ComponentGroups = window.__Theme__.AlpineComponentGroups;

    if (!AlpineComponentsFactory) return;

    ComponentGroups.overlays = {
        newsletterBanner({ successMessage = '', errorMessage = '' } = {}) {
            return {
                isLoading: false,
                successMessage,
                errorMessage,

                _hydrateFromDataset() {
                    const ds = this.$el?.dataset;
                    if (!ds) return;
                    if (ds.newsletterSuccessMessage) {
                        this.successMessage = JSON.parse(ds.newsletterSuccessMessage);
                    }
                    if (ds.newsletterErrorMessage) {
                        this.errorMessage = JSON.parse(ds.newsletterErrorMessage);
                    }
                },

                init() {
                    this._hydrateFromDataset();
                },

                async submit(event) {
                    if (this.isLoading) return;

                    const form = event?.target;
                    if (!(form instanceof HTMLFormElement)) return;

                    const emailInput = form.querySelector('input[type="email"]');
                    if (!emailInput || !emailInput.value) {
                        if (this.errorMessage)
                            window.Alpine?.store('toast')?.show?.(this.errorMessage, 'error');
                        return;
                    }

                    this.isLoading = true;

                    try {
                        const formData = new FormData(form);
                        const Http = window.ShopifyHttp;
                        if (!Http?.request) throw new Error('Http client unavailable');

                        await Http.request(form.action, {
                            method: 'POST',
                            body: formData,
                            headers: { Accept: 'text/html' },
                            credentials: 'same-origin',
                        });

                        if (this.successMessage)
                            window.Alpine?.store('toast')?.show?.(this.successMessage, 'success');
                        form.reset();
                    } catch (_) {
                        if (this.errorMessage)
                            window.Alpine?.store('toast')?.show?.(this.errorMessage, 'error');
                    } finally {
                        this.isLoading = false;
                    }
                },
            };
        },

        newsletterOverlay({
            dialogId = '',
            displayMode = 'enable',
            showInHome = true,
            showForVisitor = true,
            isHomeTemplate = false,
            isVisitor = true,
            delay = 3,
            expired = 7,
            successMessage = '',
            errorMessage = '',
        } = {}) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                dialogId,
                displayMode,
                showInHome,
                showForVisitor,
                isHomeTemplate,
                isVisitor,
                delay,
                expired,
                successMessage,
                errorMessage,
                isLoading: false,
                timeId: null,
                storageKey: 'newsletter-overlay-expired',

                _hydrateFromDataset() {
                    const ds = this.$el?.dataset;
                    if (!ds) return;
                    if (ds.newsletterDialogId) this.dialogId = ds.newsletterDialogId;
                    if (ds.newsletterDisplayMode) this.displayMode = ds.newsletterDisplayMode;
                    if (ds.newsletterShowInHome)
                        this.showInHome = JSON.parse(ds.newsletterShowInHome);
                    if (ds.newsletterShowForVisitor)
                        this.showForVisitor = JSON.parse(ds.newsletterShowForVisitor);
                    if (ds.newsletterIsHomeTemplate)
                        this.isHomeTemplate = JSON.parse(ds.newsletterIsHomeTemplate);
                    if (ds.newsletterIsVisitor) this.isVisitor = JSON.parse(ds.newsletterIsVisitor);
                    if (ds.newsletterDelay) this.delay = JSON.parse(ds.newsletterDelay);
                    if (ds.newsletterExpired) this.expired = JSON.parse(ds.newsletterExpired);
                    if (ds.newsletterSuccessMessage)
                        this.successMessage = ds.newsletterSuccessMessage;
                    if (ds.newsletterErrorMessage) this.errorMessage = ds.newsletterErrorMessage;
                },

                init() {
                    this._hydrateFromDataset();
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

                hide() {
                    this.$store?.dialog?.close?.();
                    if (this.displayMode === 'enable') {
                        this._setExpired();
                    }
                },

                async submit(event) {
                    if (this.isLoading) return;

                    const form = event?.target;
                    if (!(form instanceof HTMLFormElement)) return;

                    const emailInput = form.querySelector('input[type="email"]');
                    if (!emailInput || !emailInput.value) {
                        if (this.errorMessage)
                            window.Alpine?.store('toast')?.show?.(this.errorMessage, 'error');
                        return;
                    }

                    this.isLoading = true;

                    try {
                        const formData = new FormData(form);
                        const Http = window.ShopifyHttp;
                        if (!Http?.request) throw new Error('Http client unavailable');

                        const response = await Http.request(form.action, {
                            method: 'POST',
                            body: formData,
                            headers: { Accept: 'text/html' },
                            credentials: 'same-origin',
                        });

                        if (this.successMessage)
                            window.Alpine?.store('toast')?.show?.(this.successMessage, 'success');
                        form.reset();
                        this.hide();
                    } catch (_) {
                        if (this.errorMessage)
                            window.Alpine?.store('toast')?.show?.(this.errorMessage, 'error');
                    } finally {
                        this.isLoading = false;
                    }
                },

                destroy() {
                    if (this.timeId) {
                        clearTimeout(this.timeId);
                        this.timeId = null;
                    }
                    this.dispose();
                },
            };
        },

        cartPage() {
            return {
                _unregisterCartSection: null,

                init() {
                    const sectionId = this.$el?.dataset?.sectionId || '';
                    this._unregisterCartSection =
                        this.$store?.cart?.registerSection?.(sectionId) || null;
                },

                destroy() {
                    this._unregisterCartSection?.();
                    this._unregisterCartSection = null;
                },
            };
        },

        cartOverlay({ sections = [] } = {}) {
            return {
                sections: Array.isArray(sections) ? sections : [],
                dialogId: '',
                sectionId: '',
                pending: {},
                unitPriceMap: {},
                quantityConstraintsMap: {},
                _syncPromise: null,
                _lastSyncedAt: 0,
                _unitPriceRefreshPromise: null,
                _unregisterCartSection: null,

                get cart() {
                    return (
                        this.$store?.cart || {
                            items: [],
                            item_count: 0,
                            total_price: 0,
                            loading: false,
                            hasFetched: false,
                        }
                    );
                },

                get items() {
                    return Array.isArray(this.cart.items) ? this.cart.items : [];
                },

                get isEmpty() {
                    return Number(this.cart.item_count || 0) <= 0;
                },

                get canCheckout() {
                    return !this.isEmpty && !this.cart.loading;
                },

                get hasFetched() {
                    return Boolean(this.cart.hasFetched);
                },

                get hasVisibleItems() {
                    return this.items.length > 0;
                },

                get showInitialLoading() {
                    return Boolean(this.cart.loading && !this.hasVisibleItems);
                },

                get showEmpty() {
                    return Boolean(!this.cart.loading && this.hasFetched && this.isEmpty);
                },

                get showItems() {
                    return this.hasVisibleItems;
                },

                init() {
                    this.dialogId = this.$el?.dataset?.dialogId || '';
                    this.sectionId = this.$el?.dataset?.sectionId || '';

                    if (this.sections.length === 0) {
                        const ds = this.$el?.dataset;
                        if (ds?.cartSections) {
                            try {
                                const parsed = JSON.parse(ds.cartSections);
                                if (Array.isArray(parsed)) this.sections = parsed;
                            } catch (_) {}
                        }
                    }

                    if (!this.sectionId && this.sections.length > 0) {
                        this.sectionId = this.sections[0];
                    }

                    this._unregisterCartSection =
                        this.cart.registerSection?.(this.sectionId) || null;

                    this._readUnitPriceMap();
                    this._readQuantityConstraintsMap();

                    this.$watch('isOpen', (isOpen) => {
                        if (isOpen) {
                            this.syncCart({ force: true })
                                .catch(() => {})
                                .finally(() => {
                                    this.refreshUnitPriceMap().catch(() => {});
                                });
                        }
                    });
                },

                get isOpen() {
                    return Boolean(this.dialogId && this.$store?.dialog?.active === this.dialogId);
                },

                _sectionRoot() {
                    return this.$el?.closest?.('.cart-overlay-section') || null;
                },

                _mapHost() {
                    return (
                        this._sectionRoot()?.querySelector?.('[data-cart-unit-price-map]') || null
                    );
                },

                _quantityConstraintsHost() {
                    return (
                        this._sectionRoot()?.querySelector?.(
                            '[data-cart-quantity-constraints-map]',
                        ) || null
                    );
                },

                _readUnitPriceMap() {
                    const host = this._mapHost();
                    const raw = host?.dataset?.map || '';
                    if (!raw) {
                        this.unitPriceMap = {};
                        return;
                    }
                    try {
                        const parsed = JSON.parse(raw);
                        this.unitPriceMap =
                            parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                                ? parsed
                                : {};
                    } catch (_) {
                        this.unitPriceMap = {};
                    }
                },

                _readQuantityConstraintsMap() {
                    const host = this._quantityConstraintsHost();
                    const raw = host?.dataset?.map || '';
                    if (!raw) {
                        this.quantityConstraintsMap = {};
                        return;
                    }
                    try {
                        const parsed = JSON.parse(raw);
                        this.quantityConstraintsMap =
                            parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                                ? parsed
                                : {};
                    } catch (_) {
                        this.quantityConstraintsMap = {};
                    }
                },

                unitPriceText(item) {
                    if (!item?.key) return '';
                    const value = this.unitPriceMap[item.key];
                    return typeof value === 'string' && value.trim() ? value : '';
                },

                refreshUnitPriceMap() {
                    const sectionId = this.sectionId || this.sections[0];
                    const Http = window.ShopifyHttp;
                    const SectionRefresher = window.ShopifySectionRefresher;
                    if (!sectionId || !Http?.request || !SectionRefresher?.render) {
                        return Promise.resolve();
                    }
                    if (this._unitPriceRefreshPromise) return this._unitPriceRefreshPromise;

                    this._unitPriceRefreshPromise = Http.request(window.location.href, {
                        method: 'GET',
                        params: { section_id: sectionId },
                        headers: { Accept: 'text/html' },
                        credentials: 'same-origin',
                    })
                        .then((res) => res.text())
                        .then((html) => {
                            SectionRefresher.render(
                                { [sectionId]: html },
                                {
                                    [sectionId]: {
                                        targetSelector: `#shopify-section-${sectionId}`,
                                        innerSelectors: [
                                            '[data-cart-unit-price-map]',
                                            '[data-cart-quantity-constraints-map]',
                                        ],
                                    },
                                },
                            );
                            this._readUnitPriceMap();
                            this._readQuantityConstraintsMap();
                        })
                        .finally(() => {
                            this._unitPriceRefreshPromise = null;
                        });

                    return this._unitPriceRefreshPromise;
                },

                syncCart({ force = false } = {}) {
                    if (typeof this.cart.fetchCart !== 'function') return Promise.resolve();
                    if (this.cart.loading) return this._syncPromise || Promise.resolve();

                    const now = Date.now();
                    if (!force && now - this._lastSyncedAt < 1000) {
                        return this._syncPromise || Promise.resolve();
                    }

                    if (this._syncPromise) return this._syncPromise;

                    this._syncPromise = this.cart
                        .fetchCart()
                        .then((data) => {
                            this._lastSyncedAt = Date.now();
                            return data;
                        })
                        .catch((err) => {
                            const toast = window.Alpine?.store('toast');
                            const message = this.$store?.cart?._errorMessages?.generic || '';
                            if (toast && message) {
                                toast.show(message, 'error');
                            }
                            return Promise.reject(err);
                        })
                        .finally(() => {
                            this._syncPromise = null;
                        });

                    return this._syncPromise;
                },

                formatMoney(cents) {
                    const value = Number(cents || 0);
                    if (window.Shopify?.formatMoney) {
                        return window.Shopify.formatMoney(value);
                    }
                    const locale = document.documentElement.lang || undefined;
                    const currency = window.Shopify?.currency?.active || 'USD';
                    return new Intl.NumberFormat(locale, {
                        style: 'currency',
                        currency,
                        currencyDisplay: 'narrowSymbol',
                    }).format(value / 100);
                },

                linePrice(item) {
                    if (!item || typeof item !== 'object') return this.formatMoney(0);
                    if (typeof item.final_line_price === 'number')
                        return this.formatMoney(item.final_line_price);
                    const line =
                        Number(item.final_price || item.price || 0) * Number(item.quantity || 0);
                    return this.formatMoney(line);
                },

                perUnitPrice(item) {
                    if (!item || typeof item !== 'object') return this.formatMoney(0);
                    if (typeof item.final_price === 'number') {
                        return this.formatMoney(item.final_price);
                    }
                    return this.formatMoney(Number(item.price || 0));
                },

                normalizedOptions(item) {
                    if (!item || typeof item !== 'object') return [];

                    if (item.product_has_only_default_variant === true) return [];

                    const options = Array.isArray(item.options_with_values)
                        ? item.options_with_values
                        : null;

                    if (options && options.length > 0) {
                        return options
                            .map((option, index) => {
                                if (!option || typeof option !== 'object') return null;
                                const name = String(option.name ?? '').trim();
                                const value = String(option.value ?? '').trim();
                                if (!name || !value) return null;
                                if (
                                    name.toLowerCase() === 'title' &&
                                    value.toLowerCase() === 'default title'
                                ) {
                                    return null;
                                }
                                return {
                                    key: `${name}:${value}:${index}`,
                                    name,
                                    value,
                                };
                            })
                            .filter(Boolean);
                    }

                    const variantTitle =
                        typeof item.variant_title === 'string' ? item.variant_title.trim() : '';
                    if (!variantTitle || variantTitle.toLowerCase() === 'default title') {
                        return [];
                    }

                    const productTitle =
                        typeof item.product_title === 'string' ? item.product_title.trim() : '';
                    const fallbackTitle = typeof item.title === 'string' ? item.title.trim() : '';

                    // When product_title is absent and item.title already includes variant identity,
                    // do not also render fallback variant text that duplicates it.
                    if (!productTitle && fallbackTitle && fallbackTitle.includes(variantTitle)) {
                        return [];
                    }

                    return [
                        {
                            key: `variant:${variantTitle}`,
                            name: '',
                            value: variantTitle,
                        },
                    ];
                },

                safeUploadUrl(value) {
                    if (typeof value !== 'string') return '';
                    const trimmed = value.trim();
                    if (!trimmed || trimmed.includes('\\')) return '';

                    const lower = trimmed.toLowerCase();
                    if (lower.startsWith('javascript:') || lower.startsWith('data:')) return '';
                    if (trimmed.startsWith('//')) return '';

                    const isAbsolute = lower.startsWith('https://') || lower.startsWith('http://');
                    const isRootRelative = trimmed.startsWith('/') && !trimmed.startsWith('//');
                    if (!isAbsolute && !isRootRelative) return '';

                    let parsed;
                    try {
                        if (isAbsolute) {
                            parsed = new URL(trimmed);
                        } else {
                            const origin =
                                typeof globalThis !== 'undefined' &&
                                globalThis.location &&
                                typeof globalThis.location.origin === 'string'
                                    ? globalThis.location.origin
                                    : '';
                            if (!origin) return '';
                            parsed = new URL(trimmed, origin);
                            if (parsed.origin !== origin) return '';
                        }
                    } catch (_) {
                        return '';
                    }

                    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
                    if (!parsed.hostname) return '';

                    const pathname = parsed.pathname || '';
                    if (!pathname.includes('/uploads/')) return '';

                    return isAbsolute
                        ? parsed.href
                        : `${parsed.pathname}${parsed.search}${parsed.hash}`;
                },

                uploadFileName(urlString) {
                    if (!urlString || typeof urlString !== 'string') return '';
                    try {
                        const origin =
                            typeof globalThis !== 'undefined' &&
                            globalThis.location &&
                            typeof globalThis.location.origin === 'string'
                                ? globalThis.location.origin
                                : 'https://example.invalid';
                        const parsed = new URL(urlString, origin);
                        const segments = (parsed.pathname || '').split('/');
                        const segment = segments[segments.length - 1] || '';
                        if (!segment) return '';
                        try {
                            return decodeURIComponent(segment);
                        } catch (_) {
                            return segment;
                        }
                    } catch (_) {
                        return '';
                    }
                },

                publicProperties(item) {
                    const properties = item?.properties;
                    if (
                        !properties ||
                        typeof properties !== 'object' ||
                        Array.isArray(properties)
                    ) {
                        return [];
                    }

                    const records = [];
                    Object.keys(properties).forEach((key, index) => {
                        if (key == null) return;
                        const label = String(key);
                        if (!label || label.charAt(0) === '_') return;

                        const rawValue = properties[key];
                        if (rawValue === null || rawValue === undefined) return;

                        if (typeof rawValue === 'string' && rawValue.trim() === '') return;

                        let displayValue;
                        if (typeof rawValue === 'boolean' || typeof rawValue === 'number') {
                            displayValue = String(rawValue);
                        } else if (typeof rawValue === 'string') {
                            displayValue = rawValue;
                        } else {
                            return;
                        }

                        if (displayValue.trim() === '' && rawValue !== 0 && rawValue !== false) {
                            return;
                        }

                        const uploadUrl = this.safeUploadUrl(
                            typeof rawValue === 'string' ? rawValue : '',
                        );
                        const fileName = uploadUrl ? this.uploadFileName(uploadUrl) : '';

                        records.push({
                            key: `${label}:${index}`,
                            label,
                            value: displayValue,
                            uploadUrl,
                            fileName,
                        });
                    });

                    return records;
                },

                lineConstraints(item) {
                    const api = window.__Theme__?.QuantityConstraints;
                    if (!api) {
                        return { min: 1, max: null, step: 1, canPurchase: true };
                    }
                    return api.fromCartItem(item, this.quantityConstraintsMap, this.items);
                },

                maxQty(item) {
                    const max = this.lineConstraints(item).max;
                    return max == null ? null : max;
                },

                canDecrement(item) {
                    const { min } = this.lineConstraints(item);
                    return Number(item?.quantity || 0) > min;
                },

                canIncrement(item) {
                    const { max, step } = this.lineConstraints(item);
                    const qty = Number(item?.quantity || 0);
                    if (max === null) return true;
                    return qty + step <= max;
                },

                onQtyChange(item, qty) {
                    if (!item?.key || this.cart.loading || this.pending[item.key]) return;
                    const quantity = Math.max(0, Number(qty || 0));
                    if (!Number.isFinite(quantity)) return;
                    this.pending[item.key] = true;
                    this.cart.change(item.key, quantity, this.sections).finally(() => {
                        delete this.pending[item.key];
                    });
                },

                remove(item) {
                    this.onQtyChange(item, 0);
                },

                decrement(item) {
                    if (
                        !item ||
                        this.cart.loading ||
                        this.pending[item.key] ||
                        !this.canDecrement(item)
                    )
                        return;
                    const { min, step } = this.lineConstraints(item);
                    this.onQtyChange(item, Math.max(min, Number(item.quantity || 0) - step));
                },

                increment(item) {
                    if (
                        !item ||
                        this.cart.loading ||
                        this.pending[item.key] ||
                        !this.canIncrement(item)
                    )
                        return;
                    const { max, step } = this.lineConstraints(item);
                    const next = Number(item.quantity || 0) + step;
                    this.onQtyChange(item, max === null ? next : Math.min(max, next));
                },

                clearCart() {
                    if (this.cart.loading || this.isEmpty) return;
                    this.cart.clear(this.sections);
                },

                goCheckout() {
                    if (!this.canCheckout) return;
                    window.location.assign(
                        (window.Shopify?.routes?.root || '/').replace(/\/+$/, '') + '/checkout',
                    );
                },

                destroy() {
                    this._unregisterCartSection?.();
                    this._unregisterCartSection = null;
                },
            };
        },
    };
})();
