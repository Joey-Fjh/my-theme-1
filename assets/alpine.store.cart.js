const MIRRORED_KEYS = [
    'items',
    'item_count',
    'total_price',
    'total_discount',
    'cart_level_discount_applications',
    'loading',
    'hasFetched',
    'fetchError',
];

/**
 * UI bridge over the Skeleton-owned cart contract.
 *
 * The contract owns platform cart state and every Cart API mutation. This store only
 * mirrors that state into reactive UI properties and owns merchant-facing error copy.
 * Callers render normalized errors beside their own controls.
 *
 * @param {object} contract - Instance returned by `createCartContract()`.
 */
export function createCartUiStore(contract) {
    return {
        items: [],
        total_price: 0,
        total_discount: 0,
        item_count: 0,
        cart_level_discount_applications: [],
        loading: false,
        hasFetched: false,
        fetchError: null,

        _errorMessages: {
            generic: '',
            rateLimited: '',
            serverError: '',
            timeout: '',
            networkError: '',
        },

        _unsubscribe: null,
        _showMutationErrorToast: null,

        configure(options) {
            if (options?.errorMessages) {
                Object.assign(this._errorMessages, options.errorMessages);
            }
            if (typeof options?.showMutationErrorToast === 'function') {
                this._showMutationErrorToast = options.showMutationErrorToast;
            }
        },

        init() {
            if (!contract) return;

            this._unsubscribe = contract.subscribe((state) => {
                MIRRORED_KEYS.forEach((key) => {
                    this[key] = state[key];
                });
            });
        },

        /**
         * Re-read platform state. Kept so existing callers keep working; the contract
         * hydrates itself from `body.dataset.initialCart` during bootstrap.
         */
        hydrate(data) {
            if (!contract) return;
            contract.hydrate(data);
        },

        registerSection(sectionId) {
            if (!contract) return () => {};
            return contract.registerSection(sectionId);
        },

        fetchCart() {
            if (!contract) return Promise.reject(new Error('Cart contract unavailable'));
            return contract.fetchCart().catch((err) => this._handleError(err));
        },

        add(items, sections = []) {
            if (!contract) return Promise.reject(new Error('Cart contract unavailable'));
            return contract.add(items, sections).catch((err) => this._handleError(err));
        },

        change(lineOrId, quantity, sections = []) {
            if (!contract) return Promise.reject(new Error('Cart contract unavailable'));
            return contract
                .change(lineOrId, quantity, sections)
                .catch((err) => this._handleError(err));
        },

        update(data) {
            if (!contract) return Promise.reject(new Error('Cart contract unavailable'));
            return contract.update(data).catch((err) => this._handleError(err));
        },

        /**
         * Normalize a cart mutation failure and rethrow with `displayMessage` for callers.
         * @param {Object|Error} err - Shopify API error or native Error
         * @returns {Promise<never>}
         */
        _handleError(err) {
            if (err?.isAbort || err?.name === 'AbortError') {
                return Promise.reject(err);
            }

            const msgs = this._errorMessages;
            const data = err?.data && typeof err.data === 'object' ? err.data : null;
            const status = err?.status ?? data?.status;
            let finalMsg;

            if (typeof data?.description === 'string' && data.description.trim()) {
                finalMsg = data.description.trim();
            } else if (err?.isTimeout) {
                finalMsg = msgs.timeout;
            } else if (err?.isNetworkError) {
                finalMsg = msgs.networkError;
            } else if (status === 429) {
                finalMsg = msgs.rateLimited;
            } else if (status >= 500) {
                finalMsg = msgs.serverError;
            } else {
                finalMsg = msgs.generic;
            }

            if (finalMsg) {
                this._showMutationErrorToast?.(finalMsg);
                if (err && typeof err === 'object') {
                    err.displayMessage = finalMsg;
                }
            }

            return Promise.reject(err);
        },

        /**
         * Read a caller-facing message from a rejected cart mutation.
         * @param {Object|Error} err
         * @returns {string}
         */
        messageFromError(err) {
            if (typeof err?.displayMessage === 'string' && err.displayMessage.trim()) {
                return err.displayMessage.trim();
            }
            return this._errorMessages.generic || '';
        },
    };
}
