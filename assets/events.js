(function () {
    'use strict';

    class ThemeEvents {
        static _globalTarget = window;

        static events = {
            COMPONENT_UNMOUNTED: 'theme:component:unmounted',
            HEADER_MENU_ACTIVE_CHANGED: 'theme:header:menu:active-changed',
            PRODUCT_VARIANT_SET_REQUEST: 'theme:product:variant:request:set',
            PRODUCT_VARIANT_CHANGED: 'theme:product:variant:changed',
            PRODUCT_GALLERY_SLIDE_TO_REQUEST: 'theme:product-gallery:request:slide-to',
            PRODUCT_QUANTITY_CHANGED: 'theme:product:quantity:changed',
            PRODUCT_MEDIA_MODAL_ACTIVATE: 'theme:product-media-modal:activate',
        };

        static _resolveTarget(target) {
            if (target instanceof EventTarget) return target;
            return this._globalTarget;
        }

        static emit(type, detail, options) {
            if (typeof type !== 'string' || !type.trim()) return null;
            const opts = options || {};
            const target = this._resolveTarget(opts.target);

            const event = new CustomEvent(type, {
                detail,
                bubbles: !!opts.bubbles,
                cancelable: !!opts.cancelable,
                composed: !!opts.composed,
            });
            target.dispatchEvent(event);

            return event;
        }

        static on(type, handler, options) {
            if (typeof type !== 'string' || !type.trim()) return () => {};
            if (typeof handler !== 'function') return () => {};
            const opts = options || {};
            const { target, ...listenerOptions } = opts;
            const resolvedTarget = this._resolveTarget(target);

            resolvedTarget.addEventListener(type, handler, listenerOptions);

            return () => {
                resolvedTarget.removeEventListener(type, handler, listenerOptions);
            };
        }

        static once(type, handler, options) {
            const opts = options || {};
            return this.on(type, handler, {
                ...opts,
                once: true,
            });
        }

        static createScope(options) {
            const opts = options || {};
            const defaultTarget = opts.target;
            const disposers = [];

            return {
                on: (type, handler, listenerOptions) => {
                    const off = ThemeEvents.on(type, handler, {
                        target: defaultTarget,
                        ...(listenerOptions || {}),
                    });
                    disposers.push(off);
                    return off;
                },
                once: (type, handler, listenerOptions) => {
                    const off = ThemeEvents.once(type, handler, {
                        target: defaultTarget,
                        ...(listenerOptions || {}),
                    });
                    disposers.push(off);
                    return off;
                },
                emit: (type, detail, emitOptions) =>
                    ThemeEvents.emit(type, detail, {
                        target: defaultTarget,
                        ...(emitOptions || {}),
                    }),
                dispose: () => {
                    disposers.forEach((off) => off());
                    disposers.length = 0;
                },
            };
        }
    }

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.Events = ThemeEvents;
})();
