import { define } from 'alpine-adapter';
import ShopifyHttp from 'https';

define('cartPage', () => ({
    errors: {},
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
        this._unregisterCartSection = this.$store?.cart?.registerSection?.(sectionId) || null;
        this._readShippingMessages();
    },

    destroy() {
        this._cancelShippingRequest();
        this._unregisterCartSection?.();
        this._unregisterCartSection = null;
    },

    async changeLine(itemKey, quantity, sectionId) {
        const key = itemKey || 'global';
        this.errors[key] = '';

        try {
            await this.$store.cart.change(itemKey, quantity, [sectionId]);
        } catch (err) {
            this.errors[key] = this.$store.cart.messageFromError(err);
        }
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
            } catch (_) {
                /* abort may throw in older browsers */
            }
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
        if (!ShopifyHttp?.getJSON) {
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

            const payload = await ShopifyHttp.getJSON('cart/async_shipping_rates.json', {
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

            if (!payload || typeof payload !== 'object' || !Array.isArray(payload.shipping_rates)) {
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

        if (!ShopifyHttp?.request || !ShopifyHttp?.getJSON) {
            this._setShippingState('error', this._shippingMessages.error || '', []);
            return;
        }

        const address = this._readShippingAddress(form);
        if (!address.country) {
            this._cancelShippingRequest();
            this._shippingRequestId += 1;
            this._setShippingState('error', this._shippingMessages.countryRequired || '', []);
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
            await ShopifyHttp.request('cart/prepare_shipping_rates.json', {
                method: 'POST',
                params,
                credentials: 'same-origin',
                signal: controller.signal,
            });

            if (requestId !== this._shippingRequestId) return;

            const rates = await this._pollShippingRates(params, controller.signal, requestId);

            if (requestId !== this._shippingRequestId) return;
            if (!rates) return;

            if (rates.length === 0) {
                this._setShippingState('empty', this._shippingMessages.empty || '', []);
                return;
            }

            this._setShippingState('success', this._shippingMessages.rates || '', rates);
        } catch (error) {
            if (requestId !== this._shippingRequestId) return;
            if (this._isAbortError(error)) return;

            if (error?.isShippingTimeout || error?.isTimeout) {
                this._setShippingState(
                    'error',
                    this._shippingMessages.timeout || this._shippingMessages.error || '',
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
}));
