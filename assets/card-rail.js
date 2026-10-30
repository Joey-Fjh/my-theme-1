import { Utils } from 'utils';

const IO_THRESHOLDS = [0.35, 0.55, 0.75];

function motionAllowed() {
    if (document.body?.dataset?.motionEnabled === 'false') return false;
    if (Utils.prefersReducedMotion()) return false;
    return true;
}

function scrollBehavior() {
    return motionAllowed() ? 'smooth' : 'instant';
}

/**
 * @param {object} options
 * @param {HTMLElement} options.root
 * @param {HTMLElement} options.rail
 * @param {NodeListOf<HTMLElement>|HTMLElement[]} options.cards
 * @param {(index: number) => void} options.onActiveIndex
 * @param {(el: HTMLElement) => number} [options.getIndexFromCard]
 */
export function bindCardRail({
    root,
    rail,
    cards,
    onActiveIndex,
    getIndexFromCard = (el) => Number(el.dataset.cardRailIndex ?? el.dataset.stepIndex),
}) {
    const cardList = [...cards];
    if (!rail || !cardList.length) {
        return { disconnect: () => {}, scrollToIndex: () => {} };
    }

    const ratioByCard = new Map();

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                ratioByCard.set(entry.target, entry.intersectionRatio);
            });

            let bestCard = null;
            let bestRatio = -1;
            cardList.forEach((card) => {
                const ratio = ratioByCard.get(card) ?? 0;
                if (ratio > bestRatio) {
                    bestRatio = ratio;
                    bestCard = card;
                }
            });

            if (bestCard && bestRatio > 0) {
                const index = getIndexFromCard(bestCard);
                if (Number.isFinite(index)) onActiveIndex(index);
            }
        },
        { root: rail, threshold: IO_THRESHOLDS },
    );

    cardList.forEach((card) => observer.observe(card));

    const scrollToIndex = (index) => {
        const card = cardList.find((el) => getIndexFromCard(el) === index);
        if (!card) return;
        const slot = card.closest('.card-rail__slot') || card;
        const targetLeft = slot.offsetLeft - (rail.clientWidth - slot.offsetWidth) / 2;
        rail.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: scrollBehavior(),
        });
        onActiveIndex(index);
    };

    const disconnect = () => {
        observer.disconnect();
    };

    return { disconnect, scrollToIndex };
}
