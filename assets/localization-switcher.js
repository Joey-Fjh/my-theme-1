import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';

define('localizationSwitcher', () => ({
    ...useDisposable(),
    open: false,
    alignEnd: false,
    _viewportGap: 8,
    _fitRetries: 0,
    _maxFitRetries: 8,

    init() {
        this.on(window, 'resize', () => {
            if (this.open) this.fitMenuToViewport();
        });
    },

    toggle() {
        if (this.open) {
            this.close();
            return;
        }

        this._fitRetries = 0;
        this.alignEnd = this.shouldPreferAlignEnd();
        this.open = true;
        this.scheduleFitMenuToViewport();
    },

    close() {
        this.open = false;
        this.alignEnd = false;
        this._fitRetries = 0;
    },

    onEscape() {
        if (!this.open) return;
        this.close();
        this.$nextTick(() => this.$refs.localizationTrigger?.focus());
    },

    shouldPreferAlignEnd() {
        const trigger = this.$refs.localizationTrigger;
        if (!trigger) return false;

        const triggerRect = trigger.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth || 0;
        return triggerRect.left > viewportWidth * 0.5;
    },

    scheduleFitMenuToViewport() {
        this.$nextTick(() => {
            requestAnimationFrame(() => this.fitMenuToViewport());
        });
    },

    fitMenuToViewport() {
        const menu = this.$refs.localizationMenu;
        const trigger = this.$refs.localizationTrigger;
        if (!menu || !trigger || !this.open) return;

        const menuWidth = menu.offsetWidth || menu.getBoundingClientRect().width;
        if (menuWidth <= 0) {
            if (this._fitRetries >= this._maxFitRetries) return;
            this._fitRetries += 1;
            this.scheduleFitMenuToViewport();
            return;
        }

        this._fitRetries = 0;

        const triggerRect = trigger.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth || 0;
        const gap = this._viewportGap;
        const startRight = triggerRect.left + menuWidth;
        const endLeft = triggerRect.right - menuWidth;

        if (startRight <= viewportWidth - gap) {
            this.alignEnd = false;
            return;
        }

        if (endLeft >= gap) {
            this.alignEnd = true;
            return;
        }

        this.alignEnd = this.shouldPreferAlignEnd();
    },

    destroy() {
        this.dispose();
    },
}));
