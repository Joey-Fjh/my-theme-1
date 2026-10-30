import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';

define('productLayout', () => ({
    ...useDisposable(),
    stickySide: 'none',
    _resizeObserver: null,
    _frame: 0,
    _desktopQuery: null,
    _mediaTarget: null,
    _mediaPanel: null,
    _infoTarget: null,
    _infoBlocks: null,
    _descriptionBlock: null,
    _description: null,

    init() {
        const el = this.$el;
        this._mediaTarget = el.querySelector('[data-product-media-sticky-target]');
        this._mediaPanel = el.querySelector('[data-product-media-panel]');
        this._infoTarget = el.querySelector('[data-product-info-sticky-target]');
        this._infoBlocks = el.querySelector('[data-product-info-panel] [data-product-info-blocks]');
        this._descriptionBlock = this._infoBlocks?.querySelector(
            '[data-product-description-block]',
        );
        this._description = this._descriptionBlock?.querySelector('[data-product-description]');

        if (!this._mediaTarget || !this._infoTarget) return;

        this._desktopQuery = window.matchMedia('(min-width: 48rem)');

        this._resizeObserver = new ResizeObserver(() => this._sync());
        this._resizeObserver.observe(this._mediaTarget);
        this._resizeObserver.observe(this._infoTarget);
        if (this._infoBlocks) {
            Array.from(this._infoBlocks.children).forEach((child) => {
                if (child !== this._descriptionBlock) {
                    this._resizeObserver.observe(child);
                }
            });
        }

        this.on(window, 'resize', () => this._sync());
        this.on(window.visualViewport, 'resize', () => this._sync());
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
    },

    _applySticky(target, top = 'var(--product-sticky-top, var(--sticky-viewport-top, 1rem))') {
        if (!target) return;
        target.style.position = 'sticky';
        target.style.top = top;
        target.style.transition = 'top 120ms ease-out';
    },

    _resolveStickySide(mediaHeight, infoHeight, availableViewport) {
        const mediaFits = mediaHeight <= availableViewport;
        const infoFits = infoHeight <= availableViewport;

        if (mediaFits !== infoFits) return mediaFits ? 'media' : 'info';

        if (!mediaFits && !infoFits) {
            return mediaHeight <= infoHeight ? 'media' : 'info';
        }

        const heightTolerance = 24;
        return mediaHeight + heightTolerance < infoHeight ? 'media' : 'info';
    },

    _getStickyTop(stickyHeight) {
        return `min(
                        var(--product-sticky-top, var(--sticky-viewport-top, 1rem)),
                        calc(100dvh - ${Math.ceil(stickyHeight)}px - var(--sticky-viewport-gap, 1rem))
                    )`;
    },

    _setStickyOffset() {
        this.$el.style.setProperty('--product-sticky-top', 'var(--sticky-viewport-top, 1rem)');
    },

    _getAvailableViewportHeight() {
        const viewportHeight = this._getViewportHeight();
        const rootStyles = window.getComputedStyle(document.documentElement);
        const announcementBarHeight =
            parseFloat(rootStyles.getPropertyValue('--announcement-bar-height')) || 0;
        const headerHeight = parseFloat(rootStyles.getPropertyValue('--header-height')) || 0;
        const stickyGapValue = rootStyles.getPropertyValue('--sticky-viewport-gap').trim();
        const stickyGapNumber = parseFloat(stickyGapValue) || 0;
        const stickyGap = stickyGapValue.endsWith('rem')
            ? stickyGapNumber * (parseFloat(rootStyles.fontSize) || 16)
            : stickyGapNumber;
        const stickyStart = announcementBarHeight + headerHeight + stickyGap;
        const targetTop = Math.min(
            this._mediaTarget.getBoundingClientRect().top,
            this._infoTarget.getBoundingClientRect().top,
        );
        const reservedAnnouncementBarHeight =
            announcementBarHeight > 0 && targetTop <= stickyStart + 1 ? announcementBarHeight : 0;

        return Math.max(
            0,
            viewportHeight - reservedAnnouncementBarHeight - headerHeight - stickyGap * 2,
        );
    },

    _resetDescription() {
        this._infoBlocks?.style.removeProperty('max-height');
        this._descriptionBlock?.style.removeProperty('max-height');
        this._description?.style.removeProperty('max-height');
        this._description?.removeAttribute('data-product-description-scrollable');
        this._description?.removeAttribute('tabindex');
    },

    _setDescriptionLimit(maxHeight) {
        if (!this._description) return;

        this._descriptionBlock?.style.removeProperty('max-height');

        const hasLimit = Number.isFinite(maxHeight);
        const nextValue = hasLimit ? `${Math.max(0, Math.floor(maxHeight))}px` : '';
        if (hasLimit) {
            if (this._description.style.maxHeight !== nextValue) {
                this._description.style.maxHeight = nextValue;
            }
        } else {
            this._description.style.removeProperty('max-height');
        }

        const isScrollable =
            hasLimit && this._description.scrollHeight > this._description.clientHeight + 1;
        this._description.toggleAttribute('data-product-description-scrollable', isScrollable);
        if (isScrollable) {
            this._description.setAttribute('tabindex', '0');
        } else {
            this._description.removeAttribute('tabindex');
        }
    },

    _syncDescription(availableViewport) {
        if (
            !this._mediaPanel ||
            !this._infoBlocks ||
            !this._descriptionBlock ||
            !this._description
        ) {
            this._resetDescription();
            return;
        }

        const mediaPanelHeight = this._mediaPanel.getBoundingClientRect().height;
        if (mediaPanelHeight <= 0 || availableViewport <= 0) {
            this._resetDescription();
            return;
        }

        const referenceHeight = Math.min(mediaPanelHeight, availableViewport);
        const styles = window.getComputedStyle(this._infoBlocks);
        const gap = parseFloat(styles.rowGap || styles.gap) || 0;
        const paddingY =
            (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
        const children = Array.from(this._infoBlocks.children).filter(
            (child) =>
                child instanceof HTMLElement && window.getComputedStyle(child).display !== 'none',
        );
        const otherBlocksHeight = children.reduce((total, child) => {
            if (child === this._descriptionBlock) return total;
            return total + child.getBoundingClientRect().height;
        }, 0);
        const gapsHeight = gap * Math.max(children.length - 1, 0);
        const available = Math.floor(referenceHeight - paddingY - gapsHeight - otherBlocksHeight);
        const naturalHeight = this._description.scrollHeight;
        const descriptionStyles = window.getComputedStyle(this._description);
        const lineHeight = parseFloat(descriptionStyles.lineHeight) || 24;
        const minimumScrollableHeight = Math.min(naturalHeight, Math.max(96, lineHeight * 4));

        if (naturalHeight <= available + 1) {
            this._setDescriptionLimit(null);
            return;
        }

        this._setDescriptionLimit(Math.max(available, minimumScrollableHeight));
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

            const availableViewport = this._getAvailableViewportHeight();
            if (availableViewport <= 0) {
                this._reset();
                return;
            }

            this._clearSticky(this._mediaTarget);
            this._clearSticky(this._infoTarget);
            this._syncDescription(availableViewport);

            const mediaHeight = this._mediaTarget.getBoundingClientRect().height;
            const infoHeight = this._infoTarget.getBoundingClientRect().height;
            if (mediaHeight <= 0 || infoHeight <= 0) {
                this._reset();
                return;
            }

            const nextStickySide = this._resolveStickySide(
                mediaHeight,
                infoHeight,
                availableViewport,
            );
            const stickyTarget = nextStickySide === 'media' ? this._mediaTarget : this._infoTarget;
            const stickyHeight = nextStickySide === 'media' ? mediaHeight : infoHeight;
            const stickyTop = this._getStickyTop(stickyHeight);

            this._applySticky(stickyTarget, stickyTop);
            this.stickySide = nextStickySide;
        });
    },

    destroy() {
        if (this._frame) cancelAnimationFrame(this._frame);
        if (this._resizeObserver) this._resizeObserver.disconnect();
        this._reset();
        this.dispose();
    },
}));
