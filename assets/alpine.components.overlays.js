(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineComponentGroups = window.__Theme__.AlpineComponentGroups || {};

    const AlpineComponentsFactory = window.__Theme__?.AlpineComponentsFactory;
    const ComponentGroups = window.__Theme__.AlpineComponentGroups;

    if (!AlpineComponentsFactory) return;

    function toastNewsletterPostedSuccess(successMessage) {
        if (!successMessage) return false;
        try {
            const url = new URL(window.location.href);
            if (url.searchParams.get('customer_posted') !== 'true') return false;
            window.Alpine?.store('toast')?.show?.(successMessage, 'success');
            url.searchParams.delete('customer_posted');

            // Keep the Shopify form hash (native scroll target). Re-assign it after
            // cleaning the query so the browser still jumps to the form — replaceState
            // alone does not scroll, and a shared #contact_form often points at the
            // overlay form near the top of the homepage.
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

    ComponentGroups.overlays = {
        newsletterBanner({ successMessage = '' } = {}) {
            return {
                successMessage,

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
                    if (toastNewsletterPostedSuccess(this.successMessage)) {
                        this._setExpired();
                    }
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
                shippingStatus: 'idle',
                shippingRates: [],
                shippingMessage: '',
                _shippingAbortController: null,
                _shippingPollTimer: null,
                _shippingRequestId: 0,
                _shippingMessages: {
                    calculating: '',
                    rates: '',
                    empty: '',
                    error: '',
                    timeout: '',
                    countryRequired: '',
                },
                _shippingPollAttemptLimit: 12,
                _shippingPollIntervalMs: 800,

                init() {
                    const sectionId = this.$el?.dataset?.sectionId || '';
                    this._unregisterCartSection =
                        this.$store?.cart?.registerSection?.(sectionId) || null;
                    this._readShippingMessages();
                },

                destroy() {
                    this._cancelShippingRequest();
                    this._unregisterCartSection?.();
                    this._unregisterCartSection = null;
                },

                _readShippingMessages() {
                    const ds = this.$el?.dataset || {};
                    this._shippingMessages = {
                        calculating: ds.shippingMsgCalculating || '',
                        rates: ds.shippingMsgRates || '',
                        empty: ds.shippingMsgEmpty || '',
                        error: ds.shippingMsgError || '',
                        timeout: ds.shippingMsgTimeout || '',
                        countryRequired: ds.shippingMsgCountryRequired || '',
                    };
                },

                _cancelShippingRequest() {
                    if (this._shippingPollTimer != null) {
                        clearTimeout(this._shippingPollTimer);
                        this._shippingPollTimer = null;
                    }
                    if (this._shippingAbortController) {
                        try {
                            this._shippingAbortController.abort();
                        } catch (_) {}
                        this._shippingAbortController = null;
                    }
                },

                _setShippingState(status, message = '', rates = []) {
                    this.shippingStatus = status;
                    this.shippingMessage = typeof message === 'string' ? message : '';
                    this.shippingRates = Array.isArray(rates) ? rates : [];
                },

                formatShippingPrice(price) {
                    const major = typeof price === 'number' ? price : Number(price);
                    if (!Number.isFinite(major)) return '';
                    const cents = Math.round(major * 100);
                    if (!Number.isFinite(cents)) return '';
                    if (window.Shopify?.formatMoney) {
                        return window.Shopify.formatMoney(cents);
                    }
                    const locale = document.documentElement.lang || undefined;
                    const currency = window.Shopify?.currency?.active || 'USD';
                    return new Intl.NumberFormat(locale, {
                        style: 'currency',
                        currency,
                        currencyDisplay: 'narrowSymbol',
                    }).format(cents / 100);
                },

                shippingRateLabel(rate) {
                    if (!rate || typeof rate !== 'object') return '';
                    return String(rate.presentment_name || rate.name || rate.code || '').trim();
                },

                _readShippingAddress(form) {
                    const countryInput = form.querySelector('[name="attributes[Country]"]');
                    const provinceInput = form.querySelector('[name="attributes[Province]"]');
                    const zipInput =
                        form.querySelector('[name="shipping_zip"]') ||
                        form.querySelector('[name="attributes[Pincode]"]');

                    return {
                        country: String(countryInput?.value || '').trim(),
                        province: String(provinceInput?.value || '').trim(),
                        zip: String(zipInput?.value || '').trim(),
                    };
                },

                _shippingParams(address) {
                    return {
                        shipping_address: {
                            country: address.country,
                            province: address.province,
                            zip: address.zip,
                        },
                    };
                },

                _isAbortError(error) {
                    return Boolean(error?.isAbort || error?.name === 'AbortError');
                },

                _delay(ms, signal) {
                    return new Promise((resolve, reject) => {
                        if (signal?.aborted) {
                            reject(
                                Object.assign(new Error('Aborted'), {
                                    name: 'AbortError',
                                    isAbort: true,
                                }),
                            );
                            return;
                        }
                        const timer = setTimeout(() => {
                            this._shippingPollTimer = null;
                            resolve();
                        }, ms);
                        this._shippingPollTimer = timer;
                        const onAbort = () => {
                            clearTimeout(timer);
                            this._shippingPollTimer = null;
                            reject(
                                Object.assign(new Error('Aborted'), {
                                    name: 'AbortError',
                                    isAbort: true,
                                }),
                            );
                        };
                        signal?.addEventListener?.('abort', onAbort, { once: true });
                    });
                },

                async _pollShippingRates(params, signal, requestId) {
                    const Http = window.ShopifyHttp;
                    if (!Http?.getJSON) {
                        throw new Error('ShopifyHttp unavailable');
                    }

                    for (let attempt = 0; attempt < this._shippingPollAttemptLimit; attempt += 1) {
                        if (requestId !== this._shippingRequestId) return null;
                        if (signal.aborted) {
                            throw Object.assign(new Error('Aborted'), {
                                name: 'AbortError',
                                isAbort: true,
                            });
                        }

                        const payload = await Http.getJSON('cart/async_shipping_rates.json', {
                            params,
                            credentials: 'same-origin',
                            signal,
                        });

                        if (requestId !== this._shippingRequestId) return null;

                        if (payload == null) {
                            if (attempt >= this._shippingPollAttemptLimit - 1) break;
                            await this._delay(this._shippingPollIntervalMs, signal);
                            continue;
                        }

                        if (
                            !payload ||
                            typeof payload !== 'object' ||
                            !Array.isArray(payload.shipping_rates)
                        ) {
                            throw new Error('Invalid shipping rates payload');
                        }

                        return payload.shipping_rates;
                    }

                    const timeoutError = new Error('Shipping rates timeout');
                    timeoutError.isShippingTimeout = true;
                    throw timeoutError;
                },

                async estimateShipping(event) {
                    const form = event?.target instanceof HTMLFormElement ? event.target : null;
                    if (!(form instanceof HTMLFormElement)) return;

                    const Http = window.ShopifyHttp;
                    if (!Http?.request || !Http?.getJSON) {
                        this._setShippingState('error', this._shippingMessages.error || '', []);
                        return;
                    }

                    const address = this._readShippingAddress(form);
                    if (!address.country) {
                        this._cancelShippingRequest();
                        this._shippingRequestId += 1;
                        this._setShippingState(
                            'error',
                            this._shippingMessages.countryRequired || '',
                            [],
                        );
                        form.querySelector('[name="attributes[Country]"]')?.focus?.();
                        return;
                    }

                    this._cancelShippingRequest();
                    const requestId = ++this._shippingRequestId;
                    const controller = new AbortController();
                    this._shippingAbortController = controller;

                    this._setShippingState('loading', this._shippingMessages.calculating || '', []);

                    const params = this._shippingParams(address);

                    try {
                        await Http.request('cart/prepare_shipping_rates.json', {
                            method: 'POST',
                            params,
                            credentials: 'same-origin',
                            signal: controller.signal,
                        });

                        if (requestId !== this._shippingRequestId) return;

                        const rates = await this._pollShippingRates(
                            params,
                            controller.signal,
                            requestId,
                        );

                        if (requestId !== this._shippingRequestId) return;
                        if (!rates) return;

                        if (rates.length === 0) {
                            this._setShippingState('empty', this._shippingMessages.empty || '', []);
                            return;
                        }

                        this._setShippingState(
                            'success',
                            this._shippingMessages.rates || '',
                            rates,
                        );
                    } catch (error) {
                        if (requestId !== this._shippingRequestId) return;
                        if (this._isAbortError(error)) return;

                        if (error?.isShippingTimeout || error?.isTimeout) {
                            this._setShippingState(
                                'error',
                                this._shippingMessages.timeout ||
                                    this._shippingMessages.error ||
                                    '',
                                [],
                            );
                            return;
                        }

                        this._setShippingState('error', this._shippingMessages.error || '', []);
                    } finally {
                        if (requestId === this._shippingRequestId) {
                            this._shippingAbortController = null;
                            if (this._shippingPollTimer != null) {
                                clearTimeout(this._shippingPollTimer);
                                this._shippingPollTimer = null;
                            }
                        }
                    }
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
