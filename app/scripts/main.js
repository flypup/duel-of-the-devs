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

		    view = new ec.ThreeJsWorldView();
		    updateShapeView = view.updateShape();

		    cpDebugView = new ec.ChipmunkDebugView(world.space);
		    debugView = new ec.DebugView();

		    // GUI Settings
			debugView.addGui([
				{
					name: 'space',
					remember: true,
					target: world.space,
					props: [
						{name: 'iterations', params:{min: 1, max: 40}},
						{name: 'sleepTimeThreshold', params:{step: TIME_STEP, min: TIME_STEP, max: 1}},
						{name: 'collisionSlop', params:{step: 0.1, min: 0.1, max: 1}},
						'damping',
						{name: 'idleSpeedThreshold', listen: true, params:{min: 0, max: 50}},
						{name: 'collisionBias'},
						'enableContactGraph'
					]
				}
			]);
			debugView.addGui([
				{
					name: 'gravity',
					target: world.space.gravity,
					props: [
						{name: 'x', params:{step: 10, min: -1000, max: 1000}},
						{name: 'y', params:{step: 10, min: -1000, max: 1000}}
					]
				}
		    ]);
		    var lookAtCenter = function(e) {//e.object, e.property
				view.lookAt(0, 0, 0);
			};
		    debugView.addGui([
				{
					name: 'camera',
					remember: true,
					target: view.camera.position,
					props: [
						{name: 'x', listen: true, onChange: lookAtCenter, params:{step: 10, min: -5000, max: 5000}},
						{name: 'y', listen: true, onChange: lookAtCenter, params:{step: 10, min: -5000, max: 5000}},
						{name: 'z', listen: true, onChange: lookAtCenter}
					]
				}
		    ]);
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
		    cpDebugView.step();

		    debugView.stats.end();
		}

	};

	requestAnimationFrame( core.init );

})();