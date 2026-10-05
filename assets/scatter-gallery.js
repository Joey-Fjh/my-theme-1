import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import { loadGsap } from 'motion-gsap';

function preloadRootMargin() {
    const vh = window.innerHeight || 900;
    return `${Math.round(vh)}px`;
}

function motionDisabled() {
    return document.body?.dataset?.motionEnabled === 'false';
}

function readUrls(root) {
    return {
        gsapUrl: root?.dataset?.gsapSrc || '',
        scrollTriggerUrl: root?.dataset?.scrolltriggerSrc || '',
    };
}

function readMotionFactors(root, mobile) {
    if (mobile) {
        return {
            gather: parseFloat(root?.dataset?.gatherFactorMobile || '0.88'),
            spread: parseFloat(root?.dataset?.spreadFactorMobile || '0.16'),
        };
    }
    return {
        gather: parseFloat(root?.dataset?.gatherFactor || '1.08'),
        spread: parseFloat(root?.dataset?.spreadFactor || '0.24'),
    };
}

/** Vector from slot center toward stage center, scaled by factor (negative = outward). */
function slotMotionOffset(slotEl, stageEl, factor) {
    const stageRect = stageEl.getBoundingClientRect();
    const slotRect = slotEl.getBoundingClientRect();
    const stageCx = stageRect.left + stageRect.width / 2;
    const stageCy = stageRect.top + stageRect.height / 2;
    const slotCx = slotRect.left + slotRect.width / 2;
    const slotCy = slotRect.top + slotRect.height / 2;
    return {
        x: (stageCx - slotCx) * factor,
        y: (stageCy - slotCy) * factor,
    };
}

define('scatterGallery', () => ({
    ...useDisposable(),
    _root: null,
    _preloadObserver: null,
    _gsapContext: null,
    _mm: null,

    init() {
        this._root = this.$el;
        if (motionDisabled()) return;

        this._preloadObserver = new IntersectionObserver(
            (entries) => {
                if (!entries.some((entry) => entry.isIntersecting)) return;
                this._preloadObserver?.disconnect();
                this._preloadObserver = null;
                void this._setupMotion();
            },
            { root: null, rootMargin: preloadRootMargin(), threshold: 0 },
        );
        this._preloadObserver.observe(this._root);
    },

    async _setupMotion() {
        if (!this._root || motionDisabled()) return;

        const { gsapUrl, scrollTriggerUrl } = readUrls(this._root);
        if (!gsapUrl || !scrollTriggerUrl) return;

        let gsap;
        let ScrollTrigger;
        try {
            ({ gsap, ScrollTrigger } = await loadGsap(gsapUrl, scrollTriggerUrl));
        } catch (_) {
            return;
        }

        if (!this._root) return;

        const stage = this._root.querySelector('.scatter-gallery__stage');
        if (!stage) return;

        this._gsapContext = gsap.context(() => {
            this._mm = gsap.matchMedia();

            this._mm.add('(prefers-reduced-motion: reduce)', () => {});

            this._mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => {
                const { gather, spread } = readMotionFactors(this._root, false);
                this._createMotionTimeline(gsap, ScrollTrigger, stage, gather, spread);
            });

            this._mm.add('(prefers-reduced-motion: no-preference) and (max-width: 767px)', () => {
                const { gather, spread } = readMotionFactors(this._root, true);
                this._createMotionTimeline(gsap, ScrollTrigger, stage, gather, spread);
            });
        }, this._root);

        ScrollTrigger.refresh();
    },

    _createMotionTimeline(gsap, ScrollTrigger, stage, gatherFactor, spreadFactor) {
        const items = [...stage.querySelectorAll('[data-scatter-gallery-item]')];
        if (!items.length) return;

        const gathered = items.map((item) => slotMotionOffset(item, stage, gatherFactor));
        const spread = items.map((item) => slotMotionOffset(item, stage, -spreadFactor));

        const enterDuration = 0.36;
        const spreadStart = 0.68;
        const spreadDuration = 1 - spreadStart;

        return gsap
            .timeline({
                scrollTrigger: {
                    trigger: stage,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.85,
                    invalidateOnRefresh: true,
                },
                defaults: { ease: 'none' },
            })
            .fromTo(
                items,
                {
                    x: (index) => gathered[index]?.x ?? 0,
                    y: (index) => gathered[index]?.y ?? 0,
                },
                {
                    x: 0,
                    y: 0,
                    duration: enterDuration,
                    immediateRender: true,
                },
                0,
            )
            .to(
                items,
                {
                    x: (index) => spread[index]?.x ?? 0,
                    y: (index) => spread[index]?.y ?? 0,
                    duration: spreadDuration,
                },
                spreadStart,
            );
    },

    destroy() {
        this._preloadObserver?.disconnect();
        this._preloadObserver = null;
        this._mm?.revert();
        this._mm = null;
        this._gsapContext?.revert();
        this._gsapContext = null;
        this._root = null;
        this.dispose();
    },
}));
