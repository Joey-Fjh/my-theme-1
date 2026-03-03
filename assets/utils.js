(function() {
'use strict';

class Utils {
    static rafThrottle(fn) {
        let ticking = false;
        let lastArgs = null;
        let rafId = null;
        const wrapper = function(...args){
            lastArgs = args;
            if (!ticking){
                ticking = true;
                rafId = requestAnimationFrame(()=>{
                    fn.apply(this, lastArgs);
                    ticking = false;
                });
            }
        };
        wrapper.dispose = () => {
            if (rafId) cancelAnimationFrame(rafId);
            ticking = false;
            lastArgs = null;
        };
        return wrapper;
    }

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
        
        const wrapper = function(...args){
            const context = this;
            
            const later = () => {
                timeout = null;
                if(!immediate) func.apply(context,args);
            };
            
            const callNow = immediate && !timeout;
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            
            if(callNow) func.apply(context,args);
        };

        wrapper.dispose = () => {
            clearTimeout(timeout);
            timeout = null;
        };

        return wrapper;
    }
}

window.__Theme__ = window.__Theme__ || {};
window.__Theme__.Utils = Utils;
})();