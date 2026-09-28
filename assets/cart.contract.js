/**
 * Skeleton-owned cart state contract.
 * Hydrates from Liquid, reads state, mutates through the Cart API, and notifies subscribers.
 * Owns platform cart state; UI layers subscribe to it instead of owning it themselves.
 */

import { ShopifyHttp, SectionRefresher } from 'https';

function parseInitialCartPayload() {
    if (typeof document === 'undefined') return {};

    const raw = document.body?.dataset?.initialCart;
    if (!raw) return {};

    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
        return {};
    }
}

function normalizeCartState(data = {}) {
    return {
        items: Array.isArray(data.items) ? data.items : [],
        item_count: typeof data.item_count === 'number' ? data.item_count : 0,
        total_price: typeof data.total_price === 'number' ? data.total_price : 0,
        total_discount: typeof data.total_discount === 'number' ? data.total_discount : 0,
        cart_level_discount_applications: Array.isArray(data.cart_level_discount_applications)
            ? data.cart_level_discount_applications
            : [],
        hasFetched:
            Array.isArray(data.items) ||
            typeof data.item_count === 'number' ||
            typeof data.total_price === 'number',
        loading: false,
        fetchError: null,
    };
}

export function createCartContract(options = {}) {
    const getHttp = typeof options.getHttp === 'function' ? options.getHttp : () => ShopifyHttp;

    let state = normalizeCartState();
    const listeners = new Set();
    const registeredSectionIds = [];

    function notify() {
        listeners.forEach((listener) => {
            listener(state);
        });
    }

    function setState(nextState) {
        state = {
            ...state,
            ...nextState,
        };
        notify();
        return state;
    }

    function hydrate(data) {
        const payload = data === undefined ? parseInitialCartPayload() : data;
        setState(normalizeCartState(payload));
        return state;
    }

    function getState() {
        return state;
    }

    function subscribe(listener) {
        if (typeof listener !== 'function') {
            return () => {};
        }

        listeners.add(listener);
        listener(state);

        return () => {
            listeners.delete(listener);
        };
    }

    function registerSection(sectionId) {
        const normalized = typeof sectionId === 'string' ? sectionId.trim() : '';
        if (!normalized) return () => {};

        if (!registeredSectionIds.includes(normalized)) {
            registeredSectionIds.push(normalized);
        }

        return () => {
            const index = registeredSectionIds.indexOf(normalized);
            if (index >= 0) registeredSectionIds.splice(index, 1);
        };
    }

    function resolveSections(sections = []) {
        const requested = Array.isArray(sections) ? sections : [];
        return [...new Set([...requested, ...registeredSectionIds])].filter(
            (sectionId) => typeof sectionId === 'string' && sectionId.trim(),
        );
    }

    function fetchCart() {
        const Http = getHttp();
        if (!Http?.getJSON) return Promise.reject(new Error('Http client unavailable'));

        setState({ loading: true, fetchError: null });

        return Http.getJSON('/cart.js', { credentials: 'same-origin' })
            .then((data) => {
                setState({
                    ...normalizeCartState(data),
                    loading: false,
                    fetchError: null,
                });
                return data;
            })
            .catch((err) => {
                setState({ loading: false, fetchError: err });
                throw err;
            });
    }

    function add(items, sections = []) {
        const Http = getHttp();
        if (!Http?.postJSON) return Promise.reject(new Error('Http client unavailable'));
        if (!Array.isArray(items) || items.length === 0) {
            return Promise.reject(new Error('items required'));
        }

        setState({ loading: true });

        const body = { items };
        const resolvedSections = resolveSections(sections);
        if (resolvedSections.length > 0) {
            body.sections = resolvedSections.join(',');
        }

        return Http.postJSON('/cart/add.js', body, { credentials: 'same-origin' })
            .then((data) => {
                if (data.sections && typeof SectionRefresher?.render === 'function') {
                    SectionRefresher.render(data.sections);
                }
                return fetchCart().then(() => data);
            })
            .catch((err) =>
                fetchCart()
                    .catch(() => {})
                    .then(() => Promise.reject(err)),
            )
            .finally(() => {
                setState({ loading: false });
            });
    }

    function change(lineOrId, quantity, sections = []) {
        const Http = getHttp();
        if (!Http?.postJSON) return Promise.reject(new Error('Http client unavailable'));

        setState({ loading: true });

        const bodyData = { quantity: Number(quantity) };
        if (typeof lineOrId === 'string') {
            bodyData.id = lineOrId;
        } else {
            bodyData.line = Number(lineOrId);
        }

        const resolvedSections = resolveSections(sections);
        if (resolvedSections.length > 0) {
            bodyData.sections = resolvedSections.join(',');
        }

        return Http.postJSON('/cart/change.js', bodyData, { credentials: 'same-origin' })
            .then((parsedState) => {
                if (parsedState.sections && typeof SectionRefresher?.render === 'function') {
                    SectionRefresher.render(parsedState.sections);
                }

                setState({
                    ...normalizeCartState(parsedState),
                    loading: false,
                    fetchError: null,
                });
                return parsedState;
            })
            .catch((err) => {
                setState({ loading: false, fetchError: err });
                throw err;
            });
    }

    function update(data) {
        const Http = getHttp();
        if (!Http?.postJSON) return Promise.reject(new Error('Http client unavailable'));

        setState({ loading: true });

        return Http.postJSON('/cart/update.js', data, { credentials: 'same-origin' })
            .then((parsedState) => {
                setState({
                    ...normalizeCartState(parsedState),
                    loading: false,
                    fetchError: null,
                });
                return parsedState;
            })
            .catch((err) => {
                setState({ loading: false, fetchError: err });
                throw err;
            });
    }

    return {
        hydrate,
        getState,
        subscribe,
        registerSection,
        fetchCart,
        add,
        change,
        update,
    };
}
