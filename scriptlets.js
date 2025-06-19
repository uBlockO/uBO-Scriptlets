'use strict';

/// remove-node.js
/// world ISOLATED
/// alias rmn.js
/// dependency run-at.fn
/// dependency safe-self.fn
function removeNode(
	element = '',
	needle = ''
) {	
	  if ( element === '') { return; }
	  const safe = safeSelf();
	  const reNeedle = safe.patternToRegex(needle);
	  const removenode = () => {
		        try {
				const nodes = document.querySelectorAll(element);
				if ( nodes.length > 0 ) {
					for (const node of nodes) {
						if (reNeedle.test(node.outerHTML)) {
						    node.textContent = ''; 
					   }     
					}
				}	
			} catch { }
          };
	  let observer, timer;
    	  const onDomChanged = mutations => {
          if ( timer !== undefined ) { return; }
          let shouldWork = false;
          for ( const mutation of mutations ) {
            if ( mutation.addedNodes.length === 0 ) { continue; }
            for ( const node of mutation.addedNodes ) {
                if ( node.nodeType !== 1 ) { continue; }
                shouldWork = true;
                break;
            }
            if ( shouldWork ) { break; }
          }
          if ( shouldWork === false ) { return; }
          timer = self.requestAnimationFrame(( ) => {
            timer = undefined;
            removenode();
          });
          };
          const start = ( ) => {
          if ( removenode() === false ) { return; }
          observer = new MutationObserver(onDomChanged);
          observer.observe(document.body, {
            subtree: true,
            childList: true,
          });
          };
          runAt(( ) => { start(); }, 'interactive');
}

/// rename-attr.js
/// alias rna.js
/// world ISOLATED
/// dependency run-at.fn
// example.com##+js(rna, [selector], oldattr, newattr)
function renameAttr(
	selector = '',
	oldattr = '',
	newattr = ''
) {
	if ( selector === '' || oldattr === '' || newattr === '' ) { return; }
	const renameattr = ( ) => {
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
	let observer, timer;
    	const onDomChanged = mutations => {
        if ( timer !== undefined ) { return; }
        let shouldWork = false;
        for ( const mutation of mutations ) {
            if ( mutation.addedNodes.length === 0 ) { continue; }
            for ( const node of mutation.addedNodes ) {
                if ( node.nodeType !== 1 ) { continue; }
                shouldWork = true;
                break;
            }
            if ( shouldWork ) { break; }
        }
        if ( shouldWork === false ) { return; }
        timer = self.requestAnimationFrame(( ) => {
            timer = undefined;
            renameattr();
        });
        };
        const start = ( ) => {
        if ( renameattr() === false ) { return; }
        observer = new MutationObserver(onDomChanged);
        observer.observe(document.body, {
            subtree: true,
            childList: true,
        });
        };
        runAt(( ) => { start(); }, 'interactive');
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
	value = '' 
) {
	if ( selector === '' || oldattr === '' || newattr === '' ) { return; }
	const replaceattr = ( ) => {
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
	let observer, timer;
    	const onDomChanged = mutations => {
        if ( timer !== undefined ) { return; }
        let shouldWork = false;
        for ( const mutation of mutations ) {
            if ( mutation.addedNodes.length === 0 ) { continue; }
            for ( const node of mutation.addedNodes ) {
                if ( node.nodeType !== 1 ) { continue; }
                shouldWork = true;
                break;
            }
            if ( shouldWork ) { break; }
        }
        if ( shouldWork === false ) { return; }
        timer = self.requestAnimationFrame(( ) => {
            timer = undefined;
            replaceattr();
        });
        };
        const start = ( ) => {
        if ( replaceattr() === false ) { return; }
        observer = new MutationObserver(onDomChanged);
        observer.observe(document.body, {
            subtree: true,
            childList: true,
        });
        };
        runAt(( ) => { start(); }, 'interactive');
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
			      if ( !node.classList.contains(...needles) ) { 
			           node.classList.add(...needles);
			      }	
			}
		} catch { }
	};
	let observer, timer;
    	const onDomChanged = mutations => {
        if ( timer !== undefined ) { return; }
        let shouldWork = false;
        for ( const mutation of mutations ) {
            if ( mutation.addedNodes.length === 0 ) { continue; }
            for ( const node of mutation.addedNodes ) {
                if ( node.nodeType !== 1 ) { continue; }
                shouldWork = true;
                break;
            }
            if ( shouldWork ) { break; }
        }
        if ( shouldWork === false ) { return; }
        timer = self.requestAnimationFrame(( ) => {
            timer = undefined;
            addclass();
        });
        };
        const start = ( ) => {
        if ( addclass() === false ) { return; }
        observer = new MutationObserver(onDomChanged);
        observer.observe(document.body, {
            subtree: true,
            childList: true,
        });
        };
        runAt(( ) => { start(); }, 'interactive');
}

/// replace-class.js
/// alias rpc.js
/// world ISOLATED
/// dependency run-at.fn
// example.com##+js(rpc, [selector], oldclass, newclass)
function replaceClass(
	selector = '',
	oldclass = '',
	newclass = ''
) {
	if ( selector === '' || oldclass === '' || newclass === '' ) { return; }
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
	let observer, timer;
    	const onDomChanged = mutations => {
        if ( timer !== undefined ) { return; }
        let shouldWork = false;
        for ( const mutation of mutations ) {
            if ( mutation.addedNodes.length === 0 ) { continue; }
            for ( const node of mutation.addedNodes ) {
                if ( node.nodeType !== 1 ) { continue; }
                shouldWork = true;
                break;
            }
            if ( shouldWork ) { break; }
        }
        if ( shouldWork === false ) { return; }
        timer = self.requestAnimationFrame(( ) => {
            timer = undefined;
            replaceclass();
        });
        };
        const start = ( ) => {
        if ( replaceclass() === false ) { return; }
        observer = new MutationObserver(onDomChanged);
        observer.observe(document.body, {
            subtree: true,
            childList: true,
        });
        };
        runAt(( ) => { start(); }, 'interactive');
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
// example.com##+js(cf, funcName)
function callFunction(
	funcCall = ''
) {
	      if ( funcCall === '' ) { return; }
	      const funcInvoke = ( ) => { 
			try { 
				self.requestAnimationFrame(funcCall)
			} catch { }
	      };	      
	      runAt(( ) => { funcInvoke(); }, 'idle');
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
