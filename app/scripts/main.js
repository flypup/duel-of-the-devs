var ec = ec || {};

(function() {
	'use strict';
	var requestAnimationFrame = window.requestAnimationFrame;
	var Modernizr = window.Modernizr;

	ec.mobile = Modernizr.mobile;
	ec.ios = Modernizr.ios;
	ec.android = Modernizr.android;
	ec.fullscreen = Modernizr.fullscreen;
	var world;
	var view;
	var updateShapeView;
	var redraw;
	var debugView;
	var cpDebugView;
	
	var TIME_STEP = ec.TIME_STEP = 1/60;
	var paused = false;
	var delta, deltaTime, remainder;

	var core = ec.core = {

		init: function(time) {
			deltaTime = time;
		    remainder = 0;
		    requestAnimationFrame( core.animate );

			world = new ec.World();
			world.addFloor();
			world.add(new ec.Box(world.createStaticBody()).setPos(-1200, -400)).setView(new ec.ThreeJsBoxView());
			world.add(new ec.Box(world.createStaticBody()).setPos( 1200, -400)).setView(new ec.ThreeJsBoxView());
		    world.add(new ec.Box()).setView(new ec.ThreeJsBoxView());
		    world.add(new ec.Circle()).setView(new ec.ThreeJsSphereView());
			redraw = true;

			ec.resizeDisplay();

		    view = new ec.ThreeJsWorldView();
		    updateShapeView = view.updateShape();

		    cpDebugView = new ec.ChipmunkDebugView(world.space);
		    debugView = new ec.DebugView();

		    ec.addBrowserListeners();

		    // hideUrlBarOnLoad
			if (ec.mobile) {
				window.scrollTo( 0, 1 );
			}

			// GUI Settings
			//	debugView.worldGui(world);
			//	debugView.viewGui(view);
		},

		animate: function(time) {
			debugView.stats.begin();

			// note: three.js includes requestAnimationFrame shim
		    requestAnimationFrame( core.animate );

			delta = (time - deltaTime) / 1000;
			deltaTime = time;

			delta = Math.max(TIME_STEP, Math.min(delta, TIME_STEP*5));

			if (!paused) {
				remainder += delta;
				while(remainder > TIME_STEP) {
					remainder -= TIME_STEP;
					world.step(TIME_STEP);
				}

				if (world.space.activeShapes.count > 0 || redraw) {
				    world.space.eachShape(updateShapeView);
				    redraw = false;
				} else {
					world.add(new ec.Box()).setView(new ec.ThreeJsBoxView());
					world.add(new ec.Circle()).setView(new ec.ThreeJsSphereView());
				}
			}

		    view.draw();
		    if (!ec.mobile) {
				cpDebugView.step();
		    }

		    debugView.stats.end();
		},

		pause: function() {
			paused = true;
		},

		resume: function() {
			paused = false;
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
		}

	};

	requestAnimationFrame( core.init );

})();