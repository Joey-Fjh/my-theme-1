/**
* Base JavaScript
* functions：
* - binding Shopify global behaviors（ Cart etc. ）
* - support util functions
* - init third-party scripts
*
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

class Main {
    static main(){
        this.initAlpine();
    } 
    
    static initAlpine(){
        document.addEventListener('alpine:init', () => {
            const alpine = window.Alpine;
            
            AlpineComponents.init(alpine);
        })
    }
}

class AlpineComponents {
    static init(alpine){
        alpine.data('dropdown',this.dropdown);
    }
    
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
}

Main.main();