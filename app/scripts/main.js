(function(window, ec) {

	ec.version = '0.2.9';
	ec.debug = 0;

	// data
	var maps;
	var scenes;
	var player;
	var boss;
	
	ec.mapList = ('hallway,training-hall,testmap3S,noodleshop3S,testmap,testmap2,courtyard').split(',');
	
	// entities
	var world;
	var scene;

	//views
	var view;
	var worldView;
	var hudView;
	var creditsView;
	var debugView;
	var cpDebugView;
	var view3d;

	// controllers
	var collisions;
	var userInput;
	var bossInput;
	var sound;

	// main loop
	var TIME_STEP = ec.TIME_STEP = 1000/60;
	var paused = false;
	var deltaTime, remainder;
	var rafId;

	// and then there are these things (loading, game and menu/HUD controllers plz):
	var overlay = null;
	var WATCH_DEAD_BOSS_DURATION = 2000;
	var loadingViewNode;
	var loadingScriptNodes = [];

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
	var max = Math.max;
	var min = Math.min;

	var requestAnimationFrame = window.requestAnimationFrame;
	var cancelAnimationFrame = window.cancelAnimationFrame;

	if (/Chrome\/3[23]\./.test(navigator.userAgent)) {
		var lastTime = 0;
		requestAnimationFrame = function(callback) {
			var currTime = 1*new Date(), timeToCall = Math.max( 0, 16.7 - ( currTime - lastTime ) );
			var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};
		cancelAnimationFrame = window.clearTimeout;
	}

	var core = ec.core = {

		begin: function() {
			console.log('begin');
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
				ec.core.setLocal('debug', 0);
				ec.core.setLocal('version', ec.version);
			}
			if (ec.mobile) {
				ec.core.setLocal('debug', 0);
			}
			ec.debug = ec.core.getLocal('debug', 0, parseInt, [10]);
		},

		load: function(time) {
			var document = window.document;
			var appCache = ec.appCache || {};
			var msg = '...';
			var mapsLoaded = hasProperties(maps, ec.mapList);
			if ((!appCache.complete && !appCache.timedout) || ec.ready !== true || !mapsLoaded) {
				cancelAnimationFrame(rafId);
				rafId = requestAnimationFrame( core.load );
				// TODO: Loading screen drawn to canvas
				if (!loadingViewNode) {
					loadingViewNode = document.createElement('p');
					loadingViewNode.appendChild(document.createTextNode(msg));
					document.body.appendChild(loadingViewNode);
				}
				if (loadingScriptNodes.length === 0) {
					for (var i=0, len=ec.mapList.length; i<len; i++) {
						var script = document.createElement('script');
						script.type = 'text/javascript';
						script.async = true;
						script.src = 'data/'+ ec.mapList[i] +'/data.js';
						loadingScriptNodes.push(script);
						document.body.appendChild(script);
					}
				}
				if (appCache.loaded) {
					msg = 'Downloading Updates '+appCache.loaded+'/'+appCache.total;
				} else {
					if (!mapsLoaded) {
						msg = ' Maps' + msg;
					}
					msg = 'Loading' + msg;
				}
				loadingViewNode.firstChild.nodeValue = msg;
				console.log('loading');
				return;
			}
			// clear loading vars
			if (loadingViewNode) {
				document.body.removeChild(loadingViewNode);
				loadingViewNode = null;
			}
			loadingScriptNodes.length = 0;

			// initialize inheritance - these should listen for an app loaded event, or use 'requires'
			ec.EnemyInput.ready();
			ec.ShadowCloneInput.ready();
			ec.Dot.ready();
			ec.Box.ready();
			ec.Circle.ready();
			ec.Player.ready();
			ec.Ninja.ready();
			ec.EmptyHand.ready();
			ec.Projectile.ready();
			ec.Puff.ready();
			
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
			if (world) {
				world.term();
			}
			ec.world =
			world = world || new ec.World();
			collisions = collisions || new ec.Collisions();
			if (!sound) {
				sound = new ec.Sound();
				// TODO: separate music and sound effect volume
				sound.setVolume(ec.core.getLocal('soundVolume', 0.5, parseFloat));
				sound.loadSound(sound.sounds.game);
				sound.loadSound(sound.sounds.stars);
				sound.loadSound(sound.sounds.strikes);
				sound.loadSound(sound.sounds.hits);
			}
			ec.sound = sound;

			ec.resizeDisplay();

			ec.SpriteSheets.init();

			// Dummy View
			// view = {};
			// view.pause = view.resume = view.draw = function(){};

			// Canvas 2d Context View
			view = view || new ec.Canvas2dView();
			view.removeAll();
			worldView = worldView || new ec.Canvas2dWorldView(world);
			hudView = new ec.HUDView();
			view.add(worldView);
			view.add(userInput);
			view.add(hudView);
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

			// paused = true; // DEV: ???
			overlay = ec.getImage('img/ui/startscreen.png');
			ec.getImage('img/ui/gameover.png'); //preload gameover screen
			hudView.alpha = 0;

			ec.bind(ec.core.getViewDom(), ec.touch ? 'touchend' : 'mouseup', ec.core.start, false);

			//-------- SCENE INIT --------//

			var sceneData = scenes.enter_the_ninja;
			scene = new ec.Scene(sceneData);
			// scene = null; // DEV: Skip scene

			//-------- MAP INIT --------//

			var map = maps[scene.mapName];
			//var map = maps['training-hall']; // DEV: Map development
			
			ec.core.setupMap(map, scene);

			//-------- DEBUG / GUI --------//
			if (ec.debug) {
				ec.core.setDebugLevel(ec.debug);
			}

			//-------- TRACKING --------//
			ec.core.trackEvent('core', 'inited', ec.version, undefined, true);

			// DEV: Skip opening scene
			// ec.core.resume();
			// ec.core.start({type: ec.touch ? 'touchend' : 'mouseup'});
			// ec.core.skipScene({type: ec.touch ? 'touchend' : 'mouseup'});
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
			collisions.init(world.space);

			worldView.loadMap();
			if (cpDebugView) {
				cpDebugView.setSpace(world.space);
			}
			remainder = 0;

			//----- Player and NPC entity setup -----//

			// monk
			if (!player) {
				ec.player =
				player = new ec.Player({hitPoints: 50}).setInput(userInput);
			}
			world.add(player);

			// ninja
			if (!boss) {
				boss = new ec.Ninja({hitPoints: 50}).setInput(bossInput);
			}
			world.add(boss);

			// scene
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(
				scene ? core.animateScene : core.animate
			);

			// TODO: map.getElementsByType('floor').getPos();

			// TODO: map.getSpawnPoint('Player');
			var spawnPoint = {x: map.width/2, y: map.height/2+450, z: 30};
			if (map.spawnPoints && map.spawnPoints.length) {
				spawnPoint = map.spawnPoints[0];
			}
			player.setPos(spawnPoint.x, spawnPoint.y, spawnPoint.z);

			// TODO: map.getSpawnPoint('Ninja');
			if (map.spawnPoints && map.spawnPoints.length > 1) {
				spawnPoint = map.spawnPoints[1];
			} else {
				spawnPoint = {x: map.width/2+200, y: map.height/2, z: 30};
			}
			boss.setPos(spawnPoint.x, spawnPoint.y, spawnPoint.z);

			world.step(TIME_STEP);
			
			//worldView.zoom(0.75);
			if (scene) {
				scene.init({
					viewport: worldView.camera,
					monk: player,
					ninja: boss
				});

				scene.step(0);
				world.stepScene(TIME_STEP);
			} else {
				bossInput.completeTask();
				worldView.lookAt(player.body.p.x, -player.body.p.y -64);
			}
		},

		// DEBUG ONLY
		cycleMap: function() {
			var map = world.map;
			var name = map.name;
			var index = ec.mapList.indexOf(name);
			if (index === -1) {
				throw('Map not found in list "'+ name +'".');
			}
			if (++index === ec.mapList.length) {
				index = 0;
			}
			name = ec.mapList[index];
			map = maps[name];
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
			hudView.alpha = 1.0;
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

		gameOver: function() {
			ec.core.trackEvent('game', 'gameover', ec.version);

			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame( core.animateGameOver );

			overlay = ec.getImage('img/ui/gameover.png');
			ec.bind(ec.core.getViewDom(), ec.touch ? 'touchend' : 'mouseup', ec.core.restart, false);

			sound.playEndingMusic();
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

			ec.bind(ec.core.getViewDom(), ec.touch ? 'touchend' : 'mouseup', ec.core.restart, false);

			sound.playEndingMusic();
		},

		restart: function(e) {
			if (creditsView && creditsView.creditsTime < creditsView.skipAfter) {
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
			delta = min(max(TIME_STEP, delta), TIME_STEP*10);

			if (ec.debug !== 4) {
				view.draw(delta);
			}
			userInput.pollGamepads();

			if (ec.debug > 0) {
				if (ec.debug === 1) {ec.core.traceTimeEnd('animateCredits');}
				debugView.end();
			}
		},

		animateScene: function(time) {
			if (!scene.complete) {
				rafId = requestAnimationFrame( core.animateScene );
			} else {
				console.log('animateScene complete', scene);
				rafId = requestAnimationFrame( core.animate );
				scene = null;
				//Break when this changes: player.pos.x
				return;
			}

			if (ec.debug > 0) {
				debugView.begin();
				if (ec.debug === 1) {ec.core.traceTime('animateScene');}
			}

			var delta = (time - deltaTime);
			deltaTime = time;

			if (!paused) {
				delta = min(max(TIME_STEP, delta), TIME_STEP*10);

				scene.step(delta);

				remainder += delta;
				while(remainder >= TIME_STEP) {
					remainder -= TIME_STEP;
					world.stepScene(TIME_STEP);
				}

			} else {
				delta = 0;
			}
			userInput.pollGamepads();

			if (ec.debug !== 4) {
				view.draw(delta);
			}

			if (ec.debug > 0) {
				if (view3d && !paused) {
					var cam = worldView.camera;
					view3d.lookAt(cam.x + cam.width/2, cam.y + cam.height/2, 0);
					view3d.draw(world);
				}
				if (ec.debug > 2) {cpDebugView.step(view);}
				if (ec.debug === 1) {ec.core.traceTimeEnd('animateScene');}
				debugView.end();
			}
		},

		animate: function(time) {
			rafId = requestAnimationFrame( core.animate );

			if (ec.debug > 0) {
				debugView.begin();
				if (ec.debug === 1) {ec.core.traceTime('animate');}
			}

			var delta = (time - deltaTime);// * 0.1;
			deltaTime = time;

			if (!paused) {
				delta = min(max(TIME_STEP, delta), TIME_STEP*10);

				remainder += delta;
				while(remainder >= TIME_STEP) {
					remainder -= TIME_STEP;
					world.step(TIME_STEP);
				}
				// delta = min(max(TIME_STEP, delta), TIME_STEP*10) * 0.5;
				// world.step(delta);

				if (boss.state === 'dead') {
					boss.decomposed += delta;
					if (boss.decomposed > WATCH_DEAD_BOSS_DURATION) {
						boss.decomposed = 0;
						ec.core.rollCredits();
						return;
					}
				} else if (player.state === 'dead') {
					ec.core.gameOver();
					return;
				}
			} else {
				delta = 0;
				userInput.pollGamepads();
			}

			worldView.lookAt(player.body.p.x, -player.body.p.y -player.z - 64);
			hudView.health = player.hitPoints / 100;
			hudView.rate = player.getHeartRate(delta);

			if (ec.debug !== 4) {
				view.draw(delta);
			}

			if (ec.debug > 0) {
				if (view3d && !paused) {
					view3d.lookAt(player.body.p.x, -player.body.p.y, player.z + 60);
					view3d.draw(world);
				}
				if (ec.debug > 2) {cpDebugView.step(view);}
				if (ec.debug === 1) {ec.core.traceTimeEnd('animate');}
				debugView.end();
			}
		},

		animateGameOver: function(time) {
			rafId = requestAnimationFrame( core.animateGameOver );

			if (ec.debug > 0) {
				debugView.begin();
				if (ec.debug === 1) {ec.core.traceTime('animateGameOver');}
			}

			var delta = (time - deltaTime);
			deltaTime = time;
			delta = min(max(TIME_STEP, delta), TIME_STEP*10) * 0.2;
			world.step(delta);

			worldView.lookAt(boss.body.p.x, -boss.body.p.y -boss.z - 64);
			hudView.health = player.hitPoints / 100;
			hudView.rate = player.getHeartRate(delta);

			if (ec.debug !== 4) {
				view.draw(delta);
			}

			if (ec.debug > 0) {
				if (view3d && !paused) {
					view3d.lookAt(player.body.p.x, -player.body.p.y, player.z + 60);
					view3d.draw(world);
				}
				if (ec.debug > 2) {cpDebugView.step(view);}
				if (ec.debug === 1) {ec.core.traceTimeEnd('animateGameOver');}
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
			sound.pause();
			ec.allowPinchZoom();
			userInput.clearKeys();
		},

		resume: function() {
			console.log('resume');
			paused = false;
			view.resume();
			sound.resume();
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
				window.document.body.requestFullscreen();
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
			if (window.THREE) {
			view3d = view3d || new ec.ThreeJsWorldView();
			}

			debugView.hide();
			cpDebugView.hide();
			if (view3d) {
			view3d.hide();
			}

			switch (level) {
			case 4:
			case 3:
				cpDebugView.show();
				if (view3d) {
				view3d.show(level === 4);
				view3d.draw(world);
					if (view3d.getDom().style.pointerEvents !== 'none') {
				view3d.getDom().style.pointerEvents = 'none';
					}
				if (!ec.touch) {
					// debugView.worldGui(world);
					// view.debugGui(debugView);
					view3d.debugGui(debugView);
				}
				}
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
		if (ec.debug && source === undefined) {
			throw 'extend "source" param undefined.';
		}
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
		if (ec.debug && source === undefined) {
			throw 'copy "source" param undefined.';
		}
		target = target || {};
		for ( var prop in source ) {
			target[ prop ] = source[ prop ];
		}
		return target;
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

	ec.bind = function(obj, event, func, bool) {
		bool = bool || false;
		if (obj.addEventListener) {
			obj.addEventListener(event, func, bool);
		} else if (obj.attachEvent) {
			obj.attachEvent('on' + event, func);
		} else {
			// not exactly 'trigger' or 'dispatchEvent' friendly
			obj['on' + event] = func;
		}
	};

	ec.unbind = function(obj, event, func, bool) {
		bool = bool || false;
		if (obj.removeEventListener) {
			obj.removeEventListener(event, func, bool);
		} else if (obj.detachEvent) {
			obj.detachEvent('on' + event, func);
		} else {
			delete obj['on' + event];
		}
	};

	ec.addPool = function(fnClass) {
		var pool = fnClass.pool = [];
		var term = fnClass.prototype.term;
		fnClass.create = function() {
			var instance = this.pool.pop();
			if (!instance) {
				instance = new this(arguments);
			} else {
				instance.init.apply(instance, arguments);
			}
			return instance;
		};
		fnClass.prototype.term = function() {
			if (term) {term.apply(this);}
			pool.push(this);
		};
	};

	//document ready
	function docReadyHandler() {
		ec.unbind(window.document, 'DOMContentLoaded', docReadyHandler, false);
		ec.unbind(window, 'load', docReadyHandler, false);
		ec.ready = true;
	}
	ec.bind(window.document, 'DOMContentLoaded', docReadyHandler, false);
	ec.bind(window, 'load', docReadyHandler, false);

	// tests
	(function(document, navigator) {
		ec.touch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
		ec.msTouch = navigator.msPointerEnabled;
		ec.mobile = (/iPhone|iPad|iPod|Android/).test(navigator.userAgent);
		ec.ios = (/iPhone|iPad|iPod/).test(navigator.userAgent);
		ec.ipad = (/iPad/).test(navigator.userAgent);
		ec.android = (/Android/).test(navigator.userAgent);
		ec.standalone = !!navigator.standalone;
		ec.webgl = !!window.WebGLRenderingContext;
		ec.webaudio   = !!window.AudioContext;
		ec.gamepads   = !!navigator.getGamepads;
	})(window.document, window.navigator);

	ec.core.begin();

	//ec.core.trackCustom(2, 'version', ec.version, 3);

})(window, window.ec = window.ec || {});
