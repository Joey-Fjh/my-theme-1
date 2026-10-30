import { define } from 'alpine-adapter';

define('videoBannerExternal', () => ({
    playing: false,

    startPlay() {
        this.playing = true;
        // The play button leaves with its layer; keep keyboard focus on the player.
        this.$nextTick(() => this.$root.querySelector('iframe')?.focus());
    },
}));
