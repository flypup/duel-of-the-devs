var ec = ec || {'version': '0.1.155'};

(function(window) {
	'use strict';

	window.ec = ec;
	var document = window.document;
	var Modernizr =  window.Modernizr;

	Modernizr.addTest({
        mobile: function(){
            // TODO: add Windows Mobile, FireFoxOS - Anything with multi-touch, no mouse and fixed screen size
            return (/iPhone|iPad|iPod|Android/).test(navigator.userAgent);
        },
        ios: function(){
            return (/iPhone|iPad|iPod/).test(navigator.userAgent);
        },
        ipad: function(){
            return (/iPad/).test(navigator.userAgent);
        },
        android: function(){
            return (/Android/).test(navigator.userAgent);
        },
        standalone:function(){
            return !!navigator.standalone;
        }
    });

	ec.webgl = Modernizr.webgl;
	ec.touch = Modernizr.touch;
	ec.mobile = Modernizr.mobile;
	ec.ios = Modernizr.ios;
	ec.ipad = Modernizr.ipad;
	ec.android = Modernizr.android;
	ec.fullscreen = Modernizr.fullscreen;
	ec.gamepads = Modernizr.gamepads;
	ec.debug = 0;//ec.mobile ? 1 : 2;
	
	var world;
	var view;
	var debugView;
	var cpDebugView;
	
	var TIME_STEP = ec.TIME_STEP = 1000/60;
	var paused = false;
	var delta, deltaTime, remainder;

	var userInput;
	var player;
	var boss;
	var overlay = null;

	var rafId;

	var WATCH_DEAD_BOSS_DURATION = 2000;

	var required = ('extend,resizeDisplay,addBrowserListeners,Entity,Box,Circle,EmptyHand,Player,Ninja,ShadowClone,World,Canvas2dView,TextField,ChipmunkDebugView,DebugView,UserInput,EnemyInput,SpriteSheets,ButtonOverlay').split(',');
	var globalRequired = ('cp,THREE,createjs,Stats,dat').split(',');
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

			console.log('init');
			core.init(time);
		},

		init: function(time) {
			deltaTime = time;
		    remainder = 0;
		    
			rafId = requestAnimationFrame( core.animate );

			userInput = new ec.UserInput();

		    ec.world =
		    world = new ec.World();
			world.addWalls();

			ec.player =
			player =
			world.add(new ec.Player().setPos(-2, -155, 32).setInput(userInput));//.setView(new ec.ThreeJsSphereView()));
			
			//statues
			world.add(new ec.Box(0).setPos(-250, 0, 32));//.setView(new ec.ThreeJsBoxView()));
			world.add(new ec.Box(0).setPos( 250, 0, 32));//.setView(new ec.ThreeJsBoxView()));
		    
		    //ninja
		    var bossInput = new ec.EnemyInput();
		    boss =
		    world.add(new ec.Ninja().setPos(250, 64, 32).setInput(bossInput));//.setView(new ec.ThreeJsSphereView()));
		    
		    //movable statues
		    world.add(new ec.Box(100).setPos(-500, -500, 32));//.setView(new ec.ThreeJsBoxView()));
		    world.add(new ec.Box(100).setPos(-500,  500, 32));//.setView(new ec.ThreeJsBoxView()));
		    world.add(new ec.Box(100).setPos( 500, -500, 32));//.setView(new ec.ThreeJsBoxView()));
		    world.add(new ec.Box(100).setPos( 500,  500, 32));//.setView(new ec.ThreeJsBoxView()));

			ec.resizeDisplay();

			ec.SpriteSheets.init();

			// THREE.js View
		    // view = new ec.ThreeJsWorldView();

		    // Dummy View
		    // view = {};
		    // view.pause = view.resume = view.draw = function(){};

		    // Canvas 2d Context View
		    view = new ec.Canvas2dView();

			// ec.view = view;
			// ec.world = world;

		    cpDebugView = new ec.ChipmunkDebugView(world.space);
		    debugView = new ec.DebugView();
		    if (ec.debug) {
				ec.core.setDebugLevel(ec.debug);
			}

		    view.setInput(userInput);
		    ec.addBrowserListeners(userInput);

		    if (ec.touch) {
				var scaledWidth = view.width * ec.pixelRatio;
				var scaledHeight = view.height * ec.pixelRatioY || ec.pixelRatio;
				ec.ButtonOverlay.viewWidth = scaledWidth;
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

			view.lookAt(player.body.p.x, -player.body.p.y);
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
		},

		start: function(e) {
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
			ec.unbind(ec.core.getViewDom(), e.type, ec.core.start, false);
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
			overlay = new Image();
			overlay.src = 'img/ui/credits.png?v=' + ec.version;
			ec.core.trackEvent('game', 'credits', ec.version);

			if (ec.touch) {
				ec.bind(ec.core.getViewDom(), 'touchend', ec.core.restart, false);
			} else {
				ec.bind(ec.core.getViewDom(), 'mouseup', ec.core.restart, false);
			}
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame( core.animateCredits );
			view.initCredits();
			world.term();
		},

		restart: function(e) {
			overlay = null;

			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame( core.init );

			ec.unbind(ec.core.getViewDom(), e.type, ec.core.start, false);
		},

		animateCredits: function(time) {
			rafId = requestAnimationFrame( core.animateCredits );

			if (ec.debug > 0) {
				debugView.stats.begin();
			}

			delta = (time - deltaTime);
			deltaTime = time;
			delta = Math.max(TIME_STEP, Math.min(delta, TIME_STEP*10));
			view.drawCredits(delta);

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

				view.lookAt(player.body.p.x, -player.body.p.y);
			}
			if (boss.state === 'dead') {
				boss.decomposed = boss.decomposed || 0;
				boss.decomposed += delta;
				if (boss.decomposed > WATCH_DEAD_BOSS_DURATION) {
					delete boss.decomposed;
					ec.core.rollCredits();
				}
				return;
			}
			if (ec.debug < 3) {
				view.draw(world);
			}

		    if (ec.debug > 0) {
			    if (ec.debug > 1) {
					cpDebugView.step();
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
				view.resize();
				cpDebugView.resize();
			}
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

	// polyfills

	if (!Date.now) {
		Date.now = function now() {
	        return +(new Date());
	    };
	}

	// requestAnimationFrame polyfill by Erik Möller
	// fixes from Paul Irish and Tino Zijdel
	// vendor prefix checks using Modernizr
	var requestAnimationFrame = window.requestAnimationFrame || Modernizr.prefixed('RequestAnimationFrame', window);
	var cancelAnimationFrame = window.cancelAnimationFrame || Modernizr.prefixed('CancelAnimationFrame', window) || Modernizr.prefixed('CancelRequestAnimationFrame', window) || function ( id ) { window.clearTimeout( id ); };
	if (!requestAnimationFrame) {
		var lastTime = 0;
		requestAnimationFrame = function ( callback, element ) {
			var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	//window.onReady(core.init);
	requestAnimationFrame( core.load );

	ec.core.trackEvent('core', 'preload', ec.version, undefined, true);
	//ec.core.trackCustom(2, 'version', ec.version, 3);

})(window);