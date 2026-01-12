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
            
            alpine.data('dropdownGroup', () => ({
                openEl: null,
                toggle(target) {
                    if (this.openEl && this.openEl !== target) {
                        this.openEl.removeAttribute('open')
                    }
                    
                    if (target.hasAttribute('open')) {
                        target.removeAttribute('open')
                        this.openEl = null
                    } else {
                        target.setAttribute('open', '')
                        this.openEl = target
                    }
                },
                closeAll() {
                    if (this.openEl) {
                        this.openEl.removeAttribute('open')
                        this.openEl = null
                    }
                }
            }));
        })
    }
}

Main.main();