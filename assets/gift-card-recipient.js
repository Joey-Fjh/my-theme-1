import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';

define('GiftCardRecipient', () => ({
    ...useDisposable(),
    jsReady: false,
    enabled: false,
    showErrorSummary: false,
    _copy: {
        expanded: '',
        collapsed: '',
        emailBlank: '',
        emailInvalid: '',
        nameTooLong: '',
        messageTooLong: '',
        sendOnInvalid: '',
        errorHeading: '',
    },
    _sendOnMin: '',
    _sendOnMax: '',

    init() {
        const dataset = this.$el?.dataset || {};
        this._copy.expanded = dataset.expandedText || '';
        this._copy.collapsed = dataset.collapsedText || '';
        this._copy.emailBlank = dataset.emailBlankText || '';
        this._copy.emailInvalid = dataset.emailInvalidText || '';
        this._copy.nameTooLong = dataset.nameTooLongText || '';
        this._copy.messageTooLong = dataset.messageTooLongText || '';
        this._copy.sendOnInvalid = dataset.sendOnInvalidText || '';
        this._copy.errorHeading = dataset.errorHeading || '';
        this._sendOnMin = dataset.sendOnMin || '';
        this._sendOnMax = dataset.sendOnMax || '';

        this.enabled = dataset.hasErrors === 'true';
        this.showErrorSummary = dataset.hasErrors === 'true';
        this.jsReady = true;

        if (this.$refs.offset) {
            this.$refs.offset.value = String(new Date().getTimezoneOffset());
        }

        this.$nextTick(() => {
            this._syncLiveRegion();
            this._applyDateBounds();
        });
    },

    onToggle() {
        if (!this.enabled) {
            this._clearInputValues();
            this.clearErrors();
        } else {
            this._applyDateBounds();
            if (this.$refs.offset) {
                this.$refs.offset.value = String(new Date().getTimezoneOffset());
            }
        }
        this._syncLiveRegion();
    },

    _syncLiveRegion() {
        if (!this.$refs.liveRegion) return;
        this.$refs.liveRegion.textContent = this.enabled
            ? this._copy.expanded
            : this._copy.collapsed;
    },

    _applyDateBounds() {
        const input = this.$refs.sendOn;
        if (!input) return;
        if (this._sendOnMin) input.min = this._sendOnMin;
        if (this._sendOnMax) input.max = this._sendOnMax;
    },

    _clearInputValues() {
        ['email', 'name', 'message', 'sendOn'].forEach((refName) => {
            const field = this.$refs[refName];
            if (field) field.value = '';
        });
    },

    _fieldMap() {
        return {
            email: this.$refs.email,
            name: this.$refs.name,
            message: this.$refs.message,
            send_on: this.$refs.sendOn,
        };
    },

    _errorNodeMap() {
        return {
            email: this.$refs.emailError,
            name: this.$refs.nameError,
            message: this.$refs.messageError,
            send_on: this.$refs.sendOnError,
        };
    },

    _isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },

    _normalizeErrorText(value) {
        if (Array.isArray(value)) {
            return value.filter(Boolean).join(', ');
        }
        if (typeof value === 'string') return value.trim();
        if (value == null) return '';
        return String(value);
    },

    clearErrors() {
        this.showErrorSummary = false;
        if (this.$refs.errorList) {
            this.$refs.errorList.replaceChildren();
        }
        if (this.$refs.errorHeading) {
            this.$refs.errorHeading.textContent = this._copy.errorHeading;
        }

        const fields = this._fieldMap();
        const errorNodes = this._errorNodeMap();
        Object.keys(fields).forEach((key) => {
            const field = fields[key];
            const errorNode = errorNodes[key];
            if (field) {
                field.removeAttribute('aria-invalid');
                if (errorNode?.id) {
                    const remaining = (field.getAttribute('aria-describedby') || '')
                        .split(/\s+/)
                        .filter(Boolean)
                        .filter((id) => id !== errorNode.id);
                    if (remaining.length) {
                        field.setAttribute('aria-describedby', remaining.join(' '));
                    } else {
                        field.removeAttribute('aria-describedby');
                    }
                }
            }
            if (errorNode) {
                errorNode.hidden = true;
                errorNode.textContent = '';
            }
        });
    },

    _setFieldError(key, message) {
        const field = this._fieldMap()[key];
        const errorNode = this._errorNodeMap()[key];
        if (!message) return;
        const text = message.endsWith('.') ? message : `${message}.`;

        if (errorNode) {
            errorNode.hidden = false;
            errorNode.textContent = text;
        }

        if (field && errorNode?.id) {
            field.setAttribute('aria-invalid', 'true');
            const describedBy = new Set(
                (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean),
            );
            describedBy.add(errorNode.id);
            field.setAttribute('aria-describedby', Array.from(describedBy).join(' '));
        }

        if (this.$refs.errorList) {
            const li = document.createElement('li');
            if (field?.id) {
                const link = document.createElement('a');
                link.href = `#${field.id}`;
                link.className = 'underline';
                link.textContent = text;
                li.appendChild(link);
            } else {
                li.textContent = text;
            }
            this.$refs.errorList.appendChild(li);
        }
    },

    displayErrors(errors, heading) {
        this.clearErrors();
        const headingText =
            typeof heading === 'string' && heading.trim()
                ? heading.trim()
                : this._copy.errorHeading;
        if (this.$refs.errorHeading) {
            this.$refs.errorHeading.textContent = headingText;
        }

        let hasFieldErrors = false;
        if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
            Object.entries(errors).forEach(([key, value]) => {
                const message = this._normalizeErrorText(value);
                if (!message) return;
                if (key === 'form') {
                    if (this.$refs.errorList) {
                        const li = document.createElement('li');
                        li.textContent = message;
                        this.$refs.errorList.appendChild(li);
                    }
                    hasFieldErrors = true;
                    return;
                }
                this._setFieldError(key, message);
                hasFieldErrors = true;
            });
        } else {
            const message = this._normalizeErrorText(errors);
            if (message && this.$refs.errorList) {
                const li = document.createElement('li');
                li.textContent = message;
                this.$refs.errorList.appendChild(li);
                hasFieldErrors = true;
            }
        }

        this.showErrorSummary = hasFieldErrors;
        if (hasFieldErrors) {
            this.$nextTick(() => {
                this.$refs.errorSummary?.focus?.();
            });
        }
    },

    displayCartErrors(err) {
        const data = err?.data && typeof err.data === 'object' ? err.data : null;
        if (!data) return;
        const errors = data.errors || data.description || data.message;
        const heading = typeof data.message === 'string' ? data.message : this._copy.errorHeading;
        this.displayErrors(errors, heading);
    },

    validate() {
        if (!this.enabled) {
            this.clearErrors();
            return true;
        }

        this.clearErrors();
        const email = (this.$refs.email?.value || '').trim();
        const name = (this.$refs.name?.value || '').trim();
        const message = this.$refs.message?.value || '';
        const sendOn = (this.$refs.sendOn?.value || '').trim();
        let valid = true;

        if (!email) {
            this._setFieldError('email', this._copy.emailBlank);
            valid = false;
        } else if (!this._isValidEmail(email)) {
            this._setFieldError('email', this._copy.emailInvalid);
            valid = false;
        }

        if (name.length > 255) {
            this._setFieldError('name', this._copy.nameTooLong);
            valid = false;
        }

        if (message.length > 200) {
            this._setFieldError('message', this._copy.messageTooLong);
            valid = false;
        }

        if (sendOn) {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            if (
                !datePattern.test(sendOn) ||
                (this._sendOnMin && sendOn < this._sendOnMin) ||
                (this._sendOnMax && sendOn > this._sendOnMax)
            ) {
                this._setFieldError('send_on', this._copy.sendOnInvalid);
                valid = false;
            }
        }

        this.showErrorSummary = !valid;
        if (!valid) {
            this.$nextTick(() => {
                const firstInvalid =
                    this.$el?.querySelector?.('[aria-invalid="true"]') || this.$refs.errorSummary;
                firstInvalid?.focus?.();
            });
        }
        return valid;
    },

    resetAfterSuccess() {
        if (!this.enabled) return;
        this.enabled = false;
        this._clearInputValues();
        this.clearErrors();
        this._syncLiveRegion();
    },

    destroy() {
        this.dispose();
    },
}));
