import { define } from 'alpine-adapter';

define('hoverCard', () => ({
    hover: false,

    enter() {
        this.hover = true;
    },

    leave() {
        this.hover = false;
    },

    hoverClass() {
        return { 'is-hovered': this.hover };
    },

    overlayVisibleClass() {
        return this.hover ? 'opacity-100 scale-100' : '';
    },
}));
