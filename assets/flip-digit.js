import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';

define('flipDigit', () => ({
    ...useDisposable(),
    prev: '',
    current: '',
    oldDigit: '',
    flipping: false,
    _timeout: null,

    init() {
        const digit = this.$el?.dataset?.digit || '';
        this.prev = digit;
        this.current = digit;
        this.oldDigit = digit;
    },

    updateDigit(digit) {
        const next = String(digit ?? '');

        if (this.oldDigit === '' && this.current === '' && this.prev === '') {
            this.prev = next;
            this.current = next;
            this.oldDigit = next;
            return;
        }

        if (next === this.oldDigit) return;

        this.current = next;
        this.oldDigit = next;
        this.flipping = true;

        if (this._timeout) clearTimeout(this._timeout);

        this._timeout = setTimeout(() => {
            this.prev = this.current;
            this.flipping = false;
            this._timeout = null;
        }, 600);
    },

    destroy() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        this.dispose();
    },
}));
