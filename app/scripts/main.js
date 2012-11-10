var ec = ec || {};

ec.width = 960;//1280;
ec.height = 540;//720;

(function() {
	'use strict';
	var cp = window.cp;
	var THREE = window.THREE;
	var requestAnimationFrame = window.requestAnimationFrame;
	var Stats = window.Stats;

	var space;
	var TIME_STEP = 1000/60;

	var camera, scene, renderer;

	var delta, deltaTime, remainder;

	var stats;

	var v = cp.v;
	var BOX_WIDTH = 200;
	var BOX_HEIGHT = 200;
	var GRABABLE_MASK_BIT = 1<<31;
	var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;

	var core = {


		init: function(time) {
			space = new cp.Space();
			space.iterations = 30;
			space.gravity = v(0, -300);
			space.sleepTimeThreshold = 0.5;
			space.collisionSlop = 0.5;

			var floor = space.addShape(new cp.SegmentShape(space.staticBody, v(-10000, -500), v(10000, -500), 0));
			floor.setElasticity(1);
			floor.setFriction(1);
			floor.setLayers(NOT_GRABABLE_MASK);


			camera = new THREE.PerspectiveCamera( 75, ec.width / ec.height, 1, 10000 );
		    //camera = new THREE.OrthographicCamera( ec.width / - 2, ec.width / 2, ec.height / 2, ec.height / - 2, 1, 10000 );
		    //camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 10000 );
		    camera.position.z = 1000;

		    scene = new THREE.Scene();

		    renderer = new THREE.CanvasRenderer();
		    renderer.setSize( ec.width, ec.height );

		    //$("hero-unit").append( renderer.domElement );
		    renderer.domElement.style.position = 'absolute';
			renderer.domElement.style.left = '0px';
			renderer.domElement.style.top = '0px';
		    document.body.appendChild( renderer.domElement );


		    stats = new Stats();
			// stats.setMode(1);
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.left = '0px';
			stats.domElement.style.top = '0px';
		    document.body.appendChild( stats.domElement );


		    core.addBox();

		    deltaTime = time;
		    remainder = 0;
		    requestAnimationFrame( core.animate );
		},

		addBox: function() {
			var mass = 1;
			var moment = cp.momentForBox(mass, BOX_WIDTH, BOX_HEIGHT);
			var body = space.addBody(new cp.Body(mass, moment));
			body.setPos(v(0, 500));
			//space.addBody(body);
			var shape = new cp.BoxShape(body, BOX_WIDTH, BOX_HEIGHT);
			space.addShape(shape);
			shape.setElasticity(0);
			shape.setFriction(0.6);


			var geometry = new THREE.CubeGeometry( BOX_WIDTH, BOX_HEIGHT, BOX_WIDTH );
		    var material = new THREE.MeshBasicMaterial( {
				color: 0xff0000, wireframe: true
		    } );

		    var mesh = new THREE.Mesh( geometry, material );
		    scene.add( mesh );

		    body.updateView = function() {
			    mesh.position.x = body.p.x;
				mesh.position.y = body.p.y;
				mesh.rotation.z = body.a;
		    };
		    body.updateView();
		},

		animate: function(time) {
			stats.begin();

			// note: three.js includes requestAnimationFrame shim
		    requestAnimationFrame( core.animate );

			delta = time - deltaTime;
			deltaTime = time;

			delta = Math.max(TIME_STEP, Math.min(delta, TIME_STEP*5));
			remainder += delta;
			while(remainder > TIME_STEP) {
				remainder -= TIME_STEP;
				space.step(TIME_STEP/1000);
			}

			if (space.activeShapes.count > 0) { //} || Demo.resized) {
				//	space.eachShape(function(shape) {
				//		console.log(delta, shape.body.p.y);
				//	});
			    space.eachBody(function(body) {
					body.updateView();
				});
			} else {
				core.addBox();
			}

		    renderer.render( scene, camera );

		    stats.end();
		}

	};

	requestAnimationFrame( core.init );

	ec.Core = core;

})();