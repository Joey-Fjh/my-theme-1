import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';

define('stickyViewportPanel', () => ({
    ...useDisposable(),
    _frame: 0,
    _resizeObserver: null,

    init() {
        this._resizeObserver = new ResizeObserver(() => this._sync());
        this.observe(this._resizeObserver, this.$el);
        this.on(window, 'resize', () => this._sync());
        this.on(window.visualViewport, 'resize', () => this._sync());
        this._sync();
    },

    _sync() {
        if (this._frame) cancelAnimationFrame(this._frame);

        this._frame = requestAnimationFrame(() => {
            this._frame = 0;
            const panelHeight = this.$el.getBoundingClientRect().height;

            if (panelHeight <= 0) {
                this.$el.style.removeProperty('top');
                return;
            }

            this.$el.style.top = `min(var(--sticky-viewport-top, 1rem), calc(100dvh - ${Math.ceil(panelHeight)}px - var(--sticky-viewport-gap, 1rem)))`;
        });
    },

    destroy() {
        if (this._frame) cancelAnimationFrame(this._frame);
        if (this._resizeObserver) this._resizeObserver.disconnect();
        this.$el.style.removeProperty('top');
        this.dispose();
    },
}));
