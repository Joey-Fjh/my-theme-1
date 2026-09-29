import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import 'flip-digit';

define('countdownTimer', (endDate = null) => ({
    ...useDisposable(),
    endDate: endDate || null,
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
        if (!this.endDate) {
            this.endDate = this.$el?.dataset?.countdownEndDate || null;
        }
        if (!this.endDate) return;
        this.calculateTime();
        this.interval = setInterval(() => {
            this.calculateTime();
        }, 1000);
    },

    calculateTime() {
        const end = new Date(this.endDate).getTime();
        const now = Date.now();
        const distance = end - now;

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
