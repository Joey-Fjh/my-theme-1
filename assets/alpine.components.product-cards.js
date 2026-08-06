(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineComponentGroups = window.__Theme__.AlpineComponentGroups || {};

    const AlpineComponentsFactory = window.__Theme__?.AlpineComponentsFactory;
    const ComponentGroups = window.__Theme__.AlpineComponentGroups;

    if (!AlpineComponentsFactory) return;

    // Ignore synthetic clicks that land on +/X immediately after a scroll gesture.
    const TOUCH_TOGGLE_SCROLL_GUARD_MS = 400;
    let productCardTouchScrollAt = 0;
    let productCardTouchScrollGuardBound = false;

    function ensureProductCardTouchScrollGuard() {
        if (productCardTouchScrollGuardBound || typeof window === 'undefined') return;
        productCardTouchScrollGuardBound = true;
        window.addEventListener(
            'scroll',
            () => {
                productCardTouchScrollAt = Date.now();
            },
            { passive: true, capture: true },
        );
    }

    function shouldIgnoreTouchToggleAfterScroll() {
        return Date.now() - productCardTouchScrollAt < TOUCH_TOGGLE_SCROLL_GUARD_MS;
    }

    ComponentGroups.productCards = {
        cardGallery({ imageCount = 1, enableImageNavigation = true, enableImagePagination } = {}) {
            if (enableImagePagination !== undefined && enableImageNavigation === true) {
                enableImageNavigation = enableImagePagination;
            }

            return {
                imageCount: Math.max(1, Number(imageCount) || 1),
                enableImageNavigation: enableImageNavigation !== false,
                activeImageIndex: 0,

                _hydrateFromDataset() {
                    const dataset = this.$el?.dataset || {};
                    if (dataset.imageCount !== undefined && dataset.imageCount !== '') {
                        this.imageCount = Math.max(1, Number(dataset.imageCount) || 1);
                    } else if (Array.isArray(this.product?.images) && this.product.images.length) {
                        this.imageCount = this.product.images.length;
                    }
                    if (
                        dataset.enableImageNavigation !== undefined &&
                        dataset.enableImageNavigation !== ''
                    ) {
                        this.enableImageNavigation = dataset.enableImageNavigation !== 'false';
                    } else if (Array.isArray(this.product?.images)) {
                        this.enableImageNavigation = this.product.images.length > 1;
                    }
                },

                init() {
                    this._hydrateFromDataset();
                },

                _syncNavigationState() {
                    this._hydrateFromDataset();
                    const slideCount = this.$el?.querySelectorAll?.(
                        '[data-product-card-carousel-slide][data-index]',
                    ).length;
                    if (slideCount > 1) {
                        this.imageCount = Math.max(this.imageCount, slideCount);
                    }
                },

                get hasMultipleImages() {
                    return this.imageCount > 1;
                },

                get canNavigateImages() {
                    return this.enableImageNavigation && this.hasMultipleImages;
                },

                get canPaginateImages() {
                    return this.canNavigateImages;
                },

                get canShowHoverActions() {
                    return this.hoverMode === 'actions';
                },

                get canShowVariantPanel() {
                    return this.hoverMode === 'variants';
                },

                get showHoverActions() {
                    if (!this.canShowHoverActions) return false;
                    return this.imageHover || this.actionsHover;
                },

                get imageNavigationLabel() {
                    return `${this.activeImageIndex + 1}/${this.imageCount}`;
                },

                get paginationLabel() {
                    return this.imageNavigationLabel;
                },

                setActiveImage(index) {
                    this._syncNavigationState();
                    if (!this.canNavigateImages) return;
                    this.activeImageIndex = this._normalizeIndex(index);
                },

                nextImage() {
                    this._syncNavigationState();
                    if (!this.canNavigateImages) return;
                    this.setActiveImage(this.activeImageIndex + 1);
                },

                prevImage() {
                    this._syncNavigationState();
                    if (!this.canNavigateImages) return;
                    this.setActiveImage(this.activeImageIndex - 1);
                },

                _normalizeIndex(index) {
                    const total = this.imageCount;
                    return ((Number(index) % total) + total) % total;
                },
            };
        },

        productCard({
            imageCount = 1,
            hoverMode = 'actions',
            hasVariantPanel = true,
            enableImageNavigation = true,
            enableImagePagination,
            quickViewDialogId = '',
            cartDialogId = '',
            primaryVariantId = 0,
            primaryVariantAvailable = false,
            cartType = 'drawer',
            cartUrl = '',
        } = {}) {
            if (enableImagePagination !== undefined && enableImageNavigation === true) {
                enableImageNavigation = enableImagePagination;
            }

            return {
                ...AlpineComponentsFactory.useDisposable(),
                ...ComponentGroups.productCards.cardGallery({ imageCount, enableImageNavigation }),
                imageHover: false,
                actionsHover: false,
                hoverMode,
                hasVariantPanel: Boolean(hasVariantPanel),
                quickViewDialogId,
                cartDialogId,
                primaryVariantId: Number(primaryVariantId) || 0,
                primaryVariantAvailable: Boolean(primaryVariantAvailable),
                cartType,
                cartUrl,
                isAddingToCart: false,
                isTouchDevice: false,
                actionsPinned: false,
                _hoverLeaveTimer: null,

                get hasMultipleImages() {
                    return this.imageCount > 1;
                },

                get canNavigateImages() {
                    return this.enableImageNavigation && this.hasMultipleImages;
                },

                get canPaginateImages() {
                    return this.canNavigateImages;
                },

                get canShowHoverActions() {
                    return this.hoverMode === 'actions';
                },

                get canShowVariantPanel() {
                    return this.hoverMode === 'variants' && this.hasVariantPanel;
                },

                get showHoverActions() {
                    if (!this.canShowHoverActions) return false;
                    if (this.isTouchDevice) return this.actionsPinned;
                    return this.imageHover || this.actionsHover;
                },

                get showVariantPanel() {
                    if (!this.canShowVariantPanel) return false;
                    if (this.isTouchDevice) return false;
                    return this.imageHover;
                },

                get imageNavigationLabel() {
                    return `${this.activeImageIndex + 1}/${this.imageCount}`;
                },

                get paginationLabel() {
                    return this.imageNavigationLabel;
                },

                init() {
                    this._hydrateFromDataset();
                    const dataset = this.$el?.dataset || {};
                    this.hoverMode = dataset.hoverMode || this.hoverMode || 'actions';
                    if (dataset.hasVariantPanel !== undefined && dataset.hasVariantPanel !== '') {
                        this.hasVariantPanel = dataset.hasVariantPanel === 'true';
                    }
                    this.quickViewDialogId =
                        dataset.quickViewDialogId || this.quickViewDialogId || '';
                    this.cartDialogId = dataset.cartDialogId || this.cartDialogId || '';
                    if (dataset.primaryVariantId !== undefined && dataset.primaryVariantId !== '') {
                        this.primaryVariantId = Number(dataset.primaryVariantId) || 0;
                    }
                    if (
                        dataset.primaryVariantAvailable !== undefined &&
                        dataset.primaryVariantAvailable !== ''
                    ) {
                        this.primaryVariantAvailable = dataset.primaryVariantAvailable === 'true';
                    }
                    if (dataset.cartType !== undefined && dataset.cartType !== '') {
                        this.cartType = dataset.cartType;
                    }
                    if (dataset.cartUrl !== undefined && dataset.cartUrl !== '') {
                        this.cartUrl = dataset.cartUrl;
                    }
                    this.isTouchDevice = this._detectTouch();
                    this._toastAdded = dataset.toastAdded || '';

                    if (this.isTouchDevice) {
                        ensureProductCardTouchScrollGuard();
                        this.on(document, 'pointerdown', (event) =>
                            this._handleTouchOutside(event),
                        );
                    }
                },

                _detectTouch() {
                    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
                        return false;
                    }
                    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
                },

                setImageHover(value) {
                    if (this.isTouchDevice) return;

                    if (this._hoverLeaveTimer) {
                        clearTimeout(this._hoverLeaveTimer);
                        this._hoverLeaveTimer = null;
                    }

                    if (value) {
                        this.imageHover = true;
                        return;
                    }

                    // Delay hide slightly so pointer can move from image to bottom actions.
                    this._hoverLeaveTimer = setTimeout(() => {
                        this.imageHover = false;
                    }, 90);
                },

                setActionsHover(value) {
                    if (this.isTouchDevice) return;
                    if (!this.canShowHoverActions) return;
                    this.actionsHover = Boolean(value);
                },

                toggleTouchActions(event) {
                    if (!this.isTouchDevice || !this.canShowHoverActions) return;
                    event.preventDefault();
                    event.stopPropagation();
                    if (shouldIgnoreTouchToggleAfterScroll()) return;
                    this.actionsPinned = !this.actionsPinned;
                    if (!this.actionsPinned) this._blurHoverActionsFocus();
                },

                closeTouchActions() {
                    if (!this.isTouchDevice) return;
                    this.actionsPinned = false;
                    this._blurHoverActionsFocus();
                },

                _blurHoverActionsFocus() {
                    const active = document.activeElement;
                    const panel = this.$el?.querySelector?.('.product-card__hover-actions');
                    if (!panel || !active || !panel.contains(active)) return;
                    if (typeof active.blur === 'function') active.blur();
                },

                _handleTouchOutside(event) {
                    if (!this.actionsPinned) return;

                    const root = this.$el;
                    if (!root || root.contains(event.target)) return;

                    this.closeTouchActions();
                },

                openQuickView() {
                    if (this.isTouchDevice && shouldIgnoreTouchToggleAfterScroll()) return;
                    this.closeTouchActions();
                    if (!this.quickViewDialogId) return;
                    this.$store?.dialog?.open?.(this.quickViewDialogId);
                },

                addPrimaryVariantToCart() {
                    if (
                        !this.primaryVariantAvailable ||
                        !this.primaryVariantId ||
                        this.isAddingToCart
                    ) {
                        return;
                    }

                    this.closeTouchActions();

                    const cart = this.$store?.cart;
                    if (!cart?.add) return;

                    this.isAddingToCart = true;

                    const request = cart.add([{ id: this.primaryVariantId, quantity: 1 }], []);

                    if (this.cartType === 'page') {
                        request
                            .then(() => {
                                if (this._toastAdded) {
                                    this.$store?.toast?.show?.(this._toastAdded, 'success');
                                }
                                window.location.assign(this.cartUrl);
                            })
                            .catch(() => {
                                // Error toast handled by $store.cart._handleError
                            })
                            .finally(() => {
                                this.isAddingToCart = false;
                            });
                    } else {
                        if (this.cartDialogId) {
                            this.$store?.dialog?.open?.(this.cartDialogId);
                        }

                        request
                            .then(() => {
                                if (!this.cartDialogId && this._toastAdded) {
                                    this.$store?.toast?.show?.(this._toastAdded, 'success');
                                }
                            })
                            .catch(() => {
                                // Error toast handled by $store.cart._handleError
                            })
                            .finally(() => {
                                this.isAddingToCart = false;
                            });
                    }
                },

                destroy() {
                    if (this._hoverLeaveTimer) {
                        clearTimeout(this._hoverLeaveTimer);
                        this._hoverLeaveTimer = null;
                    }
                    this.actionsPinned = false;
                    this.dispose();
                },
            };
        },

        relatedProducts() {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                url: '',
                sectionId: '',
                _observer: null,
                _abortController: null,
                _loadingTimer: null,
                _requestTimeout: null,
                loaded: false,
                uiState: 'idle',
                loadingSeconds: 0,
                requestTimeoutMs: 10000,

                init() {
                    this.url = this.$el?.dataset?.relatedProductsUrl || '';
                    this.sectionId = this.$el?.dataset?.relatedProductsSectionId || '';

                    if (!this.url || this.loaded) return;

                    if (!('IntersectionObserver' in window)) {
                        this.load();
                        return;
                    }

                    this._observer = new IntersectionObserver(
                        (entries) => {
                            for (const entry of entries) {
                                if (!entry.isIntersecting) continue;
                                this.load();
                                this._observer?.disconnect?.();
                                this._observer = null;
                                break;
                            }
                        },
                        { rootMargin: '200px' },
                    );

                    this._observer.observe(this.$el);
                },

                _resetLoadingIndicators() {
                    if (this._loadingTimer) {
                        clearInterval(this._loadingTimer);
                        this._loadingTimer = null;
                    }
                    if (this._requestTimeout) {
                        clearTimeout(this._requestTimeout);
                        this._requestTimeout = null;
                    }
                    this.loadingSeconds = 0;
                },

                _startLoadingIndicators(ctrl) {
                    this._resetLoadingIndicators();
                    this.loadingSeconds = 0;
                    this.uiState = 'loading';

                    this._loadingTimer = setInterval(() => {
                        this.loadingSeconds += 1;
                    }, 1000);

                    this._requestTimeout = setTimeout(() => {
                        if (this._abortController !== ctrl) return;
                        this.uiState = 'timeout';
                        this.loaded = false;
                        ctrl.abort();
                    }, this.requestTimeoutMs);
                },

                retry() {
                    if (!this.url || this.uiState === 'loading') return;
                    this.load();
                },

                load() {
                    if (this.loaded || !this.url || this.uiState === 'loading') return;
                    this.loaded = true;

                    if (this._abortController) this._abortController.abort();
                    this._abortController = new AbortController();
                    const ctrl = this._abortController;

                    const Http = window.ShopifyHttp;
                    const SectionRefresher = window.ShopifySectionRefresher;

                    if (!Http?.request) {
                        this.loaded = false;
                        this.uiState = 'error';
                        return;
                    }

                    this._startLoadingIndicators(ctrl);

                    const request = Http.request(this.url, {
                        method: 'GET',
                        headers: { Accept: 'text/html' },
                        signal: ctrl.signal,
                    });

                    request
                        .then((res) => res.text())
                        .then((html) => {
                            if (!SectionRefresher || !this.sectionId) {
                                this.loaded = false;
                                this.uiState = 'error';
                                return;
                            }

                            const sections = { [this.sectionId]: html };
                            const domMap = {
                                [this.sectionId]: {
                                    targetSelector: `[data-section-id="${CSS.escape(this.sectionId)}"]`,
                                    innerSelectors: ['[data-related-products-content]'],
                                },
                            };

                            SectionRefresher.render(sections, domMap);
                            this.uiState = 'success';
                        })
                        .catch((err) => {
                            if (err?.isAbort || err?.name === 'AbortError') return;
                            console.error('Related products load failed:', err);
                            // allow retry if needed
                            this.loaded = false;
                            this.uiState = 'error';
                        })
                        .finally(() => {
                            this._resetLoadingIndicators();
                            if (this._abortController === ctrl) {
                                this._abortController = null;
                            }
                        });
                },

                destroy() {
                    if (this._observer?.disconnect) this._observer.disconnect();
                    this._observer = null;

                    if (this._abortController) this._abortController.abort();
                    this._abortController = null;
                    this._resetLoadingIndicators();

                    if (this.dispose) this.dispose();
                },
            };
        },
    };
})();
