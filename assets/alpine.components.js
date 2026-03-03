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
     * @param {string} sectionId
     * @param {string[]|null} [selectors=null]
     */
    static sectionPagination(sectionId, selectors = null) {
        return {
            ...(window.__Theme__?.AlpineComponentsFactory?.useDisposable?.() || {}),
            isLoading: false,
            sectionId: sectionId || null,
            /** @type {string[]} */
            selectors: Array.isArray(selectors) ? selectors : (selectors ? [selectors] : []),
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
                const config = {
                    targetSelector: `#shopify-section-${this.sectionId}`
                };
                if (this.selectors.length > 0) {
                    config.innerSelectors = this.selectors;
                }
                return { [this.sectionId]: config };
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

                const sep = url.includes('?') ? '&' : '?';
                const fetchUrl = url + sep + 'sections=' + encodeURIComponent(this.sectionId);

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
             * Compare current pathname against a target href (trailing-slash and case insensitive).
             * @param {string} targetHref
             * @returns {boolean}
             */
            isUrlMatch(targetHref) {
                const normalize = (p) => p.replace(/\/$/, '').toLowerCase();
                return normalize(window.location.pathname) ===
                    normalize(new URL(targetHref, window.location.origin).pathname);
            },

            destroy() {
                if (this._debouncedFetch?.dispose) this._debouncedFetch.dispose();
                if (this.abortController) this.abortController.abort();
                if (this.dispose) this.dispose();
            }
        };
    }
}

window.__Theme__ = window.__Theme__ || {};
window.__Theme__.AlpineComponentsFactory = AlpineComponentsFactory;
window.__Theme__.AlpineComponents = AlpineComponents;
})();