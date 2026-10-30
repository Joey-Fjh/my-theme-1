import { define, store } from 'alpine-adapter';

// Every customer form on a page shares one server response: Liquid renders the status in each
// of them. Only the hash names the form that posted (its action is `/contact#<form id>`).
export function ownsNewsletterReturn(formId) {
    return Boolean(formId) && window.location.hash === `#${formId}`;
}

// Hide the server-rendered status of a form that did not post, and clear its field's error state.
export function hideForeignNewsletterStatus(root) {
    const form = root?.querySelector('form');
    if (!form || ownsNewsletterReturn(form.id)) return;
    root.querySelectorAll('[data-newsletter-status]').forEach((status) => {
        status.hidden = true;
    });
    const email = form.querySelector('input[type="email"]');
    email?.removeAttribute('aria-invalid');
    email?.removeAttribute('aria-describedby');
}

export function toastNewsletterPostedSuccess(successMessage, formId) {
    if (!successMessage || !ownsNewsletterReturn(formId)) return false;
    try {
        const url = new URL(window.location.href);
        if (url.searchParams.get('customer_posted') !== 'true') return false;
        store('toast')?.show?.(successMessage, 'success');
        url.searchParams.delete('customer_posted');

        const formHash = url.hash;
        window.history.replaceState({}, '', `${url.pathname}${url.search}`);
        if (formHash && formHash.length > 1) {
            window.location.hash = formHash;
        }
        return true;
    } catch (_) {
        return false;
    }
}

define('newsletterBanner', () => ({
    init() {
        hideForeignNewsletterStatus(this.$root);
    },
}));
