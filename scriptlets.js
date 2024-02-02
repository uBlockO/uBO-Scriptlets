'use strict';

/// remove-shadowroot-elem.js
/// alias rsre.js
/// world ISOLATED
// example.com##+js(rsre, [selector])
function removeShadowRootElem(  
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

/// rename-attr.js
/// alias rna.js
/// world ISOLATED
/// dependency run-at.fn
// example.com##+js(rna, [selector], oldattr, newattr)
function renameAttr(
	selector = '',
	oldattr = '',
	newattr = '',
	run = '' 
) {
	if ( selector === '' || oldattr === '' || newattr === '' ) { return; }
	let timer;
	const renameattr = ( ) => {
		timer = undefined;
		const elems = document.querySelectorAll(selector);
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
		timer = self.requestAnimationFrame(renameattr);
	};
	const start = ( ) => {
		renameattr();
		if ( /\bloop\b/.test(run) === false ) { return; }
		const observer = new MutationObserver(mutationHandler);
		observer.observe(document.documentElement, {
		    childList: true,
		    subtree: true,
		});
	};
	runAt(( ) => { start(); }, /\bcomplete\b/.test(run) ? 'idle' : 'interactive');
}

/// replace-attr.js
/// alias rpla.js
/// world ISOLATED
/// dependency run-at.fn
// example.com##+js(rpla, [selector], oldattr, newattr, newvalue)
function replaceAttr(
	selector = '',
	oldattr = '',
	newattr = '',
	value = '',
	run = '' 
) {
	if ( selector === '' || oldattr === '' || newattr === '' ) { return; }
	let timer;
	const replaceattr = ( ) => {
		timer = undefined;
		const elems = document.querySelectorAll(selector);
		try {
			for ( const elem of elems ) {
				if ( elem.hasAttribute( oldattr ) ) {
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
		timer = self.requestAnimationFrame(replaceattr);
	};
	const start = ( ) => {
		replaceattr();
		if ( /\bloop\b/.test(run) === false ) { return; }
		const observer = new MutationObserver(mutationHandler);
		observer.observe(document.documentElement, {
		    childList: true,
		    subtree: true,
		});
	};
	runAt(( ) => { start(); }, /\bcomplete\b/.test(run) ? 'idle' : 'interactive');
}

/// add-class.js
/// alias ac.js
/// dependency run-at.fn
/// world ISOLATED
// example.com##+js(ac, class, [selector])
function addClass(
	needle = '',
	selector = '' 
) {
	if ( needle === '' ) { return; }
	const needles = needle.split(/\s*\|\s*/);
	if ( selector === '' ) { selector = '.' + needles.map(a => CSS.escape(a)).join(',.'); }
	const addclass = ( ) => {
		const nodes = document.querySelectorAll(selector);
		try {
			for ( const node of nodes ) {
			      node.classList.add(...needles);
			}
		} catch { }
	};
	runAt(( ) => { addclass(); }, 'interactive');
}

/// replace-class.js
/// alias rpc.js
/// world ISOLATED
/// dependency run-at.fn
// example.com##+js(rpc, [selector], oldclass, newclass)
function replaceClass(
	selector = '',
	oldclass = '',
	newclass = '', 
	run = ''
) {
	if ( selector === '' || oldclass === '' || newclass === '' ) { return; }
	let timer;
	const replaceclass = ( ) => {
	  timer = undefined;	
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
	timer = self.requestAnimationFrame(replaceclass);
	};
	const start = ( ) => {
	replaceclass();
	if ( /\bloop\b/.test(run) === false ) { return; }
	const observer = new MutationObserver(mutationHandler);
	observer.observe(document.documentElement, {
	    childList: true,
	    subtree: true,
	});
	};
	runAt(( ) => { start(); }, /\bcomplete\b/.test(run) ? 'idle' : 'interactive');
}

/// append-elem.js
/// alias ape.js
/// dependency run-at.fn
/// world ISOLATED
// example.com##+js(ape, [selector], element, attribute, value)
function appendElem(
	selector = '',
	elem = '',
	attr = '',
	value = '' 
) {
	if ( selector === '' ) { return; }
	const appendNode = ( ) => {
		try {
			const elements = document.querySelectorAll(selector);
			for ( const element of elements ) {
			      const node = document.createElement(elem);
			      node.setAttribute(attr, value);
			      element.append(node);
			}
		} catch { }
	};
	runAt(( ) => { appendNode(); }, 'interactive');
}

/// callfunction.js
/// alias cf.js
/// dependency run-at.fn
/// world ISOLATED
// example.com##+js(cf, funcName, funcDelay)
function callFunction(
	funcCall = '',
	funcDelay = '' 
) {
	      if ( funcCall === '' || funcDelay === '' ) { return; }
	      const funcInvoke = ( ) => { 
			try { 
				setTimeout(window[funcCall], funcDelay);
			} catch { }
	      };	      
	      runAt(( ) => { funcInvoke(); }, 'interactive');
}

/// no-alert-if.js
/// alias noaif.js
// example.com##+js(noaif, text)
function noAlertIf(
        needle = ''
) {
                const needleNot = needle.charAt(0) === '!';
                if ( needleNot ) { needle = needle.slice(1); }
                if ( /^\/.*\/$/.test(needle) ) {
                    needle = needle.slice(1, -1);
                } else if ( needle !== '' ) {
                    needle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }
                const log = needleNot === false && needle.length === 0 ? console.log.bind(console) : undefined;
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
                                 return Reflect.apply(target, thisArg, args);
                            }  
                        },
			get: (target, prop, receiver) => {
                	    if ( prop === 'toString' ) {
                    		 return target.toString.bind(target);
                	}
                		return Reflect.get(target, prop, receiver);
            		},
                });
}

/// insert-child-before.js
/// alias icb.js
/// world ISOLATED
/// dependency run-at.fn
// example.com##+js(icb, element, node)
function insertChildBefore( 
	selector = '',
	element = '',
	run = '' 
) {
	if ( selector === '' || element === '' ) { return; }
	let timer;
	const insertelem = () => {
		timer = undefined;
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
		timer = self.requestAnimationFrame(insertelem);
	};
	const start = ( ) => {
		insertelem();
		if ( /\bloop\b/.test(run) === false ) { return; }
		const observer = new MutationObserver(mutationHandler);
		observer.observe(document.documentElement, {
		    childList: true,
		    subtree: true,
		});
	};
	runAt(( ) => { start(); }, /\bcomplete\b/.test(run) ? 'idle' : 'interactive');
}

/// insert-child-after.js
/// alias ica.js
/// world ISOLATED
/// dependency run-at.fn
// example.com##+js(ica, element, node)
function insertChildAfter( 
	selector = '',
	element = '',
	run = '' 
) {
	if ( selector === '' || element === '' ) { return; }
	let timer;
	const insertelem = () => {
		timer = undefined;
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
		timer = self.requestAnimationFrame(insertelem);
	};
	const start = ( ) => {
		insertelem();
		if ( /\bloop\b/.test(run) === false ) { return; }
		const observer = new MutationObserver(mutationHandler);
		observer.observe(document.documentElement, {
		    childList: true,
		    subtree: true,
		});
	};
	runAt(( ) => { start(); }, /\bcomplete\b/.test(run) ? 'idle' : 'interactive');
}

/// set-inner-html.js
/// alias sih.js
/// dependency run-at.fn
/// world ISOLATED
function setInnerHTML(
         selector = '',
         text = ''    
) {
    if ( selector === '' || text === '' ) { return; }
    const innerHTML = ( ) => {
          const nodes = document.querySelectorAll(selector);
          try {
		 for ( const node of nodes ) {
		      if ( node ) { node.innerHTML = text; }
		 }
	  } catch { }
    };
    runAt(( ) => { innerHTML(); }, 'interactive');
}

/// move-attr-prop.js
/// alias map.js
/// dependency run-at.fn
/// world ISOLATED
// example.com##+js(map, [selector], [selector2], attr, attr2)
function moveAttrProp(
	selector = '',
	element = '',
	newattr = '',
	oldattr = '' 
) {
	if ( selector === '' || element === '') { return; }
	const map = ( ) => {
		try {
			const elem = document.querySelectorAll(selector);
			const elem2 = document.querySelectorAll(element);
			for (let i = 0; i < elem.length; i++) {
			     elem[i].setAttribute(newattr, elem2[i].getAttribute(oldattr));
			}
		} catch { }
	};
	runAt(( ) => { map(); }, 'interactive');
}

/// no-beacon.js
/// alias nob.js
/// dependency run-at.fn
/// dependency safe-self.fn
function noBeaconIf(
        url = '',
        data = ''
) {
        const safe = safeSelf();
        const extraArgs = safe.getExtraArgs(Array.from(arguments), 2);
        const reUrl = safe.patternToRegex(url);
        const reData = safe.patternToRegex(data);
        const log = safe.makeLogPrefix('no-beacon', type, pattern);
        const trapBeacons = ( ) => {
           const beaconHandler = {
                apply: (target, thisArg, args) => {
                    let url, data;
                    try {
                          url = String(args[0]);
                          data = String(args[1]);
                    } catch { }	    
                    const matchesNeedle = safe.RegExp_test.call(reUrl, url);
                    const matchesData = safe.RegExp_test.call(reData, data);
                    const matchesEither = matchesNeedle || matchesData;
                    const matchesBoth = matchesNeedle && matchesData;
                    if ( log === 1 && matchesBoth || log === 2 && matchesEither || log === 3 ) {
                        safe.uboLog(log, `sendBeacon('${url}', '${data}')`);
                    }
                    if ( matchesBoth ) { return; }
                    return Reflect.apply(target, thisArg, args);
                },
                get: (target, prop, receiver) => {
                    if ( prop === 'toString' ) {
                        return target.toString.bind(target);
                    }
                        return Reflect.get(target, prop, receiver);
                },
            };
           self.navigator.sendBeacon = new Proxy(self.navigator.sendBeacon, beaconHandler);
        };
        runAt(( ) => { trapBeacons(); }, extraArgs.runAt);
}

/// trusted-set-attr.js
/// alias tsa.js
/// dependency run-at.fn
/// world ISOLATED
// example.com##+js(tsa, attr, value, [selector], runValue)
function setAttr(
	token = '',
	attrValue = '',
	selector = '',
	run = '' 
) {
	if ( token === '' ) { return; }
	const tokens = token.split(/\s*\|\s*/);
	if ( selector === '' ) { selector = `[${tokens.join('],[')}]`; }
	let timer;
	const setAttr = () => {
	timer = undefined;	
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
	timer = self.requestAnimationFrame(setAttr);
	};
	const start = ( ) => {
	setAttr();
	if ( /\bloop\b/.test(run) === false ) { return; }
	const observer = new MutationObserver(mutationHandler);
	observer.observe(document.documentElement, {
	    attributes: true,
	    attributeFilter: tokens,
	    childList: true,
	    subtree: true,
	});
	};
	runAt(( ) => { start(); }, /\bcomplete\b/.test(run) ? 'idle' : 'interactive');
}
