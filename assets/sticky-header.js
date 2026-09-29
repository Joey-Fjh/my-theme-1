import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';

define('stickyHeader', () => ({
    ...useDisposable(),
    lastY: window.scrollY,
    isHidden: false,
    isTop: true,
    isMenuActive: false,

    init() {
        const headerMenuActiveEvent = ThemeEvents.events.HEADER_MENU_ACTIVE_CHANGED;

        this.on(window, 'scroll', this.onScroll.bind(this), false);

        if (headerMenuActiveEvent) {
            this.on(window, headerMenuActiveEvent, (event) => {
                this.isMenuActive = Boolean(event?.detail?.active);
            });
        }
    },

    onScroll() {
        requestAnimationFrame(() => {
            const y = window.scrollY;

            if (y < 10) {
                this.isTop = true;
                this.isHidden = false;
            } else if (y > this.lastY) {
                this.isTop = false;
                this.isHidden = true;
            } else if (y < this.lastY) {
                this.isTop = false;
                this.isHidden = false;
            }

            this.lastY = y <= 0 ? 0 : y;
        });
    },

    destroy() {
        this.dispose();
    },
}));
