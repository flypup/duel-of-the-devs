var ec = ec || {};
ec.version = '0.1.303';
ec.debug = 0;

(function(window) {
	'use strict';

	window.ec = ec;
	var document = window.document;
	
	var world;
	var maps;
	var scenes;
	var scene;
	var view;
	var worldView;
	var creditsView;
	var debugView;
	var cpDebugView;
	
	var TIME_STEP = ec.TIME_STEP = 1000/60;
	var paused = false;
	var deltaTime, remainder;

	var userInput;
	var bossInput;
	var player;
	var boss;
	var overlay = null;

	var rafId;

	var sound;

	var WATCH_DEAD_BOSS_DURATION = 2000;

	var loadingViewNode;
	
	var hasProperties = function(obj, props) {
		if (!obj) {
			return false;
		}
		for (var i = 0, len = props.length; i < len; i++) {
			if (obj[props[i]] === undefined) {
				return false;
			}
		}
		return true;
	};

	var core = ec.core = {

		begin: function() {
			console.log('begin');
			//window.onReady(core.init);
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame( core.load );

			ec.core.loadSettings();

			ec.core.trackEvent('core', 'preload', ec.version, undefined, true);
		},

		loadSettings: function() {
			//version and settings check
			var version = ec.core.getLocal('version');
			if (!version) {
				ec.core.clearLocal();
			}
			if (version !== ec.version) {
				ec.core.setLocal('version', ec.version);
			}
			ec.debug = ec.core.getLocal('debug', 0, parseInt, [10]);
		},

		load: function(time) {
			var appCache = ec.appCache || {};
			if ((!appCache.complete && !appCache.timedout) ||
				document.readyState !== 'complete' ||
				!hasProperties(maps, ('testmap,courtyard').split(',')) ||
				!hasProperties(scenes, ['enter_the_ninja'])) {
				rafId = requestAnimationFrame( core.load );
				// TODO: Loading screen drawn to canvas
				if (!loadingViewNode) {
					loadingViewNode = document.createElement('p');
					document.body.appendChild(loadingViewNode);
				}
				loadingViewNode.innerHTML = appCache.loaded ? 'Downloading Updates '+appCache.loaded+'/'+appCache.total : 'Loading...';
				console.log('loading');
				return;
			}
			if (loadingViewNode) {
				document.body.removeChild(loadingViewNode);
			}
			document.removeEventListener( 'DOMContentLoaded', docReadyHandler, false );
			window.removeEventListener( 'load', docReadyHandler, false );

			// initialize inheritance - these should listen for an app loaded event, or use 'requires'
			ec.Player.ready();
			ec.Ninja.ready();
			ec.EmptyHand.ready();
			ec.Puff.ready();
			ec.Box.ready();
			ec.Circle.ready();

			core.init(time);
		},

		init: function(time) {
			console.log('init');
			deltaTime = time;
			remainder = 0;
			
			player = null;
			boss   = null;
			userInput = new ec.UserInput();
			bossInput = new ec.EnemyInput();
			ec.world =
			world = new ec.World();
			if (!sound) {
				sound = new ec.Sound();
				// TODO: separate music and sound effect volume
				sound.setVolume(ec.core.getLocal('soundVolume', 0, parseFloat));
			}
			ec.sound = sound;

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

			//-------- UI --------//
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

			//-------- TITLE SCREEN SETUP --------//
			sound.stop();

			paused = true;
			overlay = ec.getImage('img/ui/startscreen.png');

			ec.bind(ec.core.getViewDom(), ec.touch ? 'touchend' : 'mouseup', ec.core.start, false);

			//-------- SCENE INIT --------//

			var sceneData = scenes.enter_the_ninja;
			scene = new ec.Scene(sceneData);
			
			//-------- MAP INIT --------//

			var map = maps[scene.mapName];
			ec.core.setupMap(map, scene);

			//-------- DEBUG / GUI --------//
			if (ec.debug) {
				ec.core.setDebugLevel(ec.debug);
			}

			if (!ec.touch) {
				// debugView.worldGui(world);
				// view.debugGui(debugView);
			}

			//-------- TRACKING --------//
			ec.core.trackEvent('core', 'inited', ec.version, undefined, true);
		},

		setupMap: function(map, scene) {
			console.log('setupMap', map);

			//----- World setup -----//
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
			remainder = 0;

			//----- Player and NPC entity setup -----//

			// monk
			if (!player) {
				ec.player =
				player = new ec.Player().setInput(userInput);
			}
			world.add(player);
			
			// ninja
			if (!boss) {
				boss = new ec.Ninja().setInput(bossInput);
			}
			world.add(boss);

			// scene
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(
				scene ? core.animateScene : core.animate
			);

			player.setPos(map.width/2, map.height/2+450, 0);
			boss.setPos(map.width/2+200, map.height/2, 0);

			//worldView.zoom(0.75);
			if (scene) {
				scene.init({
					viewport: worldView.camera,
					monk: player,
					ninja: boss
				});

				world.stepScene(TIME_STEP);
			} else {
				bossInput.completeTask();
				worldView.lookAt(player.body.p.x, -player.body.p.y -64);
			}
		},

		cycleMap: function() {
			var map = maps.courtyard;//testmap;//
			if (world.map === map) {
				map = maps.testmap;//courtyard;//
			}
			ec.core.setupMap(map, null);
		},

		start: function(e) {
			// remove title screen
			ec.unbind(ec.core.getViewDom(), e.type, ec.core.start, false);
			overlay = null;
			
			ec.bind(ec.core.getViewDom(), ec.touch ? 'touchend' : 'mouseup', ec.core.skipScene, false);
			
			sound.playGameMusic();
		},

		skipScene: function(e) {
			if (!paused && scene && !scene.complete) {
				ec.unbind(ec.core.getViewDom(), e.type, ec.core.skipScene, false);
				scene.skip();
			}
		},

		userStarted: function() {
			if (!ec.touch) {
				overlay = ec.getImage('img/ui/guide-move-desktop.png');
				ec.core.trackEvent('game', 'guide', 'guide-move-desktop');
			} else {
				overlay = ec.getImage('img/ui/guide-touch.png');
				ec.core.trackEvent('game', 'guide', 'guide-touch');
			}
		},

		userReady: function() {
			if (!ec.touch) {
				overlay = ec.getImage('img/ui/guide-fight-desktop.png');
				ec.core.trackEvent('game', 'guide', 'guide-fight-desktop');
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

			ec.clearCache();
			creditsView = creditsView || new ec.Canvas2dCreditsView();
			creditsView.init(view.context);
			view.removeAll();
			view.add(creditsView);

			if (ec.touch) {
				ec.bind(ec.core.getViewDom(), 'touchend', ec.core.restart, false);
			} else {
				ec.bind(ec.core.getViewDom(), 'mouseup', ec.core.restart, false);
			}

			sound.playEndingMusic();
		},

		restart: function(e) {
			if (creditsView.creditsTime < creditsView.skipAfter) {
				return;
			}
			ec.unbind(ec.core.getViewDom(), e.type, ec.core.restart, false);

			view.remove(creditsView);
			overlay = null;

			if (world && world.space) {
				if (world.contains(player.attack)) {
					world.remove(player.attack);
				}
				world.remove(player);
				world.remove(boss);
				world.term();
			}

			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame( core.init );
		},

		animateCredits: function(time) {
			if (ec.debug > 0) {
				debugView.begin();
				if (ec.debug === 1) {ec.core.traceTime('animateCredits');}
			}

			rafId = requestAnimationFrame( core.animateCredits );

			var delta = (time - deltaTime);
			deltaTime = time;
			delta = Math.max(TIME_STEP, Math.min(delta, TIME_STEP*10));

			if (ec.debug !== 4) {
				view.draw(delta);
			}

			if (ec.debug > 0) {
				if (ec.debug === 1) {ec.core.traceTimeEnd('animateCredits');}
				debugView.end();
			}
		},

		animateScene: function(time) {
			if (ec.debug > 0) {
				debugView.begin();
				if (ec.debug === 1) {ec.core.traceTime('animateScene');}
			}

			if (!scene.complete) {
				rafId = requestAnimationFrame( core.animateScene );
			} else {
				rafId = requestAnimationFrame( core.animate );
				scene = null;
				return;
			}

			var delta = (time - deltaTime);
			deltaTime = time;

			if (!paused) {
				delta = Math.max(TIME_STEP, Math.min(delta, TIME_STEP*10));

				scene.step(delta);

				remainder += delta;
				while(remainder >= TIME_STEP) {
					remainder -= TIME_STEP;
					world.stepScene(TIME_STEP);
				}

			} else {
				delta = 0;
			}

			if (ec.debug !== 4) {
				view.draw(delta);
			}

			if (ec.debug > 0) {
				if (ec.debug > 2) {cpDebugView.step(view);}
				if (ec.debug === 1) {ec.core.traceTimeEnd('animateScene');}
				debugView.end();
			}
		},

		animate: function(time) {
			if (ec.debug > 0) {
				debugView.begin();
				if (ec.debug === 1) {ec.core.traceTime('animate');}
			}

			rafId = requestAnimationFrame( core.animate );
			
			var delta = (time - deltaTime);
			deltaTime = time;

			if (!paused) {
				delta = Math.max(TIME_STEP, Math.min(delta, TIME_STEP*10));

				remainder += delta;
				while(remainder >= TIME_STEP) {
					remainder -= TIME_STEP;
					world.step(TIME_STEP);
				}

				worldView.lookAt(player.body.p.x, -player.body.p.y -player.z - 64);

				if (boss.state === 'dead') {
					boss.decomposed = boss.decomposed || 0;
					boss.decomposed += delta;
					if (boss.decomposed > WATCH_DEAD_BOSS_DURATION) {
						delete boss.decomposed;
						ec.core.rollCredits();
						return;
					}
				}
			} else {
				delta = 0;
			}
			
			if (ec.debug !== 4) {
				view.draw(delta);
			}

			if (ec.debug > 0) {
				if (ec.debug > 2) {cpDebugView.step(view);}
				if (ec.debug === 1) {ec.core.traceTimeEnd('animate');}
				debugView.end();
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
			userInput.clearKeys();
		},

		resume: function() {
			console.log('resume');
			paused = false;
			view.resume();
			ec.preventPinchZoom();
		},

		togglePause: function() {
			if (paused) {
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
				if (cpDebugView) {
					cpDebugView.resize();
				}
			}
		},

		zoom: function(value) {
			return worldView.zoom(value);
		},

		getViewDom: function() {
			return view.getDom();
		},

		getCamera: function() {
			return worldView.camera;
		},

		setLocal: function(id, val) {
			try {
				localStorage.setItem(id, val);
			} catch (e) {
				console.error('localStorage.setItem', e);
				ec.core.trackEvent('error', 'localStorage.setItem', e.message, undefined, true);
			}
		},

		getLocal: function(id, defaultValue, convert, args) {
			var value = localStorage.getItem(id);
			if (value === null && defaultValue !== undefined) {
				return defaultValue;
			}
			if (convert) {
				args = args||[];
				args.unshift(value);
				return convert.apply(null, args);
			}
			return value;
		},

		removeLocal: function(id) {
			return localStorage.removeItem(id);
		},

		clearLocal: function() {
			localStorage.clear();
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
			level = isNaN(level) ? 0 : level;
			if (level < 0) {
				level = 4;
			}
			cpDebugView = cpDebugView || new ec.ChipmunkDebugView(world.space);
			debugView = debugView || new ec.DebugView();
			
			debugView.hide();
			cpDebugView.hide();
			switch (level) {
				case 4:
				case 3:
					cpDebugView.show();
					/*falls through*/
				case 2:
				case 1:
					debugView.show();
			}
			ec.debug = level;
			ec.core.setLocal('debug', level);
			console.log('debug level', level);
		},

		cycleDebug: function() {
			ec.core.setDebugLevel(ec.debug-1);
		},

		traceTime: function(tag) {
			tag = tag || 'default';
			console.time = console.time || function(){};
			console.time(tag);
		},

		traceTimeEnd: function(tag) {
			tag = tag || 'default';
			console.timeEnd = console.timeEnd || function(){};
			console.timeEnd(tag);
		}
	};

	// loadMap/loadScene JSONp callbacks

	ec.loadMap = function(data) {
		console.log('loadMap', data.name);
		maps = maps || {};
		maps[data.name] = data;
	};

	ec.loadScene = function(data) {
		console.log('loadScene', data.name);
		scenes = scenes || {};
		scenes[data.name] = data;
	};

	// utils

	ec.extend = function( target, source ) {
		for ( var prop in source ) {
			if ( source.hasOwnProperty( prop ) ) {
				if ( !target.hasOwnProperty( prop ) ) {
					var copy = source[ prop ];
					if (copy !== undefined) {
						target[ prop ] = copy;
					}
				}
			}
		}
		return target;
	};

	ec.copy = function( target, source ) {
		target = target || {};
		for ( var prop in source ) {
			target[ prop ] = source[ prop ];
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

	ec.objectToProps = function(arr, prop) {
		var propArray = [];
		for (var i=0, len = arr.length; i<len; i++) {
			propArray.push(arr[i][prop]);
		}
		return propArray;
	};

	// tests

	function prefixed(str, obj) {
		return obj[str] || obj['webkit' + str] || obj['moz' + str] || obj['o' + str] || obj['ms' + str];
	}

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
		requestAnimationFrame = function(callback) {
			var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	var localStorage = window.localStorage ||
		{
			_data       : {},
			setItem     : function(id, val) { return this._data[id] = String(val); },
			getItem     : function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
			removeItem  : function(id) { return delete this._data[id]; },
			clear       : function() { return this._data = {}; }
		};

	//document ready
	function docReadyHandler() {
		document.readyState = 'complete';
	}
	document.addEventListener( 'DOMContentLoaded', docReadyHandler, false );
	window.addEventListener( 'load', docReadyHandler, false );


	ec.core.begin();

	//ec.core.trackCustom(2, 'version', ec.version, 3);

})(window);