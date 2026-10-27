import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import 'flip-digit';

define('countdownTimer', () => ({
    ...useDisposable(),
    endTime: 0,
    interval: null,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,

    getValue(key) {
        const val = this[key] ?? 0;
        return val.toString().padStart(2, '0');
    },

    init() {
        // Liquid renders the end date as epoch seconds in the store's time zone.
        const seconds = Number(this.$el?.dataset?.countdownEnd);
        if (!Number.isFinite(seconds) || seconds <= 0) return;
        this.endTime = seconds * 1000;
        this.calculateTime();
        this.interval = setInterval(() => {
            this.calculateTime();
        }, 1000);
    },

    calculateTime() {
        const distance = this.endTime - Date.now();

        if (distance <= 0) {
            this.reset();
            this.clear();
            return;
        }

        this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
        this.hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        this.minutes = Math.floor((distance / (1000 * 60)) % 60);
        this.seconds = Math.floor((distance / 1000) % 60);
    },

    reset() {
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
    },

    clear() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    destroy() {
        this.clear();
        this.dispose();
    },
}));
