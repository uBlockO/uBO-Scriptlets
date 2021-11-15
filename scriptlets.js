// Collection of userscripts to be used for scriptlet injection.

/// remove-shadowroot-elem.js
/// alias rsre.js
// example.com##+js(rsre, [selector])
(() => {
		  'use strict';
		  const selector = '{{1}}';
		  if ( selector === '' || selector === '{{1}}' ) { return; }
		  const behavior = '{{2}}';
		  let timer;
		  const queryShadowRootElement = (shadowRootElement, rootElement) => {
			if (!rootElement) {
			    return queryShadowRootElement(shadowRootElement, document.documentElement);
			}
			const els = rootElement.querySelectorAll(shadowRootElement);
			for (const el of els) { if (el) {return el;} }
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
			timer = undefined;
			try {
				const elem = queryShadowRootElement(selector);
				if (elem) { elem.remove(); }
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
			timer = self.requestIdleCallback(rmshadowelem, { timeout: 10 });
		  };
		  const start = ( ) => {
			rmshadowelem();
			if ( /\bloop\b/.test(behavior) === false ) { return; }
			const observer = new MutationObserver(mutationHandler);
			observer.observe(document.documentElement, {
			      attributes: true,
			      childList: true,
			      subtree: true,
			});
		  };
		  if ( document.readyState !== 'complete' && /\bcomplete\b/.test(behavior) ) {
			window.addEventListener('load', start, { once: true });
		     } else if ( document.readyState === 'loading' ) {
			window.addEventListener('DOMContentLoaded', start, { once: true });
		     } else {
			start();
		  }
})();

/// remove-node.js
/// alias rn.js
// example.com##+js(rn, /adblock|adsense/, script)
(() => { 
          'use strict';
          let needle = '{{1}}';
          if ( needle === '' || needle === '{{1}}' ) {
              needle = '^';
          } else if ( needle.slice(0,1) === '/' && needle.slice(-1) === '/' ) {
              needle = needle.slice(1,-1);
          } else {
              needle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          }
          needle = new RegExp(needle);
	  const remnode = () => {
		  			const nodes = document.querySelectorAll('{{2}}');
		  			try {
                                                  for (const node of nodes) {
							if (needle.test(node.outerHTML)) {
                                                            node.textContent = ''; 
						       	    node.remove(); 
                                                       }     
                                                  }
                                        } catch { }
          };
	  const observer = new MutationObserver(remnode);
    	  observer.observe(document.documentElement, { childList: true, subtree: true });
	  if ( document.readyState === "complete" ) { observer.disconnect(); }
})();

/// set-attr.js
/// alias sa.js
// example.com##+js(sa, preload, none, video)
(() => {
		  'use strict';
		  const token = '{{1}}';
		  if ( token === '' || token === '{{1}}' ) { return; }
		  const tokens = token.split(/\s*\|\s*/);
		  const attrValue = '{{2}}';
		  let selector = '{{3}}';
		  if ( selector === '' || selector === '{{3}}' ) { selector = `[${tokens.join('],[')}]`; }
	          let timer;
		  const behavior = '{{4}}';
		  const setattr = () => {
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
			window.addEventListener('load', start, { once: true });
		     } else if ( document.readyState === 'loading' ) {
			window.addEventListener('DOMContentLoaded', start, { once: true });
		     } else {
			start();
		  }
})();

/// create-elem.js
/// alias ce.js
// example.com##+js(ce, [selector], display:block !important, div)
(() => {
		'use strict';
		const identifier = '{{1}}';
		if ( identifier === '' || identifier === '{{1}}' ) { return; }
		const identifiers = identifier.split(/\s*\|\s*/);
		let executeOnce = false;
		const createelem = () => {
						if (executeOnce !== false) { return; }
						try {
							for (const token of identifiers) {
							     const element = document.createElement('{{3}}');
							     if (token.charAt(0) === '#') {
								 element.id = token.substring(1);
							     } else if (token.charAt(0) === '.') {
								 element.className = token.substring(1);
							     } else { return; }
							     element.style.cssText = '{{2}}';
							     document.body.append(element);	
							}	
							executeOnce = true;
						} catch { }
	   	};
	   	const observer = new MutationObserver(createelem);
    		observer.observe(document.documentElement, { childList: true, subtree: true });
})();

/// add-class.js
/// alias ac.js
// example.com##+js(ac, example, [selector])
(() => {
		    'use strict';
		    const needle = '{{1}}';
		    if ( needle === '' || needle === '{{1}}' ) { return; }
		    const needles = needle.split(/\s*\|\s*/);
		    let selector = '{{2}}';
		    if ( selector === '' || selector === '{{2}}' ) { selector = '.' + needles.map(a => CSS.escape(a)).join(',.'); }
		    const addclass = ev => {
						if (ev) { window.removeEventListener(ev.type, addclass, true);  }
						const nodes = document.querySelectorAll(selector);
						try {
							for ( const node of nodes ) {
							      node.classList.add(...needles);
							}
						} catch { }
		    };
		    if (document.readyState === 'loading') {
		    	      window.addEventListener('DOMContentLoaded', addclass, true);
	   	    } else {
		    	      addclass();
	   	    }
})();

/// multiup.js
/// alias mtu.js
// example.com##+js(mtu, form[action], button[link], action, link)
(() => {
		'use strict';
		const selector = '{{1}}';
		if ( selector === '' || selector === '{{1}}' ) { return; }
		const selector2 = '{{2}}';
		if ( selector2 === '' || selector2 === '{{2}}' ) { return; }
		const multiup = ev => {
						if (ev) { window.removeEventListener(ev.type, multiup, true); }
						try {
							const elem = document.querySelectorAll(selector);
							const elem2 = document.querySelectorAll(selector2);
							for (let i = 0; i < elem.length; i++) {
								elem[i].setAttribute('{{3}}', elem2[i].getAttribute('{{4}}'));
							}
						} catch { }
		};
		if (document.readyState === 'loading') {
		    	    window.addEventListener('DOMContentLoaded', multiup, true);
	   	} else {
		    	    multiup();
	   	}
})();

/// insert-iframe.js
/// alias ii.js
// example.com##+js(ii, 2, [selector], src, style)
(() => {
    	        'use strict';
		const iframes = '{{1}}';
		if ( iframes === '' || iframes === '{{1}}' ) { return; }
		let executeOnce = false;
		const insertframe = () => {
						  if (executeOnce !== false) { return; }
						  try {
							for ( let i = 0; i < iframes; i++ ) {
							      const iframe = document.createElement('iframe');
							      iframe.setAttribute('id', '{{2}}');
							      iframe.setAttribute('src', '{{3}}');
							      iframe.setAttribute('style', '{{4}}');
							      document.body.append(iframe);
							}
							executeOnce = true;
						  } catch { }
		};			
		const observer = new MutationObserver(insertframe);
    		observer.observe(document.documentElement, { childList: true, subtree: true });
})();

/// insert-elem-before.js
/// alias ieb.js
// example.com##+js(ieb, [selector], display:block !important, node, div)
(() => {
		'use strict';
		const identifier = '{{1}}';
		if ( identifier === '' || identifier === '{{1}}' ) { return; }
		const identifiers = identifier.split(/\s*\|\s*/);
		let executeOnce = false;
		const insertelem = () => {
						if (executeOnce !== false) { return; }
						try {
							for (const token of identifiers) {
							     const element = document.createElement('{{4}}');
							     const node = document.querySelector('{{3}}');
							     if (token.charAt(0) === '#') {
							    	 element.id = token.substring(1);
							     } else if (token.charAt(0) === '.') {
							    	 element.className = token.substring(1);
							     } else { return; }	 
							     element.style.cssText = '{{2}}';
							     document.body.insertBefore(element, node);
							}	
							executeOnce = true;
						} catch { }
	   	};
	   	const observer = new MutationObserver(insertelem);
    		observer.observe(document.documentElement, { childList: true, subtree: true });
})();

/// append-elem.js
/// alias ape.js
// example.com##+js(ape, [selector], element, attribute, value)
(() => {
		'use strict';
		const selector = '{{1}}';
		if ( selector === '' || selector === '{{1}}' ) { return; }
		const appendNode = ev => {
						if (ev) { window.removeEventListener(ev.type, appendNode, true); }
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
		    	    window.addEventListener('load', appendNode, true);
	   	}
})();

/// removeItem.js
/// alias ri.js
// example.com##+js(ri, key)
(() => {
		    'use strict';
		    const key = '{{1}}';
		    if ( key === '' || key === '{{1}}' ) { return; }
		    const keys = key.split(/\s*\|\s*/);
		    let timer;
	            const behavior = '{{2}}';
		    const removeItem = () => {
			  timer = undefined;
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
			window.addEventListener('load', start, { once: true });
		    } else if ( document.readyState === 'loading' ) {
			window.addEventListener('DOMContentLoaded', start, { once: true });
		    } else {
			start();
		    }
})();

/// setItem.js
/// alias si.js
// example.com##+js(si, key, value)
(() => {
		    'use strict';
		    const key = '{{1}}';
		    if ( key === '' || key === '{{1}}' ) { return; }
		    const keys = key.split(/\s*\|\s*/);
		    const value = '{{2}}';
		    let timer;
	            const behavior = '{{3}}';
		    const setItem = () => {
			  timer = undefined;
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
			window.addEventListener('load', start, { once: true });
		    } else if ( document.readyState === 'loading' ) {
			window.addEventListener('DOMContentLoaded', start, { once: true });
		    } else {
			start();
		    }
})();

/// executesitefunction.js
/// alias esf.js
// example.com##+js(esf, funcName, funcDelay)
(() => {
	      'use strict';
	      const funcCall = '{{1}}';
	      if ( funcCall === '' || funcCall === '{{1}}' ) { return; }
	      const funcDelay = '{{2}}';
	      if ( funcDelay === '' || funcDelay === '{{2}}' ) { return; }
	      const funcInvoke = ev => { 
		      				if (ev) { window.removeEventListener(ev.type, funcInvoke, true); }
		      				try { 
							setTimeout(window[funcCall], funcDelay);
						} catch { }
	      };	      
	      if (document.readyState === 'interactive' || document.readyState === 'complete') {
		    	    funcInvoke();
	      } else {
		    	    window.addEventListener('DOMContentLoaded', funcInvoke, true);
	      }
})();

/// no-alert-if.js
/// alias noaif.js
// example.com##+js(noaif, loading ad)
(() => {
                'use strict';
                let needle = '{{1}}';
                if ( needle === '{{1}}' ) { needle = ''; }
                const needleNot = needle.charAt(0) === '!';
                if ( needleNot ) { needle = needle.slice(1); }
                if ( needle.startsWith('/') && needle.endsWith('/') ) {
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

/// no-websocket-if.js
/// alias nowsif.js
// example.com##+js(nowsif, /^/)
(() => {
                'use strict';
                let needle = '{{1}}';
                if ( needle === '{{1}}' ) { needle = ''; }
                const needleNot = needle.charAt(0) === '!';
                if ( needleNot ) { needle = needle.slice(1); }
                if ( needle.startsWith('/') && needle.endsWith('/') ) {
                    needle = needle.slice(1, -1);
                } else if ( needle !== '' ) {
                    needle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }
                const log = needleNot === false && needle === '' ? console.log : undefined;
                const reNeedle = new RegExp(needle);
                self.WebSocket = new Proxy(self.WebSocket, {
                     construct: (target, args) => {
			      let params;
			      try {
                              	    params = String(args);
			      } catch { }	      
                              let defuse = false;
                              if ( log !== undefined ) {
                                   log('uBO: websocket("%s")', params);
                              } else if ( reNeedle.test(params) !== needleNot ) {
				   defuse = reNeedle.test(params) !== needleNot;
				   return new Object(new Response());
                              }
                              if ( !defuse ) {
                                    const ws = new target(...args);
                                    return ws;
                              }                                         
                     }
                });
})();

/// twitch-videoad.js
(function() {
    if ( /(^|\.)twitch\.tv$/.test(document.location.hostname) === false ) { return; }
    function declareOptions(scope) {
        scope.OPT_ROLLING_DEVICE_ID = true;
        scope.OPT_MODE_STRIP_AD_SEGMENTS = true;
        scope.OPT_MODE_NOTIFY_ADS_WATCHED = true;
        scope.OPT_MODE_NOTIFY_ADS_WATCHED_MIN_REQUESTS = true;
        scope.OPT_MODE_NOTIFY_ADS_WATCHED_RELOAD_PLAYER_ON_AD_SEGMENT = false;
        scope.OPT_BACKUP_PLAYER_TYPE = 'picture-by-picture';
        scope.OPT_REGULAR_PLAYER_TYPE = 'site';
        scope.OPT_INITIAL_M3U8_ATTEMPTS = 1;
        scope.OPT_ACCESS_TOKEN_PLAYER_TYPE = 'site';
        scope.AD_SIGNIFIER = 'stitched-ad';
        scope.LIVE_SIGNIFIER = ',live';
        scope.CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
        scope.StreamInfos = [];
        scope.StreamInfosByUrl = [];
        scope.CurrentChannelNameFromM3U8 = null;
        scope.gql_device_id = null;
        scope.gql_device_id_rolling = '';
        var charTable = [];for (var i = 97; i <= 122; i++) { charTable.push(String.fromCharCode(i)); } for (var i = 65; i <= 90; i++) { charTable.push(String.fromCharCode(i)); } for (var i = 48; i <= 57; i++) { charTable.push(String.fromCharCode(i)); }
        var bs = 'eVI6jx47kJvCFfFowK86eVI6jx47kJvC';
        var di = (new Date()).getYear() + (new Date()).getMonth() + ((new Date()).getDate() / 7) | 0;
        for (var i = 0; i < bs.length; i++) {
            scope.gql_device_id_rolling += charTable[(bs.charCodeAt(i) ^ di) % charTable.length];
        }
    }
    declareOptions(window);
    var twitchMainWorker = null;
    const oldWorker = window.Worker;
    window.Worker = class Worker extends oldWorker {
        constructor(twitchBlobUrl) {
            if (twitchMainWorker) {
                super(twitchBlobUrl);
                return;
            }
            var jsURL = getWasmWorkerUrl(twitchBlobUrl);
            if (typeof jsURL !== 'string') {
                super(twitchBlobUrl);
                return;
            }
            var newBlobStr = `
                ${processM3U8.toString()}
                ${hookWorkerFetch.toString()}
                ${declareOptions.toString()}
                ${getAccessToken.toString()}
                ${gqlRequest.toString()}
                ${makeGraphQlPacket.toString()}
                ${tryNotifyAdsWatchedM3U8.toString()}
                ${parseAttributes.toString()}
                declareOptions(self);
                self.addEventListener('message', function(e) {
                    if (e.data.key == 'UboUpdateDeviceId') {
                        gql_device_id = e.data.value;
                    }
                });
                hookWorkerFetch();
                importScripts('${jsURL}');
            `
            super(URL.createObjectURL(new Blob([newBlobStr])));
            twitchMainWorker = this;
            this.onmessage = function(e) {
                if (e.data.key == 'UboShowAdBanner') {
                    var adDiv = getAdDiv();
                    if (adDiv != null) {
                        adDiv.P.textContent = 'Blocking' + (e.data.isMidroll ? ' midroll' : '') + ' ads...';
                        adDiv.style.display = 'none';
                    }
                }
                else if (e.data.key == 'UboHideAdBanner') {
                    var adDiv = getAdDiv();
                    if (adDiv != null) {
                        adDiv.style.display = 'none';
                    }
                }
                else if (e.data.key == 'UboFoundAdSegment') {
                    onFoundAd(e.data.isMidroll, e.data.streamM3u8);
                }
                else if (e.data.key == 'UboChannelNameM3U8Changed') {
		}
                else if (e.data.key == 'UboReloadPlayer') {
                    reloadTwitchPlayer();
                }
                else if (e.data.key == 'UboPauseResumePlayer') {
                    reloadTwitchPlayer(false, true);
                }
                else if (e.data.key == 'UboSeekPlayer') {
                    reloadTwitchPlayer(true);
                }
            }
            function getAdDiv() {
                var playerRootDiv = document.querySelector('.video-player');
                var adDiv = null;
                if (playerRootDiv != null) {
                    adDiv = playerRootDiv.querySelector('.ubo-overlay');
                    if (adDiv == null) {
                        adDiv = document.createElement('div');
                        adDiv.className = 'ubo-overlay';
                        adDiv.innerHTML = '<div class="player-ad-notice" style="color: white; background-color: rgba(0, 0, 0, 0.8); position: absolute; top: 0px; left: 0px; padding: 10px;"><p></p></div>';
                        adDiv.style.display = 'none';
                        adDiv.P = adDiv.querySelector('p');
                        playerRootDiv.appendChild(adDiv);
                    }
                }
                return adDiv;
            }
        }
    }
    function getWasmWorkerUrl(twitchBlobUrl) {
        var req = new XMLHttpRequest();
        req.open('GET', twitchBlobUrl, false);
        req.send();
        return req.responseText.split("'")[1];
    }
    async function processM3U8(url, textStr, realFetch) {
        var streamInfo = StreamInfosByUrl[url];
        if (streamInfo == null) {
            console.log('Unknown stream url ' + url);
            postMessage({key:'UboHideAdBanner'});
            return textStr;
        }
        if (!OPT_MODE_STRIP_AD_SEGMENTS) {
            return textStr;
        }
        var haveAdTags = textStr.includes(AD_SIGNIFIER);
        if (haveAdTags) {
            var currentResolution = null;
            for (const [resUrl, resName] of Object.entries(streamInfo.Urls)) {
                if (resUrl == url) {
                    currentResolution = resName;
                    break;
                }
            }
            streamInfo.HadAds = true;
            streamInfo.IsMidroll = textStr.includes('"MIDROLL"') || textStr.includes('"midroll"');
            postMessage({key:'UboShowAdBanner',isMidroll:streamInfo.IsMidroll});
            if (OPT_MODE_NOTIFY_ADS_WATCHED && !streamInfo.IsMidroll && (streamInfo.BackupFailed || streamInfo.BackupUrl != null)) {
                await tryNotifyAdsWatchedM3U8(textStr);
            }
            postMessage({
                key: 'UboFoundAdSegment',
                isMidroll: streamInfo.IsMidroll,
                streamM3u8: textStr
            });
            if (!streamInfo.IsMidroll && OPT_MODE_NOTIFY_ADS_WATCHED_RELOAD_PLAYER_ON_AD_SEGMENT) {
                return '';
            }
	    try {
                if (streamInfo.BackupRegRes != currentResolution) {
                    streamInfo.BackupRegRes = null;
                    streamInfo.BackupRegUrl = null;
                }
                if (currentResolution && streamInfo.BackupRegUrl == null && (streamInfo.BackupFailed || streamInfo.BackupUrl != null)) {
                    var accessTokenResponse = await getAccessToken(streamInfo.ChannelName, OPT_REGULAR_PLAYER_TYPE);
                    if (accessTokenResponse.status === 200) {
                        var accessToken = await accessTokenResponse.json();
                        var urlInfo = new URL('https://usher.ttvnw.net/api/channel/hls/' + streamInfo.ChannelName + '.m3u8' + streamInfo.RootM3U8Params);
                        urlInfo.searchParams.set('sig', accessToken.data.streamPlaybackAccessToken.signature);
                        urlInfo.searchParams.set('token', accessToken.data.streamPlaybackAccessToken.value);
                        var encodingsM3u8Response = await realFetch(urlInfo.href);
                        if (encodingsM3u8Response.status === 200) {
                            var encodingsM3u8 = await encodingsM3u8Response.text();
                            var encodingsLines = encodingsM3u8.replace('\r', '').split('\n');
                            for (var i = 0; i < encodingsLines.length; i++) {
                                if (!encodingsLines[i].startsWith('#') && encodingsLines[i].includes('.m3u8')) {
                                    if (i > 0 && encodingsLines[i - 1].startsWith('#EXT-X-STREAM-INF')) {
                                        var res = parseAttributes(encodingsLines[i - 1])['RESOLUTION'];
                                        if (res && res == currentResolution) {
                                            streamInfo.BackupRegUrl = encodingsLines[i];
                                            streamInfo.BackupRegRes = currentResolution;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (streamInfo.BackupRegUrl != null) {
                    var backupM3u8 = null;
                    var backupM3u8Response = await realFetch(streamInfo.BackupRegUrl);
                    if (backupM3u8Response.status == 200) {
                        backupM3u8 = await backupM3u8Response.text();
                    }
                    if (backupM3u8 != null && !backupM3u8.includes(AD_SIGNIFIER)) {
                        return backupM3u8;
                    } else {
                        streamInfo.BackupRegRes = null;
                        streamInfo.BackupRegUrl = null;
                    }
                }
            } catch (err) {
                streamInfo.BackupRegRes = null;
                streamInfo.BackupRegUrl = null;
                console.log('Fetching backup (regular resolution) m3u8 failed');
                console.log(err);
            }
            try {
                if (!streamInfo.BackupFailed && streamInfo.BackupUrl == null) {
                    streamInfo.BackupFailed = true;
                    var accessTokenResponse = await getAccessToken(streamInfo.ChannelName, OPT_BACKUP_PLAYER_TYPE);
                    if (accessTokenResponse.status === 200) {
                        var accessToken = await accessTokenResponse.json();
                        var urlInfo = new URL('https://usher.ttvnw.net/api/channel/hls/' + streamInfo.ChannelName + '.m3u8' + streamInfo.RootM3U8Params);
                        urlInfo.searchParams.set('sig', accessToken.data.streamPlaybackAccessToken.signature);
                        urlInfo.searchParams.set('token', accessToken.data.streamPlaybackAccessToken.value);
                        var encodingsM3u8Response = await realFetch(urlInfo.href);
                        if (encodingsM3u8Response.status === 200) {
                            var encodingsM3u8 = await encodingsM3u8Response.text();
                            var streamM3u8Url = encodingsM3u8.match(/^https:.*\.m3u8$/m)[0];
                            var streamM3u8Response = await realFetch(streamM3u8Url);
                            if (streamM3u8Response.status == 200) {
                                streamInfo.BackupFailed = false;
                                streamInfo.BackupUrl = streamM3u8Url;
                                console.log('Fetched backup url: ' + streamInfo.BackupUrl);
                            } else {
                                console.log('Backup url request (streamM3u8) failed with ' + streamM3u8Response.status);
                            }
                        } else {
                            console.log('Backup url request (encodingsM3u8) failed with ' + encodingsM3u8Response.status);
                        }
                    } else {
                        console.log('Backup url request (accessToken) failed with ' + accessTokenResponse.status);
                    }
                }
                if (streamInfo.BackupUrl != null) {
                    var backupM3u8 = null;
                    var backupM3u8Response = await realFetch(streamInfo.BackupUrl);
                    if (backupM3u8Response.status == 200) {
                        backupM3u8 = await backupM3u8Response.text();
                    }
                    if (backupM3u8 != null && !backupM3u8.includes(AD_SIGNIFIER)) {
                        return backupM3u8;
                    } else {
                        console.log('Backup m3u8 failed with ' + backupM3u8Response.status);
                    }
                }
            } catch (err) {
                console.log('Fetching backup m3u8 failed');
                console.log(err);
            }
            console.log('Ad blocking failed. Stream might break.');
            postMessage({key:'UboReloadPlayer'});
            streamInfo.BackupFailed = false;
            streamInfo.BackupUrl = null;
            return '';
        }
        if (streamInfo.HadAds) {
            postMessage({key:'UboPauseResumePlayer'});
            streamInfo.HadAds = false;
        }
        postMessage({key:'UboHideAdBanner'});
        return textStr;
    }
    function hookWorkerFetch() {
        var realFetch = fetch;
        fetch = async function(url, options) {
            if (typeof url === 'string') {
                if (url.endsWith('m3u8')) {
                    return new Promise(function(resolve, reject) {
                        var processAfter = async function(response) {
                            var str = await processM3U8(url, await response.text(), realFetch);
                            resolve(new Response(str));
                        };
                        var send = function() {
                            return realFetch(url, options).then(function(response) {
                                processAfter(response);
                            })['catch'](function(err) {
                                console.log('fetch hook err ' + err);
                                reject(err);
                            });
                        };
                        send();
                    });
                }
                else if (url.includes('/api/channel/hls/') && !url.includes('picture-by-picture')) {
                    var channelName = (new URL(url)).pathname.match(/([^\/]+)(?=\.\w+$)/)[0];
                    if (CurrentChannelNameFromM3U8 != channelName) {
                        postMessage({
                            key: 'UboChannelNameM3U8Changed',
                            value: channelName
                        });
                    }
                    CurrentChannelNameFromM3U8 = channelName;
                    if (OPT_MODE_STRIP_AD_SEGMENTS) {
                        return new Promise(async function(resolve, reject) {
                            var maxAttempts = OPT_INITIAL_M3U8_ATTEMPTS <= 0 ? 1 : OPT_INITIAL_M3U8_ATTEMPTS;
                            var attempts = 0;
                            while(true) {
                                var encodingsM3u8Response = await realFetch(url, options);
                                if (encodingsM3u8Response.status === 200) {
                                    var encodingsM3u8 = await encodingsM3u8Response.text();
                                    var streamM3u8Url = encodingsM3u8.match(/^https:.*\.m3u8$/m)[0];
                                    var streamM3u8Response = await realFetch(streamM3u8Url);
                                    var streamM3u8 = await streamM3u8Response.text();
                                    if (!streamM3u8.includes(AD_SIGNIFIER) || ++attempts >= maxAttempts) {
                                        if (maxAttempts > 1 && attempts >= maxAttempts) {
                                            console.log('max skip ad attempts reached (attempt #' + attempts + ')');
                                        }
                                        var streamInfo = StreamInfos[channelName];
                                        if (streamInfo == null) {
                                            StreamInfos[channelName] = streamInfo = {};
                                        }
                                        streamInfo.ChannelName = channelName;
                                        streamInfo.Urls = [];
                                        streamInfo.RootM3U8Url = url;
                                        streamInfo.RootM3U8Params = (new URL(url)).search;
                                        streamInfo.BackupUrl = null;
                                        streamInfo.BackupFailed = false;
                                        streamInfo.BackupRegUrl = null;
                                        streamInfo.BackupRegRes = null;
                                        streamInfo.IsMidroll = false;
                                        streamInfo.HadAds = false;
                                        var lines = encodingsM3u8.replace('\r', '').split('\n');
                                        for (var i = 0; i < lines.length; i++) {
                                            if (!lines[i].startsWith('#') && lines[i].includes('.m3u8')) {
                                                streamInfo.Urls[lines[i]] = -1;
                                                if (i > 0 && lines[i - 1].startsWith('#EXT-X-STREAM-INF')) {
                                                    var res = parseAttributes(lines[i - 1])['RESOLUTION'];
                                                    if (res) {
                                                        streamInfo.Urls[lines[i]] = res;
                                                    }
                                                }
                                                StreamInfosByUrl[lines[i]] = streamInfo;
                                            }
                                        }
                                        resolve(new Response(encodingsM3u8));
                                        break;
                                    }
                                    console.log('attempt to skip ad (attempt #' + attempts + ')');
                                } else {
                                    resolve(encodingsM3u8Response);
                                    break;
                                }
                            }
                        });
                    }
                }
            }
            return realFetch.apply(this, arguments);
        }
    }
    function makeGraphQlPacket(event, radToken, payload) {
        return [{
            operationName: 'ClientSideAdEventHandling_RecordAdEvent',
            variables: {
                input: {
                    eventName: event,
                    eventPayload: JSON.stringify(payload),
                    radToken,
                },
            },
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash: '7e6c69e6eb59f8ccb97ab73686f3d8b7d85a72a0298745ccd8bfc68e4054ca5b',
                },
            },
        }];
    }
    function getAccessToken(channelName, playerType, realFetch) {
        var body = null;
        var templateQuery = 'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}';
        body = {
            operationName: 'PlaybackAccessToken_Template',
            query: templateQuery,
            variables: {
                'isLive': true,
                'login': channelName,
                'isVod': false,
                'vodID': '',
                'playerType': playerType
            }
        };
        return gqlRequest(body, realFetch);
    }
    function gqlRequest(body, realFetch) {
        var fetchFunc = realFetch ? realFetch : fetch;
        return fetchFunc('https://gql.twitch.tv/gql', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'client-id': CLIENT_ID,
                'X-Device-Id': OPT_ROLLING_DEVICE_ID ? gql_device_id_rolling : gql_device_id
            }
        });
    }
    function parseAttributes(str) {
        return Object.fromEntries(
            str.split(/(?:^|,)((?:[^=]*)=(?:"[^"]*"|[^,]*))/)
                .filter(Boolean)
                .map(x => {
                    const idx = x.indexOf('=');
                    const key = x.substring(0, idx);
                    const value = x.substring(idx +1);
                    const num = Number(value);
                    return [key, Number.isNaN(num) ? value.startsWith('"') ? JSON.parse(value) : value : num]
                }));
    }
    async function tryNotifyAdsWatchedM3U8(streamM3u8) {
        try {
            //console.log(streamM3u8);
            if (!streamM3u8.includes(AD_SIGNIFIER)) {
                return 1;
            }
            var matches = streamM3u8.match(/#EXT-X-DATERANGE:(ID="stitched-ad-[^\n]+)\n/);
            if (matches.length > 1) {
                const attrString = matches[1];
                const attr = parseAttributes(attrString);
                var podLength = parseInt(attr['X-TV-TWITCH-AD-POD-LENGTH'] ? attr['X-TV-TWITCH-AD-POD-LENGTH'] : '1');
                var podPosition = parseInt(attr['X-TV-TWITCH-AD-POD-POSITION'] ? attr['X-TV-TWITCH-AD-POD-POSITION'] : '0');
                var radToken = attr['X-TV-TWITCH-AD-RADS-TOKEN'];
                var lineItemId = attr['X-TV-TWITCH-AD-LINE-ITEM-ID'];
                var orderId = attr['X-TV-TWITCH-AD-ORDER-ID'];
                var creativeId = attr['X-TV-TWITCH-AD-CREATIVE-ID'];
                var adId = attr['X-TV-TWITCH-AD-ADVERTISER-ID'];
                var rollType = attr['X-TV-TWITCH-AD-ROLL-TYPE'].toLowerCase();
                const baseData = {
                    stitched: true,
                    roll_type: rollType,
                    player_mute: false,
                    player_volume: 0.5,
                    visible: true,
                };
                for (let podPosition = 0; podPosition < podLength; podPosition++) {
                    if (OPT_MODE_NOTIFY_ADS_WATCHED_MIN_REQUESTS) {
			    await gqlRequest(makeGraphQlPacket('video_ad_pod_complete', radToken, baseData));
                    } else {
                        const extendedData = {
                            ...baseData,
                            ad_id: adId,
                            ad_position: podPosition,
                            duration: 30,
                            creative_id: creativeId,
                            total_ads: podLength,
                            order_id: orderId,
                            line_item_id: lineItemId,
                        };
                        await gqlRequest(makeGraphQlPacket('video_ad_impression', radToken, extendedData));
                        for (let quartile = 0; quartile < 4; quartile++) {
                            await gqlRequest(
                                makeGraphQlPacket('video_ad_quartile_complete', radToken, {
                                    ...extendedData,
                                    quartile: quartile + 1,
                                })
                            );
                        }
                        await gqlRequest(makeGraphQlPacket('video_ad_pod_complete', radToken, baseData));
                    }
                }
            }
            return 0;
        } catch (err) {
            console.log(err);
            return 0;
        }
    }
    function hookFetch() {
        var realFetch = window.fetch;
        window.fetch = function(url, init, ...args) {
            if (typeof url === 'string') {
                if (url.includes('/access_token') || url.includes('gql')) {
                    if (OPT_ACCESS_TOKEN_PLAYER_TYPE) {
                        if (url.includes('gql') && init && typeof init.body === 'string' && init.body.includes('PlaybackAccessToken')) {
                            const newBody = JSON.parse(init.body);
                            newBody.variables.playerType = OPT_ACCESS_TOKEN_PLAYER_TYPE;
                            init.body = JSON.stringify(newBody);
                        }
                    }
                    var deviceId = init.headers['X-Device-Id'];
                    if (typeof deviceId !== 'string') {
                        deviceId = init.headers['Device-ID'];
                    }
                    if (typeof deviceId === 'string') {
                        gql_device_id = deviceId;
                    }
                    if (gql_device_id && twitchMainWorker) {
                        twitchMainWorker.postMessage({
                            key: 'UboUpdateDeviceId',
                            value: gql_device_id
                        });
                    }
                    if (OPT_ROLLING_DEVICE_ID) {
                        if (typeof init.headers['X-Device-Id'] === 'string') {
                            init.headers['X-Device-Id'] = gql_device_id_rolling;
                        }
                        if (typeof init.headers['Device-ID'] === 'string') {
                            init.headers['Device-ID'] = gql_device_id_rolling;
                        }
                    }
                }
            }
            return realFetch.apply(this, arguments);
        }
    }
    function onFoundAd(isMidroll, streamM3u8) {
        if (OPT_MODE_NOTIFY_ADS_WATCHED_RELOAD_PLAYER_ON_AD_SEGMENT && !isMidroll) {
            console.log('OPT_MODE_NOTIFY_ADS_WATCHED_RELOAD_PLAYER_ON_AD_SEGMENT');
            if (streamM3u8) {
                tryNotifyAdsWatchedM3U8(streamM3u8);
            }
            reloadTwitchPlayer();
        }
    }
    function reloadTwitchPlayer(isSeek, isPausePlay) {
	function findReactNode(root, constraint) {
            if (root.stateNode && constraint(root.stateNode)) {
                return root.stateNode;
            }
            let node = root.child;
            while (node) {
                const result = findReactNode(node, constraint);
                if (result) {
                    return result;
                }
                node = node.sibling;
            }
            return null;
        }
        var reactRootNode = null;
        var rootNode = document.querySelector('#root');
        if (rootNode && rootNode._reactRootContainer && rootNode._reactRootContainer._internalRoot && rootNode._reactRootContainer._internalRoot.current) {
            reactRootNode = rootNode._reactRootContainer._internalRoot.current;
        }
        if (!reactRootNode) {
            console.log('Could not find react root');
            return;
        }
        var player = findReactNode(reactRootNode, node => node.setPlayerActive && node.props && node.props.mediaPlayerInstance);
        player = player && player.props && player.props.mediaPlayerInstance ? player.props.mediaPlayerInstance : null;
        var playerState = findReactNode(reactRootNode, node => node.setSrc && node.setInitialPlaybackSettings);
        if (!player) {
            console.log('Could not find player');
            return;
        }
        if (!playerState) {
            console.log('Could not find player state');
            return;
        }
        if (player.paused) {
            return;
        }
        if (isSeek) {
            console.log('Force seek to reset player (hopefully fixing any audio desync)');
            player.seekTo(0);
            return;
        }
        if (isPausePlay) {
            player.pause();
            player.play();
            return;
        }
        const sink = player.mediaSinkManager || (player.core ? player.core.mediaSinkManager : null);
        if (sink && sink.video && sink.video._ffz_compressor) {
            const video = sink.video;
            const volume = video.volume ? video.volume : player.getVolume();
            const muted = player.isMuted();
            const newVideo = document.createElement('video');
            newVideo.volume = muted ? 0 : volume;
            newVideo.playsInline = true;
            video.replaceWith(newVideo);
            player.attachHTMLVideoElement(newVideo);
            setImmediate(() => {
                player.setVolume(volume);
                player.setMuted(muted);
            });
        }
        playerState.setSrc({ isNewMediaPlayerInstance: true, refreshAccessToken: true });
    }
    window.reloadTwitchPlayer = reloadTwitchPlayer;
    hookFetch();
    function onContentLoaded() {
        Object.defineProperty(document, 'visibilityState', {
            get() {
                return 'visible';
            }
        });
        Object.defineProperty(document, 'hidden', {
            get() {
                return false;
            }
        });
        const block = e => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        };
        document.addEventListener('visibilitychange', block, true);
        document.addEventListener('webkitvisibilitychange', block, true);
        document.addEventListener('mozvisibilitychange', block, true);
        document.addEventListener('hasFocus', block, true);
        if (/Firefox/.test(navigator.userAgent)) {
            Object.defineProperty(document, 'mozHidden', {
                get() {
                    return false;
                }
            });
        } else {
            Object.defineProperty(document, 'webkitHidden', {
                get() {
                    return false;
                }
            });
        }
    }
    if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
        onContentLoaded();
    } else {
        window.addEventListener("DOMContentLoaded", function() {
            onContentLoaded();
        });
    }
})();
