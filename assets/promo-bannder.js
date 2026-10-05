import { define } from 'alpine-adapter';
import { useDisposable, Utils } from 'utils';

const MOTION_CLASS = 'promo-bannder--motion';
const PANEL_SELECTOR = '[data-promo-bannder-panel]';

function motionEnabled() {
    return document.body?.dataset?.motionEnabled !== 'false';
}

define('promoBannder', () => ({
    ...useDisposable(),
    _root: null,
    _panelObserver: null,

    init() {
        this._root = this.$el;
        if (!motionEnabled() || Utils.prefersReducedMotion()) return;

        this._root.classList.add(MOTION_CLASS);

        const panels = this._root.querySelectorAll(PANEL_SELECTOR);
        if (!panels.length) return;

        this._panelObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle('is-in-view', entry.isIntersecting);
                });
            },
            { threshold: 0.5 },
        );

        panels.forEach((panel) => {
            this._panelObserver.observe(panel);
        });
    },

    destroy() {
        this._panelObserver?.disconnect();
        this._panelObserver = null;
        this._root?.classList.remove(MOTION_CLASS);
        this._root
            ?.querySelectorAll(PANEL_SELECTOR)
            .forEach((panel) => panel.classList.remove('is-in-view'));
        this._root = null;
        this.dispose();
    },
}));
