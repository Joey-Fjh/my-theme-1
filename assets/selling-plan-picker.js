import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';

define('SellingPlanPicker', () => ({
    ...useDisposable(),
    sectionId: '',
    variantId: null,
    requiresSellingPlan: false,
    variants: {},
    groups: [],
    availablePlans: [],
    selectedPlanId: '',
    oneTimeLabel: '',
    purchaseOptionsLabel: '',
    _eventScope: null,

    init() {
        const dataset = this.$el?.dataset || {};
        this.sectionId = dataset.sectionId || '';
        this.variantId = Number(dataset.variantId) || null;
        this.oneTimeLabel = dataset.oneTimeLabel || '';
        this.purchaseOptionsLabel = dataset.purchaseOptionsLabel || '';

        let payload = {};
        try {
            payload = dataset.sellingPlans ? JSON.parse(dataset.sellingPlans) : {};
        } catch (_) {
            payload = {};
        }

        this.requiresSellingPlan = Boolean(payload.requiresSellingPlan);
        this.variants =
            payload.variants && typeof payload.variants === 'object' ? payload.variants : {};
        this.groups = Array.isArray(payload.groups) ? payload.groups : [];

        const events = ThemeEvents.events;
        this._eventScope = ThemeEvents.createScope();

        const onVariantChange = (e) => {
            if (e.detail?.sectionId !== this.sectionId) return;
            this.variantId = e.detail?.variant?.id || null;
            this._syncPlansForVariant({ preferCurrent: false });
        };

        this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);
        this._syncPlansForVariant({ preferCurrent: true });
    },

    optionInputId(planId) {
        const sid = this.sectionId || '';
        if (planId === '' || planId == null) {
            return `selling-plan-option-${sid}-one-time`;
        }
        return `selling-plan-option-${sid}-${planId}`;
    },

    groupName(groupId) {
        const group = this.groups.find((item) => String(item.id) === String(groupId));
        return group?.name || '';
    },

    selectOneTime() {
        this.selectedPlanId = '';
        this._emitPlanChange(null);
    },

    selectPlan(planId) {
        this.selectedPlanId = planId == null ? '' : String(planId);
        const plan = this.availablePlans.find(
            (item) => String(item.id) === String(this.selectedPlanId),
        );
        this._emitPlanChange(plan || null);
    },

    _plansForVariant(variantId) {
        if (variantId == null || variantId === '') return [];
        const plans = this.variants[String(variantId)];
        return Array.isArray(plans) ? plans : [];
    },

    _syncPlansForVariant({ preferCurrent = false } = {}) {
        this.availablePlans = this._plansForVariant(this.variantId);

        if (this.availablePlans.length === 0) {
            this.selectedPlanId = '';
            this._emitPlanChange(null);
            return;
        }

        const currentStillValid =
            preferCurrent &&
            this.selectedPlanId !== '' &&
            this.availablePlans.some(
                (plan) => String(plan.id) === String(this.selectedPlanId),
            );

        if (currentStillValid) {
            this.selectPlan(this.selectedPlanId);
            return;
        }

        if (this.requiresSellingPlan) {
            this.selectPlan(this.availablePlans[0].id);
            return;
        }

        this.selectOneTime();
    },

    _emitPlanChange(plan) {
        ThemeEvents.emit(ThemeEvents.events.PRODUCT_SELLING_PLAN_CHANGED, {
            sectionId: this.sectionId,
            active: Boolean(plan),
            sellingPlanId: plan?.id || null,
            price: plan?.price,
            compareAtPrice: plan?.compareAtPrice,
        });
    },

    destroy() {
        this._eventScope?.dispose?.();
        this._eventScope = null;
        this.dispose();
    },
}));
