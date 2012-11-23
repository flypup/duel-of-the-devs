var ec = ec || {};

(function($) {
	'use strict';

	$.ec = ec;
	var document = $.document;
	var requestAnimationFrame =  $.requestAnimationFrame;
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

	var core = ec.core = {

		init: function(time) {
			deltaTime = time;
		    remainder = 0;
		    requestAnimationFrame( core.animate );

			world = new ec.World();
			world.addWalls();
			world.add(new ec.Box(world.createStaticBody()).setPos(-1000, 32)).setView(new ec.ThreeJsBoxView());
			world.add(new ec.Box(world.createStaticBody()).setPos( 1000, 32)).setView(new ec.ThreeJsBoxView());
		    world.add(new ec.Box()).setView(new ec.ThreeJsBoxView());
		    world.add(new ec.Circle()).setView(new ec.ThreeJsSphereView());
			redraw = true;

			ec.resizeDisplay();

		    view = new ec.ThreeJsWorldView();
		    updateShapeView = view.updateShape();

		    cpDebugView = new ec.ChipmunkDebugView(world.space);
		    debugView = new ec.DebugView();

		    ec.addBrowserListeners();

		    userInput = new ec.UserInput();

		    // hideUrlBarOnLoad
			if (ec.mobile) {
				$.scrollTo( 0, 1 );
			}

			ec.view = view;
			ec.world = world;
			// GUI Settings
			// debugView.worldGui(world);
			// debugView.viewGui(view);
		},

		animate: function(time) {
			if (ec.debug > 0) {
				debugView.stats.begin();
			}
			// note: three.js includes requestAnimationFrame shim
		    requestAnimationFrame( core.animate );

			delta = (time - deltaTime) / 1000;
			deltaTime = time;

			delta = Math.max(TIME_STEP, Math.min(delta, TIME_STEP*10));

			userInput.poll();

			if (!paused) {
				remainder += delta;
				while(remainder >= TIME_STEP) {
					remainder -= TIME_STEP;
					world.step(TIME_STEP);
				}

				createWaitTime+=delta;
				if (world.space.activeShapes.count > 0 || redraw) {
				    world.space.eachShape(updateShapeView);
				    redraw = false;
				} else if (createWaitTime > CREATE_WAIT_SECONDS) {
					createWaitTime -= CREATE_WAIT_SECONDS;
					world.add(new ec.Box()).setView(new ec.ThreeJsBoxView());
					world.add(new ec.Circle()).setView(new ec.ThreeJsSphereView());
				}
			}

			if (ec.debug < 3) {
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
			return view.renderer.domElement;
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

	requestAnimationFrame( core.init );

})(window);