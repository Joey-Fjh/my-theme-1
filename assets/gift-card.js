(() => {
    const qrRoot = document.querySelector('[data-gift-card-qr]');
    const identifier = qrRoot?.dataset.identifier;

    if (qrRoot && identifier && typeof window.QRCode === 'function') {
        new window.QRCode(qrRoot, {
            text: identifier,
            width: 144,
            height: 144,
        });
    }

    const copyButton = document.querySelector('[data-gift-card-copy]');
    const copyStatus = document.querySelector('[data-gift-card-copy-status]');

    if (!copyButton) return;
    if (!navigator.clipboard) {
        copyButton.hidden = true;
        return;
    }

    copyButton.addEventListener('click', async () => {
        const code = copyButton.dataset.code;
        if (!code) return;

        try {
            await navigator.clipboard.writeText(code);
            if (copyStatus) copyStatus.textContent = copyButton.dataset.successMessage || '';
        } catch {
            const codeElement = document.querySelector('[data-gift-card-code]');
            if (codeElement) window.getSelection()?.selectAllChildren(codeElement);
        }
    });
})();
