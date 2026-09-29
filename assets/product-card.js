import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import { createCardGalleryState } from './card-gallery.js';

const TOUCH_TOGGLE_SCROLL_GUARD_MS = 400;
let productCardTouchScrollAt = 0;

function shouldIgnoreTouchToggleAfterScroll() {
    return Date.now() - productCardTouchScrollAt < TOUCH_TOGGLE_SCROLL_GUARD_MS;
}

define('productCard', (options = {}) => {
    const gallery = createCardGalleryState({
        imageCount: options.imageCount,
        enableImageNavigation:
            options.enableImagePagination !== undefined && options.enableImageNavigation === true
                ? options.enableImagePagination
                : options.enableImageNavigation,
    });

    return {
        ...useDisposable(),
        imageHover: false,
        actionsHover: false,
        hoverMode: options.hoverMode || 'actions',
        hasVariantPanel: options.hasVariantPanel !== false,
        quickViewDialogId: options.quickViewDialogId || '',
        cartDialogId: options.cartDialogId || '',
        primaryVariantId: Number(options.primaryVariantId) || 0,
        primaryVariantAvailable: Boolean(options.primaryVariantAvailable),
        cartType: options.cartType || 'drawer',
        cartUrl: options.cartUrl || '',
        isAddingToCart: false,
        isTouchDevice: false,
        actionsPinned: false,
        _hoverLeaveTimer: null,
        _toastAdded: '',

        get imageCount() {
            return gallery.imageCount;
        },
        set imageCount(value) {
            gallery.imageCount = value;
        },
        get enableImageNavigation() {
            return gallery.enableImageNavigation;
        },
        set enableImageNavigation(value) {
            gallery.enableImageNavigation = value;
        },
        get activeImageIndex() {
            return gallery.activeImageIndex;
        },
        set activeImageIndex(value) {
            gallery.activeImageIndex = value;
        },
        get hasMultipleImages() {
            return gallery.hasMultipleImages;
        },
        get canNavigateImages() {
            return gallery.canNavigateImages;
        },
        get canPaginateImages() {
            return gallery.canPaginateImages;
        },
        get imageNavigationLabel() {
            return gallery.imageNavigationLabel;
        },
        get paginationLabel() {
            return gallery.paginationLabel;
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

        init() {
            gallery._hydrateFromDataset(this.$el);
            const dataset = this.$el?.dataset || {};
            this.hoverMode = dataset.hoverMode || this.hoverMode || 'actions';
            if (dataset.hasVariantPanel !== undefined && dataset.hasVariantPanel !== '') {
                this.hasVariantPanel = dataset.hasVariantPanel === 'true';
            }
            this.quickViewDialogId = dataset.quickViewDialogId || this.quickViewDialogId || '';
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
                this.on(
                    window,
                    'scroll',
                    () => {
                        productCardTouchScrollAt = Date.now();
                    },
                    { passive: true, capture: true },
                );
                this.on(document, 'pointerdown', (event) => this._handleTouchOutside(event));
            }
        },

        _detectTouch() {
            if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
                return false;
            }
            return window.matchMedia('(hover: none), (pointer: coarse)').matches;
        },

        onMouseLeave() {
            this.setImageHover(false);
            this.setActionsHover(false);
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

            this._hoverLeaveTimer = setTimeout(() => {
                this.imageHover = false;
            }, 90);
        },

        setActionsHover(value) {
            if (this.isTouchDevice) return;
            if (!this.canShowHoverActions) return;
            this.actionsHover = Boolean(value);
        },

        setActiveImage(index) {
            gallery.setActiveImage(index, this.$el);
        },

        nextImage() {
            gallery.nextImage(this.$el);
        },

        prevImage() {
            gallery.prevImage(this.$el);
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
            if (!this.primaryVariantAvailable || !this.primaryVariantId || this.isAddingToCart) {
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
                        /* error toast handled by cart store */
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
                        /* error toast handled by cart store */
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
});
