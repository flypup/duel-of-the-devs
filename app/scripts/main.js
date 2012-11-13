var ec = ec || {};

ec.width = 960;//1280;
ec.height = 540;//720;

(function() {
	'use strict';
	var requestAnimationFrame = window.requestAnimationFrame;
	
	var world;
	var view;
	var updateShapeView;
	var redraw;
	var debugView;
	var cpDebugView;
	
	var TIME_STEP = 1000/60;
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

		    view = new ec.ThreeJsWorldView();
		    updateShapeView = view.updateShape();

		    debugView = new ec.DebugView();
		    cpDebugView = new ec.ChipmunkDebugView(world.space);
		},

		animate: function(time) {
			debugView.stats.begin();

			// note: three.js includes requestAnimationFrame shim
		    requestAnimationFrame( core.animate );

			delta = time - deltaTime;
			deltaTime = time;

			delta = Math.max(TIME_STEP, Math.min(delta, TIME_STEP*5));
			remainder += delta;
			while(remainder > TIME_STEP) {
				remainder -= TIME_STEP;
				world.step(TIME_STEP/1000);
			}

			if (world.space.activeShapes.count > 0 || redraw) {
			    world.space.eachShape(updateShapeView);
			    redraw = false;
			} else {
				world.add(new ec.Box()).setView(new ec.ThreeJsBoxView());
				world.add(new ec.Circle()).setView(new ec.ThreeJsSphereView());
			}

		    view.draw();
		    cpDebugView.step();

		    debugView.stats.end();
		}

	};

	requestAnimationFrame( core.init );

})();