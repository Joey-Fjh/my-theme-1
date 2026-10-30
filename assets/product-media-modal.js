import { define, store } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';

define('productMediaModal', () => ({
    ...useDisposable(),
    activeMediaId: null,
    dialogId: '',
    _rootEl: null,
    _dialogUnwatch: null,
    _eventScope: null,
    _modelViewerUIs: [],

    init() {
        this._rootEl = this.$el;
        this._eventScope = ThemeEvents.createScope();
        this.dialogId =
            this._rootEl?.dataset?.dialogId || this._rootEl?.dataset?.mediaModalId || '';
        this._eventScope.on(ThemeEvents.events.PRODUCT_MEDIA_MODAL_ACTIVATE, (e) => {
            const targetDialogId = e.detail?.dialogId;
            if (targetDialogId && this.dialogId && targetDialogId !== this.dialogId) {
                return;
            }
            if (e.detail?.mediaId) {
                this.setMedia(e.detail.mediaId);
            }
        });

        if (typeof this.$watch === 'function') {
            this._dialogUnwatch = this.$watch(
                () => store('dialog')?.isShown?.(this.dialogId),
                (isShown) => {
                    if (!isShown) this.stopMedia();
                },
            );
        }

        this._loadModelViewerUI();
    },

    isActiveMedia(el) {
        const id = Number(el?.dataset?.productMediaId);
        return Number.isFinite(id) && this.activeMediaId === id;
    },

    setMedia(mediaId) {
        const nextMediaId = Number(mediaId);
        if (!Number.isFinite(nextMediaId) || nextMediaId <= 0) return;

        this.stopMedia();
        this.activeMediaId = nextMediaId;
        this.$nextTick(() => this._mountExternalVideo(nextMediaId));
    },

    stopMedia() {
        if (!this._rootEl) return;

        this._rootEl.querySelectorAll('video').forEach((video) => {
            video.pause();
            try {
                video.currentTime = 0;
            } catch (_) {}
        });

        this._rootEl.querySelectorAll('[data-external-video-host]').forEach((host) => {
            while (host.firstChild) host.removeChild(host.firstChild);
        });

        this._modelViewerUIs.forEach(({ ui }) => ui?.pause?.());
        this._rootEl
            .querySelectorAll('model-viewer')
            .forEach((modelViewer) => modelViewer.pause?.());
        this.activeMediaId = null;
    },

    _mountExternalVideo(mediaId) {
        if (!this._rootEl || this.activeMediaId !== mediaId) return;

        const mediaRoot = this._rootEl.querySelector(
            '[data-product-media-id="' + CSS.escape(String(mediaId)) + '"]',
        );
        const template = mediaRoot?.querySelector('[data-external-video-template]');
        const host = mediaRoot?.querySelector('[data-external-video-host]');
        if (!template || !host) return;

        while (host.firstChild) host.removeChild(host.firstChild);
        host.appendChild(template.content.cloneNode(true));
    },

    _loadModelViewerUI() {
        const modelViewers = this._rootEl?.querySelectorAll('model-viewer');
        if (!modelViewers?.length) return;

        const styleId = 'shopify-model-viewer-ui-styles';
        if (!document.getElementById(styleId)) {
            const stylesheet = document.createElement('link');
            stylesheet.id = styleId;
            stylesheet.rel = 'stylesheet';
            stylesheet.href =
                'https://cdn.shopify.com/shopifycloud/model-viewer-ui/assets/v1.0/model-viewer-ui.css';
            document.head.appendChild(stylesheet);
        }

        const Shopify = window.Shopify;
        if (!Shopify?.loadFeatures) return;

        Shopify.loadFeatures([
            {
                name: 'model-viewer-ui',
                version: '1.0',
                onLoad: (errors) => {
                    if (errors || !this._rootEl?.isConnected) return;
                    const ModelViewerUI = window.Shopify?.ModelViewerUI;
                    if (!ModelViewerUI) return;

                    const initialized = new Set(this._modelViewerUIs.map(({ element }) => element));
                    this._rootEl.querySelectorAll('model-viewer').forEach((element) => {
                        if (initialized.has(element)) return;
                        this._modelViewerUIs.push({
                            element,
                            ui: new ModelViewerUI(element),
                        });
                    });
                },
            },
        ]);
    },

    destroy() {
        this.stopMedia();
        if (typeof this._dialogUnwatch === 'function') this._dialogUnwatch();
        this._dialogUnwatch = null;
        this._eventScope?.dispose?.();
        this._eventScope = null;
        this._modelViewerUIs.forEach(({ ui }) => ui?.destroy?.());
        this._modelViewerUIs = [];
        this._rootEl = null;
        this.dispose();
    },
}));
