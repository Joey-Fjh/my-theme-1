import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';

define('productComparisonTable', () => ({
    ...useDisposable(),
    _scope: null,
    _scrollEl: null,
    _timeoutRef: { id: null },
    _showDelayMs: 1000,
    _dragThresholdPx: 5,
    _dragStartX: 0,
    _dragStartScrollLeft: 0,
    _isPointerDown: false,
    _didDrag: false,

    init() {
        const scrollEl = this.$el.querySelector('[data-comparison-scroll]');
        if (!scrollEl) return;

        this._scrollEl = scrollEl;
        this._scope = ThemeEvents.createScope({ target: window });

        const showScrollbar = () => {
            scrollEl.classList.add('is-scrolling');
            if (this._timeoutRef.id) clearTimeout(this._timeoutRef.id);
            this._timeoutRef.id = setTimeout(() => {
                scrollEl.classList.remove('is-scrolling');
                this._timeoutRef.id = null;
            }, this._showDelayMs);
        };

        const onScroll = () => {
            showScrollbar();
        };

        this.on(scrollEl, 'scroll', onScroll, { passive: true });

        this._scope.on(
            'mousemove',
            (e) => {
                if (!this._isPointerDown) return;
                const dx = this._dragStartX - e.clientX;
                scrollEl.scrollLeft = this._dragStartScrollLeft + dx;
                if (Math.abs(e.clientX - this._dragStartX) >= this._dragThresholdPx) {
                    this._didDrag = true;
                    scrollEl.classList.add('is-dragging');
                    showScrollbar();
                }
            },
            { passive: true },
        );

        this._scope.on('mouseup', () => {
            this._isPointerDown = false;
            scrollEl.classList.remove('is-dragging');
            setTimeout(() => {
                this._didDrag = false;
            }, 0);
        });

        const onPointerDown = (e) => {
            if (e.button !== 0) return;
            this._isPointerDown = true;
            this._didDrag = false;
            this._dragStartX = e.clientX;
            this._dragStartScrollLeft = scrollEl.scrollLeft;
        };

        this.on(scrollEl, 'mousedown', onPointerDown);

        const onLinkClick = (e) => {
            if (this._didDrag && e.target.closest('.comparison-table-product-link')) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        this.on(scrollEl, 'click', onLinkClick, true);
    },

    destroy() {
        if (this._timeoutRef?.id) clearTimeout(this._timeoutRef.id);
        this._scope?.dispose?.();
        this._scope = null;
        this._scrollEl = null;
        this.dispose();
    },
}));
