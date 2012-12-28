var ec = ec || {
	version: '0.1.241',
	debug: 0
};

(function(window) {
	'use strict';

	window.ec = ec;
	var document = window.document;
	
	ec.debug = 0;//ec.mobile ? 1 : 2;
	
	var world;
	var maps;
	var view;
	var worldView;
	var creditsView;
	var debugView;
	var cpDebugView;
	
	var TIME_STEP = ec.TIME_STEP = 1000/60;
	var paused = false;
	var delta, deltaTime, remainder;

	var userInput;
	var bossInput;
	var player;
	var boss;
	var overlay = null;

	var rafId;

	var sound;

	var WATCH_DEAD_BOSS_DURATION = 2000;

	var required = ('extend,resizeDisplay,addBrowserListeners,Entity,Box,Circle,EmptyHand,Player,Ninja,Puff,MapElement,World,Canvas2dView,Canvas2dWorldView,Canvas2dMapView,Canvas2dEntityView,Canvas2dCreditsView,TextField,ChipmunkDebugView,DebugView,UserInput,EnemyInput,SpriteSheets,ButtonOverlay,Sound').split(',');
	var globalRequired = ('cp,createjs,Stats').split(',');
	//'SpriteSheet,Rectangle'

	var hasProperties = function(obj, props) {
		for (var i = 0, len = props.length; i < len; i++) {
			if (obj[props[i]] === undefined) {
				return false;
			}
		}
		return true;
	};

	var core = ec.core = {

		load: function(time) {
			if (!hasProperties(window, globalRequired) || !hasProperties(ec, required)) {
				console.log('loading');
				requestAnimationFrame( core.load );
				return;
			}

			// TODO: preload sprite sheets

			sound = new ec.Sound();

			console.log('init');
			core.init(time);
		},

		init: function(time) {
			deltaTime = time;
		    remainder = 0;
		    
			rafId = requestAnimationFrame( core.animate );

			userInput = new ec.UserInput();
			bossInput = new ec.EnemyInput();
		    ec.world =
		    world = new ec.World();

			ec.resizeDisplay();


			ec.SpriteSheets.init();

			// THREE.js View
		    // view = new ec.ThreeJsWorldView();

		    // Dummy View
		    // view = {};
		    // view.pause = view.resume = view.draw = function(){};

		    // Canvas 2d Context View
		    view = view || new ec.Canvas2dView();
		    view.removeAll();
		    worldView = new ec.Canvas2dWorldView(world);
		    view.add(worldView);
		    view.add(userInput);
		    ec.view = view;

		    if (!world.map) {
				ec.core.cycleMap();
		    }

		    cpDebugView = new ec.ChipmunkDebugView(world.space);
		    debugView = new ec.DebugView();
		    if (ec.debug) {
				ec.core.setDebugLevel(ec.debug);
			}

		    ec.addBrowserListeners(userInput);

		    if (ec.touch) {
				var scaledWidth  = view.width  * ec.pixelRatio;
				var scaledHeight = view.height * ec.pixelRatio;
				ec.ButtonOverlay.viewWidth  = scaledWidth;
				ec.ButtonOverlay.viewHeight = scaledHeight;
				userInput.setLeftStickOverlay(userInput.addButtonOverlay(new ec.ButtonOverlay({x: 160,    y: scaledHeight-160, radius: 150})));
				userInput.setRightStickOverlay(userInput.addButtonOverlay(new ec.ButtonOverlay({x: scaledWidth-160,  y: scaledHeight-160, radius: 150})));

				var pauseButton = userInput.addButtonOverlay(new ec.ButtonOverlay({x: scaledWidth, y: 50, radius: 150}));
				var debugButton = userInput.addButtonOverlay(new ec.ButtonOverlay({x: 0, y: 50,   radius: 150}));
				ec.bind(pauseButton, 'touchend', ec.core.togglePause, false);
				ec.bind(debugButton, 'touchend', ec.core.cycleDebug, false);
		    }

		    // hideUrlBarOnLoad
			if (ec.mobile) {
				window.scrollTo( 0, 1 );
			}

			paused = true;
			overlay = new Image();
			overlay.src = 'img/ui/startscreen.png?v=' + ec.version;


			worldView.lookAt(player.body.p.x, -player.body.p.y);

			if (ec.touch) {
				ec.bind(ec.core.getViewDom(), 'touchend', ec.core.start, false);
			} else {
				ec.bind(ec.core.getViewDom(), 'mouseup', ec.core.start, false);
			}

			// GUI Settings
			if (!ec.touch) {
				// debugView.worldGui(world);
				// view.debugGui(debugView);
			}

			ec.core.trackEvent('core', 'inited', ec.version, undefined, true);

			sound.stop();
		},

		start: function(e) {
			ec.unbind(ec.core.getViewDom(), e.type, ec.core.start, false);

			overlay = null;
			if (ec.playerInteractions < 1) {
				overlay = new Image();
				if (!ec.touch) {
					overlay.src = 'img/ui/guide-move-desktop.png?v=' + ec.version;
					ec.core.trackEvent('game', 'guide', 'guide-move-desktop');
				} else {
					overlay.src = 'img/ui/guide-touch.png?v=' + ec.version;
					ec.core.trackEvent('game', 'guide', 'guide-touch');
				}
			}
			
			sound.playGameMusic();
		},

		cycleMap: function() {
			console.log('cycleMap');
			if (!world || !maps) {
				console.error('cycleMap requires world and maps data', world, maps);
				return;
			}
			var map = maps.courtyard;
			if (world.map === map) {
				map = maps.testmap;
			}
			if (world.space) {
				if (world.contains(player.attack)) {
					world.remove(player.attack);
				}
				world.remove(player);
				world.remove(boss);
			}
			world.setMap(map);
			worldView.loadMap();
			if (cpDebugView) {
				cpDebugView.setSpace(world.space);
			}

			//place player and npcs
			// monk
			if (!player) {
				ec.player =
				player = new ec.Player().setInput(userInput);
			}
			player.setPos(map.width/2, map.height/2+450, 0);//player.setPos(1280, 2930, 0);
			world.add(player);

		    // ninja
		    if (!boss) {
				boss = new ec.Ninja().setInput(bossInput);
		    }
			boss.setPos(map.width/2+200, map.height/2, 0);//boss.setPos(1424, 2632, 0);
			bossInput.completeTask();
		    world.add(boss);
		},

		userReady: function() {
			if (overlay) {
				if (!ec.touch) {
					overlay = null;
					overlay = new Image();
					overlay.src = 'img/ui/guide-fight-desktop.png?v=' + ec.version;
					ec.core.trackEvent('game', 'guide', 'guide-fight-desktop');
				}
			}
		},

		userPlaying: function() {
			overlay = null;
		},

		rollCredits: function() {
			ec.playerInteractions = 36;
			ec.core.trackEvent('game', 'credits', ec.version);

			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame( core.animateCredits );

			creditsView = creditsView || new ec.Canvas2dCreditsView();
			creditsView.init(view.context);
			view.removeAll();
			view.add(creditsView);

			if (ec.touch) {
				ec.bind(ec.core.getViewDom(), 'touchend', ec.core.restart, false);
			} else {
				ec.bind(ec.core.getViewDom(), 'mouseup', ec.core.restart, false);
			}

			world.term();

			sound.playEndingMusic();
		},

		restart: function(e) {
			if (creditsView.creditsTime < creditsView.skipAfter) {
				return;
			}
			ec.unbind(ec.core.getViewDom(), e.type, ec.core.restart, false);

			view.remove(creditsView);
			overlay = null;

			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame( core.init );
		},

		animateCredits: function(time) {
			rafId = requestAnimationFrame( core.animateCredits );

			if (ec.debug > 0) {
				debugView.stats.begin();
			}

			delta = (time - deltaTime);
			deltaTime = time;
			delta = Math.max(TIME_STEP, Math.min(delta, TIME_STEP*10));

			if (ec.debug < 3) {
				view.draw(delta);
			}

			if (ec.debug > 0) {
				debugView.stats.end();
			}
		},

		animate: function(time) {
			rafId = requestAnimationFrame( core.animate );
			
			if (ec.debug > 0) {
				debugView.stats.begin();
			}
			
			delta = (time - deltaTime);
			deltaTime = time;

			delta = Math.max(TIME_STEP, Math.min(delta, TIME_STEP*10));

			if (!paused) {
				remainder += delta;
				while(remainder >= TIME_STEP) {
					remainder -= TIME_STEP;
					world.step(TIME_STEP);
				}

				worldView.lookAt(player.body.p.x, -player.body.p.y -player.z);
			}
			if (boss.state === 'dead') {
				boss.decomposed = boss.decomposed || 0;
				boss.decomposed += delta;
				if (boss.decomposed > WATCH_DEAD_BOSS_DURATION) {
					delete boss.decomposed;
					ec.core.rollCredits();
					return;
				}
			}
			if (ec.debug < 3) {
				view.draw(delta);
			}

		    if (ec.debug > 0) {
			    if (ec.debug > 1) {
					cpDebugView.step(view);
			    }
				debugView.stats.end();
			}
		},

		getOverlay: function() {
			return overlay;
		},

		pause: function() {
			console.log('pause');
			paused = true;
			view.pause();
			ec.allowPinchZoom();
		},

		resume: function() {
			console.log('resume');
			paused = false;
			view.resume();
			ec.preventPinchZoom();
		},

		togglePause: function() {
			if (ec.core.paused()) {
				ec.core.resume();
			} else {
				ec.core.pause();
			}
		},

		paused: function() {
			return paused;
		},

		fullscreen: function() {
			if (ec.fullscreen) {
				var element = document.body;
				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
				element.requestFullscreen();
			}
		},

		resize: function() {
			if (ec.resizeDisplay()) {
				view.resize(ec.width, ec.height, ec.pixelRatio);
				cpDebugView.resize();
			}
		},

		zoom: function(value) {
			return worldView.zoom(value);
		},

		getViewDom: function() {
			return view.getDom();
		},

		trackPage: function(route) {
			if (window._gaq) {
				window._gaq.push(['_trackPageview', route]);
			}
		},

		trackEvent: function(category, action, label, value, nonInteraction) {
			if (window._gaq) {
				window._gaq.push(['_trackEvent', category, action, label, value, nonInteraction]);
			}
		},

		trackCustom: function(index, name, value, scope) {
			if (window._gaq) {
				window._gaq.push(['_setCustomVar', index, name, value, scope]);
			}
		},

		setDebugLevel: function(level) {
			if (level < 0) {
				level = 3;
			}
			debugView.hide();
			cpDebugView.hide();
			switch (level) {
				case 3:
				case 2:
					cpDebugView.show();
					/*falls through*/
				case 1:
					debugView.show();
			}
			ec.debug = level;
			console.log('debug level', level);
		},

		cycleDebug: function() {
			ec.core.setDebugLevel(ec.debug-1);
		}
	};

	// loadMap JSONp callback

	ec.loadMap = function(data) {
		maps = maps || {};
		maps[data.name] = data;
		if (world && !world.map) {
			ec.core.cycleMap();
	    }
	};

	// utils

	ec.extend = function( target, source ) {
        for ( var prop in source ) {
			if ( source.hasOwnProperty( prop ) ) {
	            if ( !target.hasOwnProperty( prop ) ) {
					var copy = source[ prop ];
					if (copy !== undefined) {
						target[ prop ] = source[ prop ];
					}
	            }
	        }
        }
        return target;
    };

    ec.create = function(obj) {
		function F() {}
		F.prototype = obj;
		return new F();
    };

	ec.delegate = function(obj, func) {
		return function() {
			return func.apply(obj, arguments);
		};
	};

	// tests

	var prefixed = function(str, obj) {
		return obj[str] || obj['webkit' + str] || obj['moz' + str] || obj['o' + str] || obj['ms' + str];
	};

	ec.touch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
	ec.mobile = (/iPhone|iPad|iPod|Android/).test(navigator.userAgent);
	ec.ios = (/iPhone|iPad|iPod/).test(navigator.userAgent);
	ec.ipad = (/iPad/).test(navigator.userAgent);
	ec.android = (/Android/).test(navigator.userAgent);
	ec.standalone = !!navigator.standalone;
	ec.webgl = !!window.WebGLRenderingContext;
	ec.fullscreen = !!prefixed('cancelFullScreen', document);
	ec.webaudio   = !!prefixed('AudioContext', window);
	ec.gamepads   = !!prefixed('getGamepads', navigator);


	// polyfills

	if (!Date.now) {
		Date.now = function now() {
	        return +(new Date());
	    };
	}

	// requestAnimationFrame polyfill by Erik Möller
	// fixes from Paul Irish and Tino Zijdel
	var requestAnimationFrame = window.requestAnimationFrame || prefixed('RequestAnimationFrame', window);
	var cancelAnimationFrame = window.cancelAnimationFrame || prefixed('CancelAnimationFrame', window) || prefixed('CancelRequestAnimationFrame', window) || function ( id ) { window.clearTimeout( id ); };
	if (!requestAnimationFrame) {
		var lastTime = 0;
		requestAnimationFrame = function ( callback, element ) {
			var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	var applicationCache = window.applicationCache;
	if (applicationCache) {
		applicationCache.addEventListener('updateready', function(e) {
			if (applicationCache.status === applicationCache.UPDATEREADY) {
				console.log('cache updated', e);
				applicationCache.swapCache();
				// TODO: reload images
			}
		}, false);
	}

	//window.onReady(core.init);
	requestAnimationFrame( core.load );

	ec.core.trackEvent('core', 'preload', ec.version, undefined, true);
	//ec.core.trackCustom(2, 'version', ec.version, 3);

})(window);