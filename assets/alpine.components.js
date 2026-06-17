(function () {
    'use strict';

    class AlpineComponentsFactory {
        static #alpine;
        static #registeredNames = new Set();

        static init(alpine) {
            this.#alpine = alpine;
        }

        static register(name, cb) {
            if (!this.#alpine) throw new Error('AlpineComponentsFactory not initialized');

            if (typeof name !== 'string' || !name.trim())
                throw new Error('Component name must be a non-empty string');

            name = name.trim();

            if (this.#registeredNames.has(name)) {
                console.warn(`Component "${name}" already registered, skipping`);
                return;
            }

            const enhancedCb = function (...args) {
                const componentDefinition = cb.apply(this, args);

                const ThemeEvents = window.__Theme__.Events;
                const eventNames = ThemeEvents.events;
                const unmountEvent = eventNames.COMPONENT_UNMOUNTED;

                if (typeof componentDefinition.dispose !== 'function') {
                    return componentDefinition;
                }

                const originalInit = componentDefinition.init;

                componentDefinition.init = function () {
                    if (
                        this.$el &&
                        typeof this.on === 'function' &&
                        typeof this.destroy === 'function'
                    ) {
                        this.on(this.$el, unmountEvent, this.destroy.bind(this));
                    }

                    if (originalInit) {
                        originalInit.apply(this, arguments);
                    }
                };

                return componentDefinition;
            };

            this.#alpine.data(name, enhancedCb);
            this.#registeredNames.add(name);
        }

        static useDisposable() {
            const disposers = [];

            return {
                on(target, event, handler, options) {
                    if (!target || typeof target.addEventListener !== 'function') return;

                    target.addEventListener(event, handler, options);
                    disposers.push(() => target.removeEventListener(event, handler, options));
                },

                observe(observer, el) {
                    if (!el || !observer?.observe) return;

                    observer.observe(el);
                    disposers.push(() => observer.unobserve(el));
                },

                dispose() {
                    disposers.forEach((disposer) => disposer());
                    disposers.length = 0;
                },
            };
        }
    }

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineComponentsFactory = AlpineComponentsFactory;
    window.__Theme__.AlpineComponentGroups = window.__Theme__.AlpineComponentGroups || {};
    window.__Theme__.AlpineComponents = Object.assign(window.__Theme__.AlpineComponents || {}, {
        DROPDOWN: 'dropdown',
        MOBILEMENUDRAWER: 'mobileMenuDrawer',
        DRAGSCROLL: 'dragScroll',
        STICKY_HEADER: 'stickyHeader',
        TABCONTROL: 'tabControl',
        BEFOREAFTERCOMPARISON: 'beforeAfterComparison',
        COUNTDOWNTIMER: 'countdownTimer',
        SECTIONPAGINATION: 'sectionPagination',
        COLLECTIONFILTERS: 'collectionFilters',
        COLLECTIONFILTERFIELD: 'collectionFilterField',
        PROGRESSIVELIST: 'progressiveList',
        PRODUCTGALLERY: 'productGallery',
        PRODUCTPRICE: 'ProductPrice',
        VARIANTPICKER: 'VariantPicker',
        QUANTITYSELECTOR: 'QuantitySelector',
        BUYBUTTONS: 'BuyButtons',
        PICKUPAVAILABILITY: 'PickupAvailability',
        PREDICTIVESEARCH: 'predictiveSearch',
        RELATEDPRODUCTS: 'relatedProducts',
        NEWSLETTERBANNER: 'newsletterBanner',
        NEWSLETTEROVERLAY: 'newsletterOverlay',
        CARTOVERLAY: 'cartOverlay',
        CARDGALLERY: 'cardGallery',
        PRODUCTCARD: 'productCard',
        IMAGELIGHTBOX: 'imageLightbox',
        IMAGEMAGNIFIER: 'imageMagnifier',
        PRODUCTLAYOUT: 'productLayout',
        ACCORDION: 'accordion',
        SORTBYDROPDOWN: 'sortByDropdown',
        FLIPDIGIT: 'flipDigit',
        TOASTCONTAINER: 'toastContainer',
        MOTIONREVEALSECTION: 'motionRevealSection',
    });
})();
