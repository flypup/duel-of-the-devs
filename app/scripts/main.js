var ec = ec || {};

(function() {
	'use strict';
	var requestAnimationFrame = window.requestAnimationFrame;
	var Modernizr = window.Modernizr;

	ec.mobile = Modernizr.mobile;
	ec.ios = Modernizr.ios;
	ec.android = Modernizr.android;
	
	var world;
	var view;
	var updateShapeView;
	var redraw;
	var debugView;
	var cpDebugView;
	
	var TIME_STEP = ec.TIME_STEP = 1/60;
	var delta, deltaTime, remainder;

	var core = ec.Core = {

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

			ec.initDisplay();

		    view = new ec.ThreeJsWorldView();
		    updateShapeView = view.updateShape();

		    cpDebugView = new ec.ChipmunkDebugView(world.space);
		    debugView = new ec.DebugView();

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

		    view.draw();
		    if (!ec.mobile) {
		    	cpDebugView.step();
		    }

		    debugView.stats.end();
		},

		resize: function() {
			ec.initDisplay();
			view.resize();
			cpDebugView.resize();
		}

	};

	requestAnimationFrame( core.init );

	if (!ec.mobile) {
		window.onresize = core.resize;
	}

})();