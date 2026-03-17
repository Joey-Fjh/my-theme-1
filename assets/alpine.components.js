(function() {
'use strict';

class AlpineComponentsFactory {
    static #alpine;
    static #registeredNames = new Set();

    static init(alpine){
        this.#alpine = alpine;
    }

    static register(name,cb){
        if (!this.#alpine) throw new Error('AlpineComponentsFactory not initialized');
        if (typeof name !== 'string' || !name.trim()) throw new Error('Component name must be a non-empty string');

        name = name.trim();

        if (this.#registeredNames.has(name)) {
            console.warn(`Component "${name}" already registered, skipping`);
            return;
        }
        
        const enhancedCb = function(...args) {
            const componentDefinition = cb.apply(this, args);

            if (typeof componentDefinition.dispose !== 'function') {
                return componentDefinition;
            }

            const originalInit = componentDefinition.init;

            componentDefinition.init = function() {
                if (this.$el && typeof this.on === 'function' && typeof this.destroy === 'function') {
                    this.on(this.$el, 'unmount', this.destroy.bind(this));
                }

                if (originalInit) {
                    originalInit.apply(this, arguments);
                }
            };

            return componentDefinition;
        };

        this.#alpine.data(name, enhancedCb);
        this.#registeredNames.add(name);
    }

    static useDisposable(){
        const disposers = [];

        return {
            on(target,event,handler,options){
                if (!target || typeof target.addEventListener !== 'function') return;
                target.addEventListener(event,handler,options);
                disposers.push(()=>target.removeEventListener(event, handler, options));
            },

            observe(observer,el){
                if (!el || !observer?.observe) return;

                observer.observe(el);
                disposers.push(()=>observer.unobserve(el));
            },

            dispose(){
                disposers.forEach(disposer=>disposer());
                disposers.length = 0;
            }
        };
    }
}

class AlpineComponents {
    static DROPDOWN = 'dropdown';
    static STICKY_HEADER = 'stickyHeader';
    static TABCONTROL = 'tabControl';
    static BEFOREAFTERCOMPARISON = 'beforeAfterComparison';
    static COUNTDOWNTIMER = 'countdownTimer';
    static SECTIONPAGINATION = 'sectionPagination';
    static COLLECTIONFILTERS = 'collectionFilters';
    static PRODUCTGALLERY = 'productGallery';
    static PRODUCTPRICE = 'ProductPrice';
    static VARIANTPICKER = 'VariantPicker';
    static QUANTITYSELECTOR = 'QuantitySelector';
    static BUYBUTTONS = 'BuyButtons';
    static PREDICTIVESEARCH = 'predictiveSearch';

    static dropdown(){
        return {
            openEls: [],
            
            toggle(target) {
                const current = target.closest('[data-dropdown]');
                
                if(!current) return;
                
                const deep = Number(current.dataset.deep);
                
                if(this.openEls[deep] === current){
                    this.close(deep);
                    return;
                }
                
                this.close(deep);
                
                current.setAttribute('open','');
                this.openEls[deep] = current;
            },
            
            close(from = 0) {
                for(let i = from;i < this.openEls.length; i++){
                    const el = this.openEls[i];
                    
                    if(el){
                        el.removeAttribute('open');
                    }
                }
                
                this.openEls.length = from;
            }
        };
    }

    static stickyHeader(){
		return {
			...AlpineComponentsFactory.useDisposable(),
			lastY: window.scrollY,
			isHidden: false,
			isTop: true,
			
			init() {
				this.on(window, 'scroll', this.onScroll.bind(this),false);
			},
			
			onScroll(){
				requestAnimationFrame(()=>{
					const y = window.scrollY;
					
					if( y < 10 ){
						// Top
						this.isTop = true;
						this.isHidden = false;
					}
					else if( y > this.lastY ){
						// Scroll Down
						this.isTop = false;
						this.isHidden = true;
					}else if(y < this.lastY){
						// Scroll Up
						this.isTop = false;
						this.isHidden = false;
					}
					
					this.lastY = y <= 0 ? 0 : y;
				});
			},

            destroy() {
                this.dispose();
            }
		};
	}

    static tabControl(initialStrategy = 'first'){
        return {
            tabs: [],
            panels: [],
            activeIndex: 0,
            
            init() {
                this.$nextTick(() => {
                    const count = this.tabs.length;
                    if (count === 0) return;

                    this.activeIndex = initialStrategy === 'first' ? 0 : Math.floor(count / 2);
                });
            },

            registerTab(tab) {
                this.tabs.push(tab);
                return this.tabs.length - 1;
            },

            registerPanel(panel) {
                this.panels.push(panel);
                return this.panels.length - 1;
            },

            setActive(index) {
                if (index < 0 || index >= this.tabs.length) return;
                this.activeIndex = index;
            },

            isActive(index) {
                return this.activeIndex === index;
            },

            next() {
                this.setActive((this.activeIndex + 1) % this.tabs.length);
            },

            prev() {
                this.setActive(
                    (this.activeIndex - 1 + this.tabs.length) % this.tabs.length
                );
            }
        };
    }

    static beforeAfterComparison(){
        return {
            ...AlpineComponentsFactory.useDisposable(),
            position: 0,
            isDragging: false,
            
            init() {
                this.on(document,'mouseup',() => this.endDrag());
                this.on(document,'touchend',() => this.endDrag());
                this.on(document,'mousemove',(e) => {
                    if(this.isDragging) this.updatePosition(e);
                });
                this.on(document,'touchmove',(e) => { 
                    if(this.isDragging) this.updatePosition(e);
                },{ passive:true });
            },

            animateToCenter(){
                const start = 0;
                const end = 50;
                const duration = 800;
                const startTime = performance.now();

                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    this.position = start + (end - start) * easeOut;

                    if(progress < 1){
                        requestAnimationFrame(animate);
                    }
                };

                requestAnimationFrame(animate);
            },

            startDrag(e){
                this.isDragging = true;
                this.updatePosition(e);
            },

            onDrag(e){
                if(!this.isDragging) return;
                this.updatePosition(e);
            },

            endDrag(){ 
                this.isDragging = false;
            },

            updatePosition(e){
                const container = this.$refs?.container;
                if (!container) return;

                const rect = container.getBoundingClientRect();
                if (!rect || rect.width <= 0) return;

                const clientX = e.type.includes('touch')
                    ? (e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX)
                    : e.clientX;

                if (clientX == undefined) return;

                const x = clientX - rect.left;
                const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                
                this.position = percentage;
            },

            destroy(){
                this.dispose();
            }
        };
    }

    static countdownTimer(endDate){
        return {
            ...AlpineComponentsFactory.useDisposable(),
            endDate,
            interval: null,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,    

            getValue(key) {
                return this[key]?.toString() || '0';
            },

            init(){
                this.calculateTime();
                this.interval = setInterval(() => {
                    this.calculateTime();
                }, 1000);    
            },

            calculateTime(){
                const end = new Date(this.endDate).getTime();
                const now = Date.now();
                const distance = end - now;

                if(distance <= 0){
                    this.reset();
                    this.clear();
                    return;
                }

                this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
                this.hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
                this.minutes = Math.floor((distance / (1000 * 60)) % 60);
                this.seconds = Math.floor((distance / 1000) % 60);
            },

            reset(){
                this.days = 0;
                this.hours = 0;
                this.minutes = 0;
                this.seconds = 0;
            },

            clear(){
                if(this.interval){
                    clearInterval(this.interval);
                    this.interval = null;
                }
            },

            destroy(){
                this.clear();
                this.dispose();
            }
        };
    }

    /**
     * Business glue layer: partial refresh for list pages (blog, collections, etc.).
     *
     * Concurrency safety (triple guard):
     *   1. debounce 200ms — rapid tab switching only fires the last click
     *   2. AbortController — aborts in-flight request when a new one is issued post-debounce
     *   3. activeController reference guard — prevents a stale finally block from clearing new request state
     *
     * @param {string|string[]} sectionId  - Single ID or array for multi-section refresh
     * @param {string[]|Object<string,string[]>|null} [selectors=null] - Shared selectors or per-section map
     */
    static sectionPagination(sectionId, selectors = null) {
        return {
            ...(window.__Theme__?.AlpineComponentsFactory?.useDisposable?.() || {}),
            isLoading: false,
            sectionId: sectionId || null,
            /** @type {string[]|Object<string,string[]>} per-section map or shared array */
            selectors: (!Array.isArray(selectors) && selectors && typeof selectors === 'object')
                ? selectors
                : Array.isArray(selectors) ? selectors : (selectors ? [selectors] : []),
            abortController: null,
            /** @type {Function|null} debounced wrapper, created in init */
            _debouncedFetch: null,

            init() {
                if (!this.sectionId) return;

                if (!window.history.state || !window.history.state.path) {
                    window.history.replaceState(
                        { path: window.location.href },
                        '',
                        window.location.href
                    );
                }

                const Utils = window.__Theme__?.Utils;
                if (Utils) {
                    this._debouncedFetch = Utils.debounce(
                        (url) => this._executeFetch(url, true),
                        200
                    );
                }
                if (this.on) {
                    this.on(window, 'popstate', this.handlePopState.bind(this));
                }
            },

            buildDomMap() {
                const ids = Array.isArray(this.sectionId) ? this.sectionId : [this.sectionId];
                const perSection = !Array.isArray(this.selectors) && this.selectors && typeof this.selectors === 'object';
                const map = {};
                for (const id of ids) {
                    const config = { targetSelector: `#shopify-section-${id}` };
                    const sels = perSection ? this.selectors[id] : this.selectors;
                    if (Array.isArray(sels) && sels.length > 0) {
                        config.innerSelectors = sels;
                    }
                    map[id] = config;
                }
                return map;
            },

            /**
             * Core Fetch → Render → Push pipeline.
             * Called via debounce wrapper (loadUrl) or directly (popstate).
             * @param {string} url
             * @param {boolean} updateHistory
             */
            _executeFetch(url, updateHistory) {
                const ThemeRequest = window.__Theme__?.ThemeRequest;
                const SectionRefresher = window.__Theme__?.SectionRefresher;
                if (!ThemeRequest || !SectionRefresher) return;

                if (this.abortController) this.abortController.abort();
                this.abortController = new AbortController();
                const activeController = this.abortController;

                const ids = Array.isArray(this.sectionId) ? this.sectionId : [this.sectionId];
                const sep = url.includes('?') ? '&' : '?';
                const fetchUrl = url + sep + 'sections=' + ids.map(encodeURIComponent).join(',');

                ThemeRequest.getJSON(fetchUrl, { signal: activeController.signal })
                    .then((data) => {
                        const sections = data?.sections ?? data;
                        if (!sections || typeof sections !== 'object') return;

                        SectionRefresher.render(sections, this.buildDomMap());

                        if (updateHistory) {
                            window.history.pushState({ path: url }, '', url);
                        }
                        if (typeof window.ScrollTrigger !== 'undefined') {
                            requestAnimationFrame(() => window.ScrollTrigger.refresh());
                        }
                    })
                    .catch((err) => {
                        if (err?.name === 'AbortError') return;
                        if (updateHistory) window.location.href = url;
                    })
                    .finally(() => {
                        if (this.abortController === activeController) {
                            this.isLoading = false;
                            this.abortController = null;
                        }
                    });
            },

            /**
             * Public entry point: show loading immediately, debounce 200ms before fetching.
             * Accepts every call without blocking — debounce absorbs intermediate invocations.
             */
            loadUrl(url) {
                if (!url || !this.sectionId) return;
                this.isLoading = true;
                if (this._debouncedFetch) {
                    this._debouncedFetch(url);
                } else {
                    this._executeFetch(url, true);
                }
            },

            /**
             * Browser back/forward: cancel pending debounce and fetch immediately.
             * Fallback: uses current href when state is empty, ensuring the initial page is refreshed on return.
             */
            handlePopState(event) {
                const path = event.state?.path || window.location.href;
                if (!path || !this.sectionId) return;
                if (this._debouncedFetch?.dispose) this._debouncedFetch.dispose();
                this.isLoading = true;
                this._executeFetch(path, false);
            },

            /**
             * Compare current URL against a target href (pathname + query params).
             * Trailing-slash insensitive, case insensitive, query-param order insensitive.
             * @param {string} targetHref
             * @returns {boolean}
             */
            isUrlMatch(targetHref) {
                const current = new URL(window.location.href);
                const target = new URL(targetHref, window.location.origin);
                const normalizePath = (p) => p.replace(/\/$/, '').toLowerCase();
                if (normalizePath(current.pathname) !== normalizePath(target.pathname)) return false;
                const sortParams = (sp) => new URLSearchParams([...sp].sort()).toString();
                return sortParams(current.searchParams) === sortParams(target.searchParams);
            },

            destroy() {
                if (this._debouncedFetch?.dispose) this._debouncedFetch.dispose();
                if (this.abortController) this.abortController.abort();
                if (this.dispose) this.dispose();
            }
        };
    }

    /**
     * Thin orchestration layer for Collection filter / sort / paginate.
     * Inherits the full SRA pipeline from sectionPagination (debounce, abort, history, render).
     * Only adds URL-assembly + event interception; zero fetch / DOMParser code.
     *
     * @param {string} sectionId
     * @param {string[]|null} selectors - innerSelectors forwarded to SectionRefresher
     */
    static collectionFilters(sectionId, selectors = null) {
        return {
            ...AlpineComponents.sectionPagination(sectionId, selectors),

            _buildUrl(params) {
                const qs = params.toString();
                return qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
            },

            _getFormParams() {
                const form = document.getElementById('CollectionFiltersForm');
                return form
                    ? new URLSearchParams(new FormData(form))
                    : new URLSearchParams(window.location.search);
            },

            onChange() {
                const params = this._getFormParams();
                params.delete('page');
                this.loadUrl(this._buildUrl(params));
            },

            onPaginate(e) {
                const link = e.target.closest('a');
                if (!link) return;
                e.preventDefault();
                const page = new URL(link.href).searchParams.get('page');
                const params = this._getFormParams();
                if (page) params.set('page', page);
                else params.delete('page');
                this.loadUrl(this._buildUrl(params));
            }
        };
    }

    /**
     * Reactive product price display — listens for variant:change and updates
     * the visible price / compare-at-price using Intl.NumberFormat.
     *
     * @param {Object}  opts
     * @param {string}  opts.sectionId
     * @param {number}  [opts.price=0]          - Initial price in minor units (cents)
     * @param {number}  [opts.comparePrice=0]   - Initial compare-at price in minor units
     * @param {string}  [opts.currency='USD']   - ISO 4217 currency code
     */
    static ProductPrice({ sectionId, price = 0, comparePrice = 0, currency = 'USD' } = {}) {
        const fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency });

        return {
            ...AlpineComponentsFactory.useDisposable(),
            price,
            comparePrice,

            get formattedPrice() { return fmt.format(this.price / 100); },
            get formattedComparePrice() { return fmt.format(this.comparePrice / 100); },
            get hasComparePrice() { return this.comparePrice > this.price; },

            init() {
                this.on(window, 'variant:change', (e) => {
                    if (e.detail?.sectionId !== sectionId) return;
                    const v = e.detail.variant;
                    this.price = v?.price || 0;
                    this.comparePrice = v?.compare_at_price || 0;
                });
            },

            destroy() {
                this.dispose();
            }
        };
    }

    /**
     * Product variant picker — reads variants JSON, tracks selected options,
     * resolves the matching variant, and dispatches update events for price /
     * gallery / buy-button blocks.
     *
     * @param {Object} opts
     * @param {string} opts.sectionId
     * @param {number} opts.productId
     * @param {string} opts.productFormId
     */
    static VariantPicker({ sectionId, productId, productFormId } = {}) {
        return {
            ...AlpineComponentsFactory.useDisposable(),
            sectionId,
            productId,
            productFormId,
            variants: [],
            selectedOptions: {},
            currentVariant: null,
            currentVariantId: null,

            init() {
                const jsonEl = document.getElementById(`ProductVariants-${this.sectionId}`);
                if (jsonEl) {
                    try { this.variants = JSON.parse(jsonEl.textContent); } catch (_) { /* noop */ }
                }

                this._buildOptionNames();
                this._setInitialSelection();
                this._resolveVariant();

                this.$nextTick(() => this._dispatchChange());

                this.on(window, 'variant-picker:set', (e) => {
                    if (e.detail?.sectionId !== this.sectionId) return;
                    if (e.detail.options) {
                        Object.assign(this.selectedOptions, e.detail.options);
                        this._resolveVariant();
                        this._dispatchChange();
                    }
                });
            },

            _optionNames: [],

            _buildOptionNames() {
                this._optionNames = [];
                const children = this.$el.children;
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    const legend = child.querySelector('legend');
                    const label = child.querySelector('label');
                    const textEl = legend || label;
                    if (!textEl) continue;
                    this._optionNames.push(textEl.textContent.split(':')[0].trim());
                }
            },

            _setInitialSelection() {
                const first = this.variants.find(v => v.available) || this.variants[0];
                if (!first) return;
                first.options.forEach((val, i) => {
                    const name = this._optionNameByPosition(i + 1);
                    if (name) this.selectedOptions[name] = val;
                });
                this.currentVariant = first;
                this.currentVariantId = first.id;
            },

            _optionNameByPosition(pos) {
                return this._optionNames[pos - 1] || null;
            },

            onVariantChange() {
                this._resolveVariant();
                this._dispatchChange();
            },

            _resolveVariant() {
                const match = this.variants.find(v =>
                    v.options.every((val, i) => {
                        const name = this._optionNameByPosition(i + 1);
                        return name && this.selectedOptions[name] === val;
                    })
                );

                this.currentVariant = match || null;
                this.currentVariantId = match?.id || null;
            },

            _dispatchChange() {
                const variant = this.currentVariant;

                window.dispatchEvent(new CustomEvent('variant:change', {
                    detail: {
                        sectionId: this.sectionId,
                        productId: this.productId,
                        variant
                    }
                }));

                if (variant?.featured_image?.position) {
                    window.dispatchEvent(new CustomEvent('gallery:slide-to', {
                        detail: { index: variant.featured_image.position - 1 }
                    }));
                }

                this._updateUrl(variant);
            },

            _updateUrl(variant) {
                if (!variant) return;
                const url = new URL(window.location);
                url.searchParams.set('variant', variant.id);
                window.history.replaceState({}, '', url);
            },

            isValueAvailable(optionName, value) {
                const test = { ...this.selectedOptions, [optionName]: value };
                return this.variants.some(v => {
                    if (!v.available) return false;
                    return v.options.every((val, i) => {
                        const name = this._optionNameByPosition(i + 1);
                        return !name || !(name in test) || test[name] === val;
                    });
                });
            },

            destroy() {
                this.dispose();
            }
        };
    }

    /**
     * Reusable quantity selector with boundary clamping and toast feedback.
     * Dispatches 'quantity:change' (bubbles) so parent contexts (cart, product)
     * can react without the component knowing the business layer.
     * When sectionId is provided, auto-updates max from variant inventory via variant:change.
     *
     * @param {Object}      opts
     * @param {number}      [opts.value=1]
     * @param {number}      [opts.min=1]
     * @param {number|null} [opts.max=null]    - null = unlimited
     * @param {number}      [opts.step=1]
     * @param {string|null} [opts.sectionId=null] - when set, listens for variant:change to sync max with inventory
     */
    static QuantitySelector({ value = 1, min = 1, max = null, step = 1, sectionId = null } = {}) {
        return {
            ...(sectionId ? AlpineComponentsFactory.useDisposable() : {}),
            qty: value,
            min,
            max,
            step,

            get canDecrement() { return this.qty > this.min; },
            get canIncrement() { return this.max === null || this.qty < this.max; },

            init() {
                if (!sectionId) return;
                this.on(window, 'variant:change', (e) => {
                    if (e.detail?.sectionId !== sectionId) return;
                    const variant = e.detail.variant;
                    if (!variant) return;
                    if (variant.inventory_policy === 'continue' || variant.inventory_quantity == null) {
                        this.max = null;
                    } else {
                        this.max = Math.max(this.min, variant.inventory_quantity);
                    }
                    if (this.max !== null && this.qty > this.max) {
                        this.qty = this.max;
                        this._notify();
                    }
                });
            },

            increment() {
                if (!this.canIncrement) {
                    this._toast(`Maximum quantity is ${this.max}.`);
                    return;
                }
                this.qty = this.max !== null
                    ? Math.min(this.max, this.qty + this.step)
                    : this.qty + this.step;
                this._notify();
            },

            decrement() {
                if (!this.canDecrement) {
                    this._toast(`Minimum quantity is ${this.min}.`);
                    return;
                }
                this.qty = Math.max(this.min, this.qty - this.step);
                this._notify();
            },

            onInput() {
                const raw = parseInt(this.qty);
                if (isNaN(raw) || raw < this.min) {
                    this._toast(`Quantity must be at least ${this.min}.`);
                    this.qty = this.min;
                    this._notify();
                    return;
                }
                if (this.max !== null && raw > this.max) {
                    this._toast(`You can only add up to ${this.max} of this item.`);
                    this.qty = this.max;
                    this._notify();
                    return;
                }
                this.qty = raw;
                this._notify();
            },

            _notify() {
                this.$dispatch('quantity:change', { value: this.qty });
            },

            _toast(msg) {
                window.Alpine?.store('toast')?.show?.(msg, 'info');
            },

            destroy() {
                if (sectionId) this.dispose();
            }
        };
    }

    /**
     * Product buy-buttons — syncs with VariantPicker via variant:change,
     * handles AJAX add-to-cart through $store.cart, and shows toast feedback.
     *
     * @param {Object}      opts
     * @param {string}      opts.sectionId
     * @param {string}      opts.productFormId
     * @param {boolean}     [opts.available=true]
     * @param {number|null} [opts.variantId=null]
     */
    static BuyButtons({ sectionId, productFormId, available = true, variantId = null } = {}) {
        return {
            ...AlpineComponentsFactory.useDisposable(),
            sectionId,
            productFormId,
            available,
            variantId,
            isLoading: false,

            get buttonText() {
                if (!this.variantId) return 'Unavailable';
                if (!this.available) return 'Sold out';
                return 'Add to cart';
            },

            init() {
                this.on(window, 'variant:change', (e) => {
                    if (e.detail?.sectionId !== this.sectionId) return;
                    const variant = e.detail.variant;
                    this.variantId = variant?.id || null;
                    this.available = variant?.available || false;
                });
            },

            _getQuantity() {
                const form = document.getElementById(this.productFormId);
                const qtyInput = form?.querySelector('input[name="quantity"]')
                    || document.querySelector(`input[name="quantity"][form="${this.productFormId}"]`)
                    || this.$el.closest('.product-info')?.querySelector('input[name="quantity"]');
                return qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
            },

            addToCart() {
                if (!this.available || !this.variantId || this.isLoading) return;

                this.isLoading = true;
                const cart = window.Alpine?.store('cart');
                if (!cart) { this.isLoading = false; return; }

                cart.add([{ id: this.variantId, quantity: this._getQuantity() }], [this.sectionId])
                    .then(() => {
                        window.Alpine?.store('toast')?.show?.('Added to cart!', 'success');
                    })
                    .catch((err) => {
                        const msg = err?.message || 'Could not add to cart. Please try again.';
                        window.Alpine?.store('toast')?.show?.(msg, 'error');
                    })
                    .finally(() => {
                        this.isLoading = false;
                    });
            },

            destroy() {
                this.dispose();
            }
        };
    }

    /**
     * Predictive search dropdown used in the header / search page.
     * Uses Shopify Predictive Search API to fetch suggestions and resources.
     *
     * @param {Object} options
     * @param {string} options.searchUrl   - Base search URL (routes.search_url)
     * @param {string} [options.initialQuery=''] - Initial query from current page
     */
    static predictiveSearch() {
        const Utils = window.__Theme__?.Utils;

        return {
            ...(Utils ? AlpineComponentsFactory.useDisposable() : {}),
            searchUrl: '/search',
            query: '',
            isOpen: false,
            loading: false,
            isLoading: false,
            suggestions: [],
            products: [],
            articles: [],
            pages: [],
            activeTab: 'products',
            activeSuggestionId: null,
            hasEmptyState: false,
            _debouncedFetch: null,
            _abortController: null,

            init() {
                if (Utils) {
                    this._debouncedFetch = Utils.debounce((term) => this._fetch(term), 250);
                }

                if (this.query) {
                    this.openPanel();
                    this.onInput(this.query);
                }
            },

            openPanel() {
                if (!this.query) return;
                this.isOpen = true;
            },

            closePanel() {
                this.isOpen = false;
                this.activeSuggestionId = null;
            },

            onInput(value) {
                this.query = value;
                const term = value.trim();

                if (!term) {
                    this._resetResults();
                    this.isOpen = false;
                    this.loading = false;
                    this.isLoading = false;
                    return;
                }

                this.isOpen = true;
                this.loading = true;
                this.isLoading = true;
                this.hasEmptyState = false;

                if (this._debouncedFetch) {
                    this._debouncedFetch(term);
                } else {
                    this._fetch(term);
                }
            },

            _resetResults() {
                this.suggestions = [];
                this.products = [];
                this.articles = [];
                this.pages = [];
                this.hasEmptyState = false;
            },

            _fetch(term) {
                if (!term) {
                    this.loading = false;
                    this.isLoading = false;
                    this._resetResults();
                    return;
                }

                if (this._abortController) {
                    this._abortController.abort();
                }

                this._abortController = new AbortController();
                const controller = this._abortController;

                const url = new URL('/search/suggest.json', window.location.origin);
                
                url.searchParams.set('q', term);
                url.searchParams.set('resources[type]', 'query,product,article,page');
                url.searchParams.set('resources[limit]', '4');

                fetch(url.toString(), {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                })
                    .then((res) => {
                        if (!res.ok) throw new Error('Predictive search failed');
                        return res.json();
                    })
                    .then((data) => {
                        const results = data?.resources?.results || {};
                        const currency = window.Shopify?.currency?.active || (window.Shopify && window.Shopify.currency) || 'USD';
                        const fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency });

                        
                        this.suggestions = (results.queries || []).map((q) => ({
                            text: q.text, 
                            url: q.url
                        })).filter((q) => q.text);

                        this.products = (results.products || []).map((p) => {
                            let finalPrice = p.price;
                            if (typeof p.price === 'number') {
                                finalPrice = fmt.format(p.price / 100);
                            }

                            return {
                                id: p.id,
                                title: p.title,
                                vendor: p.vendor,
                                priceFormatted: finalPrice,
                                image: typeof p.image === 'string' ? p.image : (p.image?.url || p.featured_image?.url || ''),
                                url: p.url
                            };
                        });

                        this.articles = (results.articles || []).map((a) => ({
                            id: a.id, title: a.title, url: a.url
                        }));

                        this.pages = (results.pages || []).map((pg) => ({
                            id: pg.id, title: pg.title, url: pg.url
                        }));

                        const hasAny = 
                            this.suggestions.length || 
                            this.products.length || 
                            this.articles.length || 
                            this.pages.length;

                        this.hasEmptyState = !hasAny;
                        
                        if (!this.products.length && this.articles.length) {
                            this.activeTab = 'articles';
                        } else if (!this.products.length && this.pages.length) {
                            this.activeTab = 'pages';
                        } else {
                            this.activeTab = 'products';
                        }
                    })
                    .catch((err) => {
                        if (err.name === 'AbortError') return;
                        console.error(err);
                        this._resetResults();
                        this.hasEmptyState = true;
                    })
                    .finally(() => {
                        if (this._abortController === controller) {
                            this.loading = false;
                            this.isLoading = false;
                            this._abortController = null;
                        }
                    });
            },

            performSearch() {
                const term = (this.query || '').trim();
                if (!term) return;

                const url = new URL(this.searchUrl, window.location.origin);
                url.searchParams.set('q', term);
                window.location.assign(url.toString());
            },

            onSuggestionClick(item) {
                if (!item) return;
                this.query = item.text || '';
                this.performSearch();
            },

            highlightSuggestion(text) {
                const term = (this.query || '').trim();
                if (!term || !text) return this._escapeHtml(text);

                const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escaped})`, 'ig');
                return this._escapeHtml(text).replace(regex, '<span class=\"font-medium text-[#263D29]\">$1</span>');
            },

            _escapeHtml(str) {
                return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            },

            destroy() {
                if (this._debouncedFetch?.dispose) {
                    this._debouncedFetch.dispose();
                }
                if (this._abortController) {
                    this._abortController.abort();
                    this._abortController = null;
                }
                if (this.dispose) {
                    this.dispose();
                }
            }
        };
    }

    /**
     * Product image gallery with multiple layout modes and optional lightbox.
     *
     * Layout modes (driven by Liquid, not JS):
     *   thumbnails — thumb strip + single active main image
     *   carousel   — Swiper slider with pagination dots
     *   stacked    — all images laid out vertically
     *   grid       — CSS grid of all images
     *
     * The component manages:
     *   - activeIndex tracking (shared across thumb clicks, swiper, and lightbox)
     *   - Swiper lifecycle for carousel mode
     *   - Lightbox open/close with keyboard nav
     *   - External variant-mapping via gallery:slide-to event
     */
    static productGallery() {
        return {
            ...AlpineComponentsFactory.useDisposable(),
            activeIndex: 0,
            imageCount: 0,
            zoomOpen: false,
            zoomIndex: 0,
            _swiper: null,

            init() {
                this.imageCount = Number(this.$el.dataset.imageCount) || 0;
                this.$nextTick(() => this._initSwiper());

                this.on(window, 'gallery:slide-to', (e) => {
                    if (e.detail?.id && e.detail.id !== this.$el.id) return;
                    if (typeof e.detail?.index === 'number') this.setActive(e.detail.index);
                });
            },

            setActive(index) {
                if (this.imageCount === 0) return;
                index = Math.max(0, Math.min(index, this.imageCount - 1));
                this.activeIndex = index;
                if (this._swiper) this._swiper.slideTo(index);
            },

            next() {
                this.setActive((this.activeIndex + 1) % this.imageCount);
            },

            prev() {
                this.setActive((this.activeIndex - 1 + this.imageCount) % this.imageCount);
            },

            openZoom(index) {
                this.zoomIndex = typeof index === 'number' ? index : this.activeIndex;
                this.zoomOpen = true;
                document.body.style.overflow = 'hidden';
            },

            closeZoom() {
                this.zoomOpen = false;
                document.body.style.overflow = '';
            },

            zoomNext() {
                this.zoomIndex = (this.zoomIndex + 1) % this.imageCount;
            },

            zoomPrev() {
                this.zoomIndex = (this.zoomIndex - 1 + this.imageCount) % this.imageCount;
            },

            _initSwiper() {
                if (typeof Swiper === 'undefined') return;

                const mainEl = this.$el.querySelector('[data-gallery-swiper]');
                if (!mainEl) return;

                this._swiper = new Swiper(mainEl, {
                    slidesPerView: 1,
                    spaceBetween: 0,
                    pagination: {
                        el: mainEl.querySelector('.swiper-pagination'),
                        clickable: true
                    },
                    on: {
                        slideChange: (s) => { this.activeIndex = s.activeIndex; }
                    }
                });
            },

            destroy() {
                if (this._swiper?.destroy) this._swiper.destroy(true, true);
                if (this.zoomOpen) this.closeZoom();
                this.dispose();
            }
        };
    }
}

window.__Theme__ = window.__Theme__ || {};
window.__Theme__.AlpineComponentsFactory = AlpineComponentsFactory;
window.__Theme__.AlpineComponents = AlpineComponents;
})();