(function (root) {
    'use strict';

    root.__Theme__ = root.__Theme__ || {};

    function toPositiveInt(value, fallback) {
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) return fallback;
        return Math.floor(n);
    }

    function toNonNegInt(value, fallback) {
        const n = Number(value);
        if (!Number.isFinite(n) || n < 0) return fallback;
        return Math.floor(n);
    }

    function inventoryCap({ inventoryManagement, inventoryPolicy, inventoryQuantity }) {
        if (!inventoryManagement) return null;
        if (inventoryPolicy !== 'deny') return null;
        const qty = Number(inventoryQuantity);
        if (!Number.isFinite(qty)) return null;
        return Math.max(0, Math.floor(qty));
    }

    function absoluteMax(ruleMax, invCap) {
        const caps = [];
        if (ruleMax != null && ruleMax !== '' && Number.isFinite(Number(ruleMax))) {
            caps.push(Math.floor(Number(ruleMax)));
        }
        if (invCap != null) caps.push(invCap);
        if (caps.length === 0) return null;
        return Math.min(...caps);
    }

    /**
     * Next valid order total on the quantity_rule grid that is >= ruleMin and > cartQuantity
     * when cart already holds a valid amount, or ruleMin when the cart is empty/below min.
     */
    function nextValidTotal(ruleMin, step, cartQuantity) {
        if (cartQuantity <= 0 || cartQuantity < ruleMin) return ruleMin;
        const offset = cartQuantity - ruleMin;
        if (offset % step === 0) return cartQuantity + step;
        return ruleMin + Math.ceil(offset / step) * step;
    }

    function largestValidTotal(ruleMin, step, absMax) {
        if (absMax == null) return null;
        if (absMax < ruleMin) return null;
        return ruleMin + Math.floor((absMax - ruleMin) / step) * step;
    }

    /**
     * Resolve display min/max/step for product (additional units) or cart (line total).
     * @param {Object} [input]
     * @param {'product'|'cart'} [input.surface]
     * @param {Object} [input.quantityRule]
     * @param {number} [input.cartQuantity] Product: units already in cart for the variant.
     * @param {number} [input.otherCartQuantity] Cart: units of the same variant on other lines.
     */
    function resolve(input = {}) {
        const rule = input.quantityRule || input.quantity_rule || {};
        const ruleMin = toPositiveInt(rule.min, 1);
        const step = toPositiveInt(rule.increment ?? rule.step, 1);
        const ruleMax = rule.max == null || rule.max === '' ? null : toNonNegInt(rule.max, null);
        const cartQuantity = toNonNegInt(input.cartQuantity ?? input.cart_quantity, 0);
        const otherCartQuantity = toNonNegInt(
            input.otherCartQuantity ?? input.other_cart_quantity,
            0,
        );
        const surface = input.surface === 'cart' ? 'cart' : 'product';

        const invCap = inventoryCap({
            inventoryManagement: input.inventoryManagement ?? input.inventory_management,
            inventoryPolicy: input.inventoryPolicy ?? input.inventory_policy,
            inventoryQuantity: input.inventoryQuantity ?? input.inventory_quantity,
        });

        const absMax = absoluteMax(ruleMax, invCap);

        if (surface === 'cart') {
            let max = absMax;
            if (max != null) max = Math.max(0, max - otherCartQuantity);
            return {
                min: ruleMin,
                max,
                step,
                absoluteMax: absMax,
                cartQuantity,
                otherCartQuantity,
                canPurchase: true,
            };
        }

        const firstTotal = nextValidTotal(ruleMin, step, cartQuantity);
        if (absMax != null && firstTotal > absMax) {
            return {
                min: 0,
                max: 0,
                step,
                absoluteMax: absMax,
                cartQuantity,
                otherCartQuantity: 0,
                canPurchase: false,
            };
        }

        const min = firstTotal - cartQuantity;
        let max = null;
        if (absMax != null) {
            const largest = largestValidTotal(ruleMin, step, absMax);
            max = largest == null ? 0 : Math.max(0, largest - cartQuantity);
        }

        const canPurchase = max === null || min <= max;

        return {
            min: canPurchase ? min : 0,
            max: canPurchase ? max : max === null ? null : 0,
            step,
            absoluteMax: absMax,
            cartQuantity,
            otherCartQuantity: 0,
            canPurchase,
        };
    }

    function cartQuantityForVariant(variantId, items) {
        const id = Number(variantId);
        if (!Number.isFinite(id)) return 0;
        return (items || []).reduce((sum, item) => {
            const vid = Number(item.variant_id != null ? item.variant_id : item.id);
            if (vid !== id) return sum;
            return sum + toNonNegInt(item.quantity, 0);
        }, 0);
    }

    function fromVariant(
        variant,
        { surface = 'product', cartQuantity = 0, otherCartQuantity = 0 } = {},
    ) {
        if (!variant) {
            return resolve({
                surface,
                cartQuantity,
                otherCartQuantity,
                quantityRule: { min: 1, max: null, increment: 1 },
            });
        }
        return resolve({
            surface,
            cartQuantity,
            otherCartQuantity,
            quantityRule: variant.quantity_rule || variant.quantityRule,
            inventoryManagement: variant.inventory_management ?? variant.inventoryManagement,
            inventoryPolicy: variant.inventory_policy ?? variant.inventoryPolicy,
            inventoryQuantity: variant.inventory_quantity ?? variant.inventoryQuantity,
        });
    }

    function fromCartItem(item, constraintMap, cartItems = []) {
        if (constraintMap && item?.key && constraintMap[item.key]) {
            const c = constraintMap[item.key];
            return {
                min: toPositiveInt(c.min, 1),
                max: c.max == null || c.max === '' ? null : toNonNegInt(c.max, null),
                step: toPositiveInt(c.step, 1),
                absoluteMax:
                    c.absolute_max == null || c.absolute_max === ''
                        ? null
                        : toNonNegInt(c.absolute_max, null),
                cartQuantity: toNonNegInt(c.cart_quantity, 0),
                otherCartQuantity: toNonNegInt(c.other_cart_quantity, 0),
                canPurchase: true,
            };
        }

        const variantId = item?.variant_id != null ? item.variant_id : item?.id;
        const lineQty = toNonNegInt(item?.quantity, 0);
        const total = cartQuantityForVariant(variantId, cartItems);
        const otherCartQuantity = Math.max(0, total - lineQty);

        return fromVariant(
            {
                quantity_rule: item?.quantity_rule || item?.variant?.quantity_rule,
                inventory_management:
                    item?.inventory_management ?? item?.variant?.inventory_management,
                inventory_policy: item?.inventory_policy ?? item?.variant?.inventory_policy,
                inventory_quantity: item?.inventory_quantity ?? item?.variant?.inventory_quantity,
            },
            { surface: 'cart', cartQuantity: total, otherCartQuantity },
        );
    }

    const api = {
        resolve,
        fromVariant,
        fromCartItem,
        cartQuantityForVariant,
        nextValidTotal,
        largestValidTotal,
    };

    root.__Theme__.QuantityConstraints = api;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
