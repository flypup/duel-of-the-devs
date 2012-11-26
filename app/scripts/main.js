var ec = ec || {};

(function($) {
	'use strict';

	$.ec = ec;
	var document = $.document;
	var Modernizr =  $.Modernizr;

	ec.webgl = Modernizr.webgl;
	ec.mobile = Modernizr.mobile;
	ec.ios = Modernizr.ios;
	ec.ipad = Modernizr.ipad;
	ec.android = Modernizr.android;
	ec.fullscreen = Modernizr.fullscreen;
	ec.gamepads = Modernizr.gamepads;
	ec.debug = ec.mobile ? 1 : 2;
	
	var world;
	var view;
	var updateShapeView;
	var redraw;
	var debugView;
	var cpDebugView;
	
	var TIME_STEP = ec.TIME_STEP = 1/60;
	var paused = false;
	var delta, deltaTime, remainder;

	var createWaitTime = 0;
	var CREATE_WAIT_SECONDS = 5;

	var userInput;

	var required = ('resizeDisplay,addBrowserListeners,Box,Circle,Player,World,ThreeJsBoxView,ThreeJsSphereView,ThreeJsWorldView,Canvas2dView,TextField,ChipmunkDebugView,DebugView,UserInput').split(',');

	var core = ec.core = {

		load: function(time) {
			for (var i = 0, len = required.length; i < len; i++) {
				if (!ec[required[i]]) {
					console.log('loading');
					requestAnimationFrame( core.load );
					return;
				}
			}
			console.log('init');
			core.init(time);
		},

		init: function(time) {
			deltaTime = time;
		    remainder = 0;
		    
			requestAnimationFrame( core.animate );

			userInput = new ec.UserInput();

		    world = new ec.World();
			world.addWalls();
			world.add(new ec.Player().setPos(-200, 400, 32)).setInput(userInput).setView(new ec.ThreeJsSphereView());
			world.add(new ec.Box(world.createStaticBody()).setPos(-250, 0, 32)).setView(new ec.ThreeJsBoxView());
			world.add(new ec.Box(world.createStaticBody()).setPos( 250, 0, 32)).setView(new ec.ThreeJsBoxView());
		    world.add(new ec.Box()).setView(new ec.ThreeJsBoxView());
		    world.add(new ec.Circle()).setView(new ec.ThreeJsSphereView());
			redraw = true;

			ec.resizeDisplay();

			// THREE.js View
		    view = new ec.ThreeJsWorldView();
		    updateShapeView = view.updateShape();

		    // Dummy View
		    // view = {};
		    // view.pause = view.resume = view.draw =
		    // updateShapeView = function(){};

		    // Canvas 2d Context View
		    // view = new ec.Canvas2dView();
		    // updateShapeView = view.updateShape();

		    cpDebugView = new ec.ChipmunkDebugView(world.space);
		    debugView = new ec.DebugView();

		    ec.addBrowserListeners(userInput);

		    // hideUrlBarOnLoad
			if (ec.mobile) {
				$.scrollTo( 0, 1 );
			}

			ec.view = view;
			ec.world = world;
			// GUI Settings
			// debugView.worldGui(world);
			view.debugGui(debugView);
		},

		animate: function(time) {
			requestAnimationFrame( core.animate );
			
			if (ec.debug > 0) {
				debugView.stats.begin();
			}
			
			delta = (time - deltaTime) / 1000;
			deltaTime = time;

			delta = Math.max(TIME_STEP, Math.min(delta, TIME_STEP*10));

			if (!paused) {
				remainder += delta;
				while(remainder >= TIME_STEP) {
					remainder -= TIME_STEP;
					world.step(TIME_STEP);
				}

				createWaitTime+=delta;
				if (world.entities.length < 100 && createWaitTime > CREATE_WAIT_SECONDS) {
					createWaitTime -= CREATE_WAIT_SECONDS;
					world.add(new ec.Box()).setView(new ec.ThreeJsBoxView());
					world.add(new ec.Circle()).setView(new ec.ThreeJsSphereView());
				}
			}
			if (ec.debug < 3) {
				if (world.space.activeShapes.count > 0 || redraw) {
					world.space.eachShape(updateShapeView);
					redraw = false;
				}
				view.draw();
			}

		    if (ec.debug > 0) {
			    if (ec.debug > 1) {
					cpDebugView.step();
			    }
				debugView.stats.end();
			}
		},

		pause: function() {
			paused = true;
			view.pause();
		},

		resume: function() {
			paused = false;
			view.resume();
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
		}
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
	var requestAnimationFrame = $.requestAnimationFrame || Modernizr.prefixed('RequestAnimationFrame', $);
	// var cancelAnimationFrame = $.cancelAnimationFrame || Modernizr.prefixed('CancelAnimationFrame', $) || Modernizr.prefixed('CancelRequestAnimationFrame', $) || function ( id ) { $.clearTimeout( id ); };
	if (!requestAnimationFrame) {
		var lastTime = 0;
		requestAnimationFrame = function ( callback, element ) {
			var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = $.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	//$.onReady(core.init);
	requestAnimationFrame( core.load );

})(window);