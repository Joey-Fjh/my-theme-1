import { define } from 'alpine-adapter';
import Utils from 'utils';

define('backToTop', () => ({
    scrollToTop() {
        const behavior = Utils.prefersReducedMotion() ? 'auto' : 'smooth';
        window.scrollTo({ top: 0, behavior });

        const focusTarget =
            document.getElementById('MainContent') || document.querySelector('main');

        if (!focusTarget || typeof focusTarget.focus !== 'function') return;

        if (!focusTarget.hasAttribute('tabindex')) {
            focusTarget.setAttribute('tabindex', '-1');
        }

        focusTarget.focus({ preventScroll: true });
    },
}));
