// Collection of userscripts to be used for scriptlet injection via uBO.

'use strict';

/// remove-shadowroot-elem.js
/// alias rsre.js
// example.com##+js(rsre, [selector])
function(  
	selector = '' 
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
	  if ( document.readyState === "complete" ) { self.setTimeout(observer.disconnect(), 67);  }
}

/// remove-node.js
/// alias rn.js
// example.com##+js(rn, text, inlineTag)
function( 
	needle = '', 
	inlineTag = '' 
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
			const nodes = document.getElementsByTagName(inlineTag);  
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

/// replace-node.js
/// alias rpn.js
// example.com##+js(rpn, needle, text, inlineTag)
function( 
	needle = '',
	text = '', 
	inlineTag = ''
) {
	if ( needle === '' ) { return; }
	else if ( needle.slice(0,1) === '/' && needle.slice(-1) === '/' ) {
		  needle = needle.slice(1,-1);
	} else {
		  needle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}
	needle = new RegExp(needle, "gms");
	const replacenode = () => {
		try {
			const nodes = document.getElementsByTagName(inlineTag); 
			for (const node of nodes) {
				if (needle.test(node.outerHTML)) {
				    let textContent = node.textContent; 
				    textContent  = textContent.replace(needle, text);
				    node.textContent = textContent; 
			        }     
			  }	
		} catch { }
	};
	const observer = new MutationObserver(replacenode);
	observer.observe( document.documentElement, { attributes: true, childList: true, subtree: true } );
	if ( document.readyState === "complete" ) { observer.disconnect(); }
}

/// set-attr.js
/// alias sa.js
// example.com##+js(sa, attr, value, [selector])
function(
	token = '',
	attrValue = '',
	selector = '',
	behavior = '' 
) {
	if ( token === '' ) { return; }
	const tokens = token.split(/\s*\|\s*/);
	if ( selector === '' ) { selector = `[${tokens.join('],[')}]`; }
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
    	} else if ( document.readyState !== 'loading' || /\basap\b/.test(behavior) ) {
        start();
    	} else {
        self.addEventListener('DOMContentLoaded', start, { once: true });
    	}
}

/// rename-attr.js
/// alias rna.js
// example.com##+js(rna, [selector], oldattr, newattr)
function(
	selector = '',
	oldattr = '',
	newattr = '',
	behavior = '' 
) {
	if ( selector === '' || oldattr === '' || newattr === '' ) { return; }
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
    	} else if ( document.readyState !== 'loading' || /\basap\b/.test(behavior) ) {
        start();
    	} else {
        self.addEventListener('DOMContentLoaded', start, { once: true });
    	}
}

/// add-class.js
/// alias ac.js
// example.com##+js(ac, class, [selector])
function(
	needle = '',
	selector = '' 
) {
	if ( needle === '' ) { return; }
	const needles = needle.split(/\s*\|\s*/);
	if ( selector === '' ) { selector = '.' + needles.map(a => CSS.escape(a)).join(',.'); }
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
}

/// replace-class.js
/// alias rpc.js
// example.com##+js(rpc, [selector], oldclass, newclass)
function(
	selector = '',
	oldclass = '',
	newclass = '', 
	behavior = ''
) {
	if ( selector === '' || oldclass === '' || newclass === '' ) { return; }
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
    	} else if ( document.readyState !== 'loading' || /\basap\b/.test(behavior) ) {
        start();
    	} else {
        self.addEventListener('DOMContentLoaded', start, { once: true });
    	}
}

/// move-attr-prop.js
/// alias map.js
// example.com##+js(map, [selector], [selector2], attr, attr2)
function(
	selector = '',
	element = '',
	newattr = '',
	oldattr = '' 
) {
	if ( selector === '' || element === '') { return; }
	const map = ev => {
		if (ev) { self.removeEventListener(ev.type, map, true); }
		try {
			const elem = document.querySelectorAll(selector);
			const elem2 = document.querySelectorAll(element);
			for (let i = 0; i < elem.length; i++) {
			     elem[i].setAttribute(newattr, elem2[i].getAttribute(oldattr));
			}
		} catch { }
	};
	if (document.readyState === 'loading') {
		    self.addEventListener('DOMContentLoaded', map, true);
	} else {
		    map();
	}
}

/// append-elem.js
/// alias ape.js
// example.com##+js(ape, [selector], element, attribute, value)
function(
	selector = '',
	elem = '',
	attr = '',
	value = '' 
) {
	if ( selector === '' ) { return; }
	const appendNode = ev => {
		if (ev) { self.removeEventListener(ev.type, appendNode, true); }
		try {
			const elements = document.querySelectorAll(selector);
			for ( const element of elements ) {
			      const node = document.createElement(elem);
			      node.setAttribute(attr, value);
			      element.append(node);
			}
		} catch { }
	};
	if (document.readyState === 'complete') {
		    appendNode();
	} else {
		    self.addEventListener('load', appendNode, true);
	}
}

/// removeLocalItem.js
/// alias rli.js
// example.com##+js(rli, key)
function( 
	key = '',
	behavior = '' 
) { 
	    if ( key === '' ) { return; }
	    const keys = key.split(/\s*\|\s*/);
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
    	    } else if ( document.readyState !== 'loading' || /\basap\b/.test(behavior) ) {
            start();
    	    } else {
            self.addEventListener('DOMContentLoaded', start, { once: true });
    	    }
}

/// setLocalItem.js
/// alias sli.js
// example.com##+js(sli, key, value)
function(
	key = '',
	value = '',
	behavior = '' 
) { 
	    if ( key === '' ) { return; }
	    const keys = key.split(/\s*\|\s*/);
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
    	    } else if ( document.readyState !== 'loading' || /\basap\b/.test(behavior) ) {
            start();
    	    } else {
            self.addEventListener('DOMContentLoaded', start, { once: true });
    	    }
}

/// callfunction.js
/// alias cf.js
// example.com##+js(cf, funcName, funcDelay)
function(
	funcCall = '',
	funcDelay = '' 
) {
	      if ( funcCall === '' || funcDelay === '' ) { return; }
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
}

/// no-alert-if.js
/// alias noaif.js
// example.com##+js(noaif, text)
function(
        needle = ''
) {
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
}

/// removeSessionItem.js
/// alias rsi.js
// example.com##+js(rsi, key)
function( 
        key = '',
	behavior = '' 
) { 
	    if ( key === '' ) { return; }
	    const keys = key.split(/\s*\|\s*/);
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
    	    } else if ( document.readyState !== 'loading' || /\basap\b/.test(behavior) ) {
            start();
    	    } else {
            self.addEventListener('DOMContentLoaded', start, { once: true });
    	    }
}

/// setSessionItem.js
/// alias ssi.js
// example.com##+js(ssi, key, value)
function(
	key = '',
	value = '',
	behavior = ''
) { 
	    if ( key === '' ) { return; }
	    const keys = key.split(/\s*\|\s*/);
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
    	} else if ( document.readyState !== 'loading' || /\basap\b/.test(behavior) ) {
        start();
    	} else {
        self.addEventListener('DOMContentLoaded', start, { once: true });
    	}
}

/// insert-child-before.js
/// alias icb.js
// example.com##+js(icb, element, node)
function( 
	selector = '',
	element = '',
	behavior = '' 
) {
	if ( selector === '' || element === '' ) { return; }
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
    	} else if ( document.readyState !== 'loading' || /\basap\b/.test(behavior) ) {
        start();
    	} else {
        self.addEventListener('DOMContentLoaded', start, { once: true });
    }
}

/// insert-child-after.js
/// alias ica.js
// example.com##+js(ica, element, node)
function( 
	selector = '',
	element = '',
	behavior = '' 
) {
	if ( selector === '' || element === '' ) { return; }
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
    	} else if ( document.readyState !== 'loading' || /\basap\b/.test(behavior) ) {
        start();
    	} else {
        self.addEventListener('DOMContentLoaded', start, { once: true });
    }
}

/// setCookie.js
/// alias sck.js
// example.com##+js(sck, cookie, value)
function( 
	cName = '', 
	cValue = '',
	expTime = '',
	behavior = '' 
) {
	let timer = undefined;
	if ( cName === '' ) { return; }
	if ( expTime === '' ) { expTime = '1'; }
	if ( cValue === '' ) { cValue = '""'; }	
	const setCookie = () => {
		try {
			const cookies = document.cookie;
			if ( !cookies.includes(cName) || !cookies.includes(cValue) ) {
		      		const date = new Date();
				date.setTime(date.getTime() + (expTime * 24 * 60 * 60 * 1000));
				const expires = "expires=" + date.toUTCString();
				document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
			} else { 
				return; 
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
	timer = self.requestIdleCallback(setCookie, { timeout: 10 });
	};
	const start = ( ) => {
	setCookie();
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
	} else if ( document.readyState !== 'loading' || /\basap\b/.test(behavior) ) {
	start(); 
	} else {
	self.addEventListener('DOMContentLoaded', start, { once: true });
	}	
}
