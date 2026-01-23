/**
* Base JavaScript
* functions：
* - binding Shopify global behaviors（ Cart etc. ）
* - support util functions
* - init third-party scripts
*/

class Utils {
    static throttle(func, delay = 300){
        let timeoutId;
        let lastExecTime = 0;
        
        return function(...args){
            const currentTime = Date.now();
            
            if(currentTime - lastExecTime > delay){
                func.apply(this,args);
                lastExecTime = currentTime;
            }else{
                clearTimeout(timeoutId);
                
                timeoutId = setTimeout(() => {
                    func.apply(this,args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }
    
    static debounce(func, wait = 300, immediate = false){
        let timeout;
        
        return function(...args){
            const context = this;
            
            const later = () => {
                timeout = null;
                
                if(!immediate) func.apply(context,args);
            }
            
            const callNow = immediate && !timeout;
            
            clearTimeout(timeout);
            
            timeout = setTimeout(later, wait);
            
            if(callNow) func.apply(context,args);
        };
    }
}

class Base {
    static initialized = false;

    static announcementBar = null; 
    static header = null;  

    static setCSSVar(name,value){
        document.documentElement.style.setProperty(name,value);
    }

    static init(){
        if (this.initialized) return;
        this.initialized = true;

        this.announcementBar = document.querySelector('.announcement-bar');
        this.header = document.querySelector('.header');

        this.updateLayout();

        const throttledUpdate = Utils.throttle(this.updateLayout.bind(this), 100);

        window.addEventListener('resize', throttledUpdate);
        window.addEventListener('scroll', throttledUpdate);

        [
            'shopify:section:load',
            'shopify:section:reorder',
            'shopify:section:unload'
        ].forEach(evt =>
            document.addEventListener(evt, throttledUpdate)
        );
    }

    static updateLayout(){
        this.updateAnnouncementBarHeight();
        this.updateHeaderHeight();
    }

    static updateAnnouncementBarHeight(){
        if (!this.announcementBar) return this.setCSSVar('--announcement-bar-height', `0px`);

        const rect = this.announcementBar.getBoundingClientRect();
        const announcementHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
        
        this.setCSSVar('--announcement-bar-height', `${announcementHeight}px`);    
    }

    static updateHeaderHeight(){ 
        const headerHeight = this.header
            ? this.header.offsetHeight
            : 0;

        this.setCSSVar('--header-height', `${headerHeight}px`);
    }
}

class Main {
    static main(){
        Base.init(); 
        this.initAlpine();
    } 

    static initAlpine(){
        document.addEventListener('alpine:init', () => {
            const alpine = window.Alpine;
            AlpineComponentsFactory.init(alpine);

            AlpineComponentsFactory.register(AlpineComponents.DROPDOWN, AlpineComponents.dropdown);
            AlpineComponentsFactory.register(AlpineComponents.STICKY_HEADER, AlpineComponents.stickyHeader);
            AlpineComponentsFactory.register(AlpineComponents.TABCONTROL, AlpineComponents.tabControl);
        })
    }
}

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
        
        this.#alpine.data(name,cb);
        this.#registeredNames.add(name);
    }

    static useDisposable(){
        const disposers = [];

        return {
            on(target,event,handler,options){
                target.addEventListener(event,handler,options);
                disposers.push(()=>target.removeEventListener(event, handler, options));
            },

            observe(observer,el){
                if (!el) return;

                observer.observe(el);
                disposers.push(()=>observer.disconnect());
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
			isAnnouncementVisible: true,
			
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

    static tabControl(){
        return {
            tabs: [],
            panels: [],
            activeIndex: 0,
            
            init() {
                this.$nextTick(() => {
                    if (this.tabs.length === 0) return;

                    if (this.activeIndex < 0 || this.activeIndex >= this.tabs.length) {
                        this.activeIndex = 0;
                    }
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
}

Main.main();