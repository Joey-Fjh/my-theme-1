import { define } from 'alpine-adapter';

define('videoBannerExternal', () => ({
    playing: false,

    startPlay() {
        this.playing = true;
    },
}));
