// Collection of userscripts to be used for scriptlet injection via uBO.

'use strict';

/// remove-shadowroot-elem.js
/// alias rsre.js
// example.com##+js(rsre, [selector], delay)
function(  
	selector = '',
	delay = '' 
) {
	  if ( selector === '' ) { return; }
	  const queryShadowRootElement = (shadowRootElement, rootElement) => {
		if (!rootElement) {
		    return queryShadowRootElement(shadowRootElement, document.documentElement);
		}
		const els = rootElement.querySelectorAll(shadowRootElement);
		for (const el of els) { if (el) { return el; } }
		const probes = rootElement.querySelectorAll('*');
		for (const probe of probes) {
		     if (probe.shadowRoot) {
			 const shadowElement = queryShadowRootElement(shadowRootElement, probe.shadowRoot);
			 if (shadowElement) { return shadowElement; }
		     }
		}
		return null;
	  };
	  const rmshadowelem = () => {
		try {
			const elem = queryShadowRootElement(selector);
			if (elem) { elem.remove(); }
		} catch { }
	  };
	  const observer = new MutationObserver(rmshadowelem);
	  observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true, });
	  if ( document.readyState === "complete" ) { self.setTimeout(observer.disconnect(), delay);  }
}

/// remove-node.js
/// alias rn.js
// example.com##+js(rn, text, inline-tag)
function( 
	needle = '', 
	selector = '' 
) {
	if ( needle === '' ) { needle = '^'; }
	else if ( needle.slice(0,1) === '/' && needle.slice(-1) === '/' ) {
		  needle = needle.slice(1,-1);
	} else {
		  needle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
	needle = new RegExp(needle);
	const removenode = () => {
		try {
			const nodes = document.querySelectorAll(selector);  
			for (const node of nodes) {
				if (needle.test(node.outerHTML)) {
				    node.textContent = ''; 
				    node.remove(); 
			       }     
			  }
		} catch { }
	};
	const observer = new MutationObserver(removenode);
	observer.observe(document.documentElement, { childList: true, subtree: true });
	if ( document.readyState === "complete" ) { observer.disconnect(); }	
}

/// set-attr.js
/// alias sa.js
// example.com##+js(sa, attr, value, [selector])
(() => {
		  const token = '{{1}}';
		  if ( token === '' || token === '{{1}}' ) { return; }
		  const tokens = token.split(/\s*\|\s*/);
		  const attrValue = '{{2}}';
		  let selector = '{{3}}';
		  if ( selector === '' || selector === '{{3}}' ) { selector = `[${tokens.join('],[')}]`; }
		  const behavior = '{{4}}';
		  let timer = undefined;
		  const setattr = () => {  
			const nodes = document.querySelectorAll(selector);
			try {
				for (const node of nodes) {
					for ( const attr of tokens ) {
					      if ( attr !== attrValue) { 
					      	   node.setAttribute(attr, attrValue);
					      }	      
					}
				}
			} catch { }
		  };
		  const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(setattr, { timeout: 10 });
		  };
		  const start = ( ) => {
			setattr();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			    attributes: true,
			    attributeFilter: tokens,
			    childList: true,
			    subtree: true,
			});
		  };
		  if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
			self.addEventListener('load', start, { once: true });
		     } else if ( document.readyState === 'loading' ) {
			self.addEventListener('DOMContentLoaded', start, { once: true });
		     } else {
			start();
		  }
})();

/// rename-attr.js
/// alias rna.js
// example.com##+js(rna, [selector], oldattr, newattr)
(() => {
                const selector = '{{1}}';
		if ( selector === '' || selector === '{{1}}' ) { return; }
		const oldattr = '{{2}}';
		if ( oldattr === '' || oldattr === '{{2}}' ) { return; }
	        const newattr = '{{3}}';
		if ( newattr === '' || newattr === '{{3}}' ) { return; }
		const behavior = '{{4}}';
		let timer = undefined;
		const renameattr = ( ) => {
	        				const elems = document.querySelectorAll( selector );
						try {
							for ( const elem of elems ) {
								if ( elem.hasAttribute( oldattr ) ) {
							             const value = elem.getAttribute( oldattr );		
		     				   	   	     elem.removeAttribute( oldattr );
								     elem.setAttribute( newattr, value );
								}
							}	
						} catch { }
		};
		const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(renameattr, { timeout: 10 });
		};
		const start = ( ) => {
			renameattr();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			    attributes: true,
			    childList: true,
			    subtree: true,
			});
		};
		if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
			self.addEventListener('load', start, { once: true });
		} else if ( document.readyState === 'loading' ) {
			self.addEventListener('DOMContentLoaded', start, { once: true });
		} else {
			start();
		}
})();

/// add-class.js
/// alias ac.js
// example.com##+js(ac, class, [selector])
(() => {
		    const needle = '{{1}}';
		    if ( needle === '' || needle === '{{1}}' ) { return; }
		    const needles = needle.split(/\s*\|\s*/);
		    let selector = '{{2}}';
		    if ( selector === '' || selector === '{{2}}' ) { selector = '.' + needles.map(a => CSS.escape(a)).join(',.'); }
		    const addclass = ev => {
						if (ev) { self.removeEventListener(ev.type, addclass, true);  }
						const nodes = document.querySelectorAll(selector);
						try {
							for ( const node of nodes ) {
							      node.classList.add(...needles);
							}
						} catch { }
		    };
		    if (document.readyState === 'loading') {
		    	      self.addEventListener('DOMContentLoaded', addclass, true);
	   	    } else {
		    	      addclass();
	   	    }
})();

/// replace-class.js
/// alias rpc.js
// example.com##+js(rpc, [selector], oldclass, newclass)
(() => {
			  const selector = '{{1}}';
			  if ( selector === '' || selector === '{{1}}' ) { return; }
			  const oldclass = '{{2}}';
			  if ( oldclass === '' || oldclass === '{{2}}' ) { return; }
			  const newclass = '{{3}}';
			  if ( newclass === '' || newclass === '{{3}}' ) { return; }
			  const behavior = '{{4}}';
			  let timer = undefined;
			  const replaceclass = ( ) => {
				  const nodes = document.querySelectorAll(selector);
				  try {
					for ( const node of nodes ) {
					      if ( node.classList.contains(oldclass) ) {	
					      	   node.classList.replace(oldclass, newclass);
					      }	      
					}
				  } catch { }
			  };
			  const mutationHandler = mutations => {
				if ( timer !== undefined ) { return; }
				let skip = true;
				for ( let i = 0; i < mutations.length && skip; i++ ) {
				    const { type, addedNodes, removedNodes } = mutations[i];
				    if ( type === 'attributes' ) { skip = false; }
				    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
					if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
				    }
				    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
					if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
				    }
				}
				if ( skip ) { return; }
				timer = self.requestIdleCallback(replaceclass, { timeout: 10 });
		  	  };
			  const start = ( ) => {
				replaceclass();
				if ( /\bloop\b/.test(behavior) === false ) { return; }
				const observer = new MutationObserver(mutationHandler);
				observer.observe(document.documentElement, {
				    attributes: true,
				    childList: true,
				    subtree: true,
				});
			  };
			  if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
				self.addEventListener('load', start, { once: true });
			     } else if ( document.readyState === 'loading' ) {
				self.addEventListener('DOMContentLoaded', start, { once: true });
			     } else {
				start();
			  }
})();

/// move-attr-prop.js
/// alias map.js
// example.com##+js(map, [selector], [selector2], attr, attr2)
(() => {
		const selector = '{{1}}';
		if ( selector === '' || selector === '{{1}}' ) { return; }
		const selector2 = '{{2}}';
		if ( selector2 === '' || selector2 === '{{2}}' ) { return; }
		const map = ev => {
						if (ev) { self.removeEventListener(ev.type, map, true); }
						try {
							const elem = document.querySelectorAll(selector);
							const elem2 = document.querySelectorAll(selector2);
							for (let i = 0; i < elem.length; i++) {
								elem[i].setAttribute('{{3}}', elem2[i].getAttribute('{{4}}'));
							}
						} catch { }
		};
		if (document.readyState === 'loading') {
		    	    self.addEventListener('DOMContentLoaded', map, true);
	   	} else {
		    	    map();
	   	}
})();

/// append-elem.js
/// alias ape.js
// example.com##+js(ape, [selector], element, attribute, value)
(() => {
		const selector = '{{1}}';
		if ( selector === '' || selector === '{{1}}' ) { return; }
		const appendNode = ev => {
						if (ev) { self.removeEventListener(ev.type, appendNode, true); }
						try {
							const elements = document.querySelectorAll(selector);
							for ( const element of elements ) {
							      const node = document.createElement('{{2}}');
							      node.setAttribute('{{3}}', '{{4}}');
							      element.append(node);
							}
						} catch { }
		};
		if (document.readyState === 'complete') {
		    	    appendNode();
	   	} else {
		    	    self.addEventListener('load', appendNode, true);
	   	}
})();

/// removeLocalItem.js
/// alias rli.js
// example.com##+js(rli, key)
(() => { 
		    const key = '{{1}}';
		    if ( key === '' || key === '{{1}}' ) { return; }
		    const keys = key.split(/\s*\|\s*/);
	            const behavior = '{{2}}';
		    let timer = undefined;
		    const removeItem = () => {
			  if ( key === '*' ) { return localStorage.clear(); }  
			  try {
				   for (const keyName of keys) {
					localStorage.removeItem(keyName);
				   }
			  } catch { }
		    };
		    const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(removeItem, { timeout: 10 });
		    };
		    const start = ( ) => {
			removeItem();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			    attributes: true,
			    childList: true,
			    subtree: true,
			});
		    };
		    if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
			self.addEventListener('load', start, { once: true });
		    } else if ( document.readyState === 'loading' ) {
			self.addEventListener('DOMContentLoaded', start, { once: true });
		    } else {
			start();
		    }
})();

/// setLocalItem.js
/// alias sli.js
// example.com##+js(sli, key, value)
(() => { 
		    const key = '{{1}}';
		    if ( key === '' || key === '{{1}}' ) { return; }
		    const keys = key.split(/\s*\|\s*/);
		    const value = '{{2}}';
	            const behavior = '{{3}}';
		    let timer = undefined;
		    const setItem = () => {
			  try {
				   for (const keyName of keys) {
					if (localStorage.getItem(keyName) === value) { break; }
					    localStorage.setItem(keyName, value);
				   }
			  } catch { }
		    };
		    const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(setItem, { timeout: 10 });
		    };
		    const start = ( ) => {
			setItem();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			    attributes: true,
			    childList: true,
			    subtree: true,
			});
		    };
		    if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
			self.addEventListener('load', start, { once: true });
		    } else if ( document.readyState === 'loading' ) {
			self.addEventListener('DOMContentLoaded', start, { once: true });
		    } else {
			start();
		    }
})();

/// callfunction.js
/// alias cf.js
// example.com##+js(cf, funcName, funcDelay)
(() => {
	      const funcCall = '{{1}}';
	      if ( funcCall === '' || funcCall === '{{1}}' ) { return; }
	      const funcDelay = '{{2}}';
	      if ( funcDelay === '' || funcDelay === '{{2}}' ) { return; }
	      const funcInvoke = ev => { 
		      				if (ev) { self.removeEventListener(ev.type, funcInvoke, true); }
		      				try { 
							setTimeout(window[funcCall], funcDelay);
						} catch { }
	      };	      
	      if (document.readyState === 'interactive' || document.readyState === 'complete') {
		    	    funcInvoke();
	      } else {
		    	    self.addEventListener('DOMContentLoaded', funcInvoke, true);
	      }
})();

/// no-alert-if.js
/// alias noaif.js
// example.com##+js(noaif, text)
(() => {
                let needle = '{{1}}';
                if ( needle === '{{1}}' ) { needle = ''; }
                const needleNot = needle.charAt(0) === '!';
                if ( needleNot ) { needle = needle.slice(1); }
                if ( /^\/.*\/$/.test(needle) ) {
                    needle = needle.slice(1, -1);
                } else if ( needle !== '' ) {
                    needle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }
                const log = needleNot === false && needle === '' ? console.log : undefined;
                const reNeedle = new RegExp(needle);
                self.alert = new Proxy(self.alert, {
                        apply: (target, thisArg, args) => {
		            let params;
			    try {
                            	  params = String(args);
			    } catch { }	    
                            let defuse = false;
                            if ( log !== undefined ) {
                                 log('uBO: alert("%s")', params);
                            } else if ( reNeedle.test(params) !== needleNot ) {
                                 defuse = reNeedle.test(params) !== needleNot;
                            }
                            if ( !defuse ) {
                                 return target.apply(thisArg, args);
                            }  
                        }
                });
})();

/// removeSessionItem.js
/// alias rsi.js
// example.com##+js(rsi, key)
(() => { 
		    const key = '{{1}}';
		    if ( key === '' || key === '{{1}}' ) { return; }
		    const keys = key.split(/\s*\|\s*/);
	            const behavior = '{{2}}';
		    let timer = undefined;
		    const removeItem = () => {
			  if ( key === '*' ) { return sessionStorage.clear(); }  
			  try {
				   for (const keyName of keys) {
					sessionStorage.removeItem(keyName);
				   }
			  } catch { }
		    };
		    const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(removeItem, { timeout: 10 });
		    };
		    const start = ( ) => {
			removeItem();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			    attributes: true,
			    childList: true,
			    subtree: true,
			});
		    };
		    if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
			self.addEventListener('load', start, { once: true });
		    } else if ( document.readyState === 'loading' ) {
			self.addEventListener('DOMContentLoaded', start, { once: true });
		    } else {
			start();
		    }
})();

/// setSessionItem.js
/// alias ssi.js
// example.com##+js(ssi, key, value)
(() => { 
		    const key = '{{1}}';
		    if ( key === '' || key === '{{1}}' ) { return; }
		    const keys = key.split(/\s*\|\s*/);
		    const value = '{{2}}';
	            const behavior = '{{3}}';
		    let timer = undefined;
		    const setItem = () => {
			  try {
				   for (const keyName of keys) {
					if (sessionStorage.getItem(keyName) === value) { break; }
					    sessionStorage.setItem(keyName, value);
				   }
			  } catch { }
		    };
		    const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(setItem, { timeout: 10 });
		    };
		    const start = ( ) => {
			setItem();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			    attributes: true,
			    childList: true,
			    subtree: true,
			});
		    };
		    if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
			self.addEventListener('load', start, { once: true });
		    } else if ( document.readyState === 'loading' ) {
			self.addEventListener('DOMContentLoaded', start, { once: true });
		    } else {
			start();
		    }
})();

/// insert-child-before.js
/// alias icb.js
// example.com##+js(icb, element, node)
(() => {
		const selector = '{{1}}';
		if ( selector === '' || selector === '{{1}}' ) { return; }
	        const element = '{{2}}';
		if ( element === '' || element === '{{2}}' ) { return; }
		const behavior = '{{3}}';
		let timer = undefined;
		const insertelem = () => {
			try {
				const elems = document.querySelectorAll(selector);
				const nodes = document.querySelectorAll(element);
				for (let i = 0; i < elems.length; i++) {
				    elems[i].before(nodes[i]);
				}	
			} catch { }
	   	};
		const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(insertelem, { timeout: 10 });
		};
		const start = ( ) => {
			insertelem();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			    attributes: true,
			    childList: true,
			    subtree: true,
			});
		};
		if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
		     self.addEventListener('load', start, { once: true });
		    } else if ( document.readyState === 'loading' ) {
		     self.addEventListener('DOMContentLoaded', start, { once: true });
		    } else {
		     start();
		}
})();

/// insert-child-after.js
/// alias ica.js
// example.com##+js(ica, element, node)
(() => {
		const selector = '{{1}}';
		if ( selector === '' || selector === '{{1}}' ) { return; }
	        const element = '{{2}}';
		if ( element === '' || element === '{{2}}' ) { return; }
		const behavior = '{{3}}';
		let timer = undefined;
		const insertelem = () => {
			try {
				const elems = document.querySelectorAll(selector);
				const nodes = document.querySelectorAll(element);
				for (let i = 0; i < elems.length; i++) {
				    elems[i].after(nodes[i]);
				}	
			} catch { }
	   	};
		const mutationHandler = mutations => {
			if ( timer !== undefined ) { return; }
			let skip = true;
			for ( let i = 0; i < mutations.length && skip; i++ ) {
			    const { type, addedNodes, removedNodes } = mutations[i];
			    if ( type === 'attributes' ) { skip = false; }
			    for ( let j = 0; j < addedNodes.length && skip; j++ ) {
				if ( addedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			    for ( let j = 0; j < removedNodes.length && skip; j++ ) {
				if ( removedNodes[j].nodeType === 1 ) { skip = false; break; }
			    }
			}
			if ( skip ) { return; }
			timer = self.requestIdleCallback(insertelem, { timeout: 10 });
		};
		const start = ( ) => {
			insertelem();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			    attributes: true,
			    childList: true,
			    subtree: true,
			});
		};
		if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
		     self.addEventListener('load', start, { once: true });
		    } else if ( document.readyState === 'loading' ) {
		     self.addEventListener('DOMContentLoaded', start, { once: true });
		    } else {
		     start();
		}
})();
