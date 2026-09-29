import { define } from 'alpine-adapter';

define('aboutStatsImages', () => ({
    activeImage: 'primary',

    showPrimary() {
        this.activeImage = 'primary';
    },

    showSecondary() {
        this.activeImage = 'secondary';
    },

    isPrimaryActive() {
        return this.activeImage === 'primary';
    },

    isSecondaryActive() {
        return this.activeImage === 'secondary';
    },
}));
