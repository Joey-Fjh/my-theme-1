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
                _eventScope: null,

                _formatPrice(value) {
                    return new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: this.currency,
                    }).format(value / 100);
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

                init() {
                    const dataset = this.$el?.dataset || {};
                    this.sectionId = this.sectionId || dataset.sectionId || '';
                    this.price = Number(dataset.price ?? this.price ?? 0);
                    this.comparePrice = Number(dataset.comparePrice ?? this.comparePrice ?? 0);
                    this.currency = dataset.currency || this.currency || 'USD';

                    const Events = window.__Theme__.Events;
                    const events = Events.events;
                    this._eventScope = Events.createScope();

                    const onVariantChange = (e) => {
                        if (e.detail?.sectionId !== this.sectionId) return;
                        const v = e.detail.variant;
                        this.price = v?.price || 0;
                        this.comparePrice = v?.compare_at_price || 0;
                    };

                    this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);
                },

                destroy() {
                    this._eventScope?.dispose?.();
                    this._eventScope = null;
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

                    if (dataset.variants) {
                        try {
                            this.variants = JSON.parse(dataset.variants);
                        } catch (_) {
                            /* noop */
                        }
                    }

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
                ...(sectionId ? AlpineComponentsFactory.useDisposable() : {}),
                qty: value,
                min,
                max,
                step,
                _eventScope: null,
                _sectionId: sectionId,

                get canDecrement() {
                    return this.qty > this.min;
                },
                get canIncrement() {
                    return this.max === null || this.qty < this.max;
                },

                _hydrateFromDataset() {
                    const ds = this.$el?.dataset;
                    if (!ds) return;
                    if (ds.qtyValue) this.qty = Number(ds.qtyValue) || 1;
                    if (ds.qtyMin) this.min = Number(ds.qtyMin) || 1;
                    if (ds.qtyMax && ds.qtyMax !== 'null') this.max = Number(ds.qtyMax);
                    if (ds.qtyStep) this.step = Number(ds.qtyStep) || 1;
                    if (ds.qtySectionId) this._sectionId = ds.qtySectionId;
                },

                init() {
                    this._hydrateFromDataset();
                    const sectionId = this._sectionId;
                    if (!sectionId) return;
                    const Events = window.__Theme__.Events;
                    const events = Events.events;
                    this._eventScope = Events.createScope();

                    const onVariantChange = (e) => {
                        if (e.detail?.sectionId !== sectionId) return;
                        const variant = e.detail.variant;
                        if (!variant) return;
                        if (
                            variant.inventory_policy === 'continue' ||
                            variant.inventory_quantity == null
                        ) {
                            this.max = null;
                        } else {
                            this.max = Math.max(this.min, variant.inventory_quantity);
                        }
                        if (this.max !== null && this.qty > this.max) {
                            this.qty = this.max;
                            this._notify();
                        }
                    };

                    this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);
                },

                increment() {
                    if (!this.canIncrement) {
                        this._toast(`Maximum quantity is ${this.max}.`);
                        return;
                    }
                    this.qty =
                        this.max !== null
                            ? Math.min(this.max, this.qty + this.step)
                            : this.qty + this.step;
                    this._notify();
                },

                decrement() {
                    if (!this.canDecrement) {
                        this._toast(`Minimum quantity is ${this.min}.`);
                        return;
                    }
                    this.qty = Math.max(this.min, this.qty - this.step);
                    this._notify();
                },

                onInput() {
                    const raw = parseInt(this.qty);
                    if (isNaN(raw) || raw < this.min) {
                        this._toast(`Quantity must be at least ${this.min}.`);
                        this.qty = this.min;
                        this._notify();
                        return;
                    }
                    if (this.max !== null && raw > this.max) {
                        this._toast(`You can only add up to ${this.max} of this item.`);
                        this.qty = this.max;
                        this._notify();
                        return;
                    }
                    this.qty = raw;
                    this._notify();
                },

                _notify() {
                    const Events = window.__Theme__.Events;
                    const events = Events.events;
                    const detail = { value: this.qty };
                    Events.emit(events.PRODUCT_QUANTITY_CHANGED, detail, {
                        target: this.$el,
                        bubbles: true,
                    });
                },

                _toast(msg) {
                    window.Alpine?.store('toast')?.show?.(msg, 'info');
                },

                destroy() {
                    this._eventScope?.dispose?.();
                    this._eventScope = null;
                    if (sectionId) this.dispose();
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
            successMessage = 'Added to cart!',
            requestSections = '',
            showBuyNow = false,
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
                isLoading: false,
                _eventScope: null,

                get buttonText() {
                    if (!this.variantId) return 'Unavailable';
                    if (!this.available) return 'Sold out';
                    return 'Add to cart';
                },

                init() {
                    const dataset = this.$el?.dataset || {};
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
                    };

                    this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);
                },

                _getQuantity() {
                    const form = document.getElementById(this.productFormId);
                    const qtyInput =
                        form?.querySelector('input[name="quantity"]') ||
                        document.querySelector(
                            `input[name="quantity"][form="${this.productFormId}"]`,
                        ) ||
                        this.$el.closest('.product-info')?.querySelector('input[name="quantity"]');
                    return qtyInput ? parseInt(qtyInput.value) || 1 : 1;
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

                addToCart() {
                    if (!this.available || !this.variantId || this.isLoading) return;

                    this.isLoading = true;
                    const cart = window.Alpine?.store('cart');
                    if (!cart) {
                        this.isLoading = false;
                        return;
                    }

                    const sections = this._getSections();

                    cart.add([{ id: this.variantId, quantity: this._getQuantity() }], sections)
                        .then(() => {
                            if (this.openCartOnAdd && this.openDialogId) {
                                window.Alpine?.store('dialog')?.open?.(this.openDialogId);
                            }

                            if (this.successMessage) {
                                window.Alpine?.store('toast')?.show?.(
                                    this.successMessage,
                                    'success',
                                );
                            }
                        })
                        .catch((err) => {
                            const msg = err?.message || 'Could not add to cart. Please try again.';
                            window.Alpine?.store('toast')?.show?.(msg, 'error');
                        })
                        .finally(() => {
                            this.isLoading = false;
                        });
                },

                buyNow() {
                    if (!this.available || !this.variantId || this.isLoading) return;

                    this.isLoading = true;
                    const cart = window.Alpine?.store('cart');
                    if (!cart) {
                        this.isLoading = false;
                        return;
                    }

                    cart.add([{ id: this.variantId, quantity: this._getQuantity() }], [])
                        .then(() => {
                            window.location.assign('/checkout');
                        })
                        .catch((err) => {
                            const msg = err?.message || 'Could not continue to checkout.';
                            window.Alpine?.store('toast')?.show?.(msg, 'error');
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
            loadingText = 'Checking store pickup availability...',
            errorText = 'Unable to load pickup availability right now.',
            retryText = 'Try again',
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
                _infoTarget: null,
                _infoBlocks: null,
                _descriptionBlock: null,
                _description: null,

                init() {
                    const el = this.$el;
                    this._mediaTarget = el.querySelector('[data-product-media-sticky-target]');
                    this._infoTarget = el.querySelector('[data-product-info-sticky-target]');
                    this._infoBlocks = el.querySelector(
                        '[data-product-info-panel] .product-info-blocks',
                    );
                    this._descriptionBlock = this._infoBlocks?.querySelector(
                        '.product-info-blocks__description-block',
                    );
                    this._description = this._descriptionBlock?.querySelector(
                        '.product-info-blocks__description',
                    );

                    if (!this._mediaTarget || !this._infoTarget) return;

                    this._desktopQuery = window.matchMedia('(min-width: 48rem)');

                    this._resizeObserver = new ResizeObserver(() => this._sync());
                    this._resizeObserver.observe(this._mediaTarget);
                    this._resizeObserver.observe(this._infoTarget);
                    if (this._infoBlocks) {
                        Array.from(this._infoBlocks.children).forEach((child) =>
                            this._resizeObserver.observe(child),
                        );
                    }

                    this.on(window, 'resize', () => this._sync());
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
                    target.style.removeProperty('align-self');
                },

                _applySticky(target) {
                    if (!target) return;
                    target.style.position = 'sticky';
                    target.style.top = 'var(--product-sticky-top, 0px)';
                    target.style.transition = 'top 120ms ease-out';
                    target.style.alignSelf = 'start';
                },

                _setStickyOffset() {
                    this.$el.style.setProperty('--product-sticky-top', '0px');
                },

                _resetDescription() {
                    this._infoBlocks?.style.removeProperty('max-height');
                    this._descriptionBlock?.style.removeProperty('max-height');
                    this._description?.style.removeProperty('max-height');
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

                        const el = this.$el;
                        const mediaPanel = el.querySelector('[data-product-media-panel]');
                        const mediaHeight = this._mediaTarget.getBoundingClientRect().height;
                        const infoHeight = this._infoTarget.getBoundingClientRect().height;
                        if (mediaHeight <= 0) {
                            this._reset();
                            return;
                        }

                        const availableViewport = Math.max(0, this._getViewportHeight());
                        const heightTolerance = 24;
                        const nextStickySide =
                            mediaHeight + heightTolerance < infoHeight ? 'media' : 'info';
                        const stickyTarget =
                            nextStickySide === 'media' ? this._mediaTarget : this._infoTarget;
                        const stickyHeight = nextStickySide === 'media' ? mediaHeight : infoHeight;

                        this._clearSticky(this._mediaTarget);
                        this._clearSticky(this._infoTarget);

                        if (stickyHeight <= availableViewport) {
                            this._applySticky(stickyTarget);
                            this.stickySide = nextStickySide;
                        } else {
                            this.stickySide = 'none';
                        }

                        if (
                            mediaPanel &&
                            this._infoBlocks &&
                            this._descriptionBlock &&
                            this._description
                        ) {
                            const maxReferenceHeight = Math.max(360, availableViewport);
                            const referenceHeight = Math.min(
                                mediaPanel.getBoundingClientRect().height,
                                maxReferenceHeight,
                            );

                            const styles = window.getComputedStyle(this._infoBlocks);
                            const gap = parseFloat(styles.rowGap || styles.gap) || 0;
                            const paddingY =
                                (parseFloat(styles.paddingTop) || 0) +
                                (parseFloat(styles.paddingBottom) || 0);
                            const children = Array.from(this._infoBlocks.children).filter(
                                (child) => child instanceof HTMLElement,
                            );
                            const otherBlocksHeight = children.reduce((total, child) => {
                                if (child === this._descriptionBlock) return total;
                                return total + child.getBoundingClientRect().height;
                            }, 0);
                            const gapsHeight = gap * Math.max(children.length - 1, 0);
                            const available = Math.max(
                                0,
                                referenceHeight - paddingY - gapsHeight - otherBlocksHeight,
                            );

                            this._descriptionBlock.style.maxHeight = `${Math.floor(available)}px`;
                            this._description.style.maxHeight = `${Math.floor(available)}px`;
                        } else {
                            this._resetDescription();
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
    };
})();
