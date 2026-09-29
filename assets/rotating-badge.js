import { define } from 'alpine-adapter';

define('rotatingBadge', () => ({
    inView: false,

    onIntersect() {
        this.inView = true;
    },
}));
