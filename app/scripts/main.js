var ec = ec || {};

ec.width = 960;//1280;
ec.height = 540;//720;

(function() {
	'use strict';
	var THREE = window.THREE;
	var requestAnimationFrame = window.requestAnimationFrame;
	var Stats = window.Stats;
	var camera, scene, renderer;
	var geometry, material, mesh;
	var delta, deltaTime;
	var stats;

	var core = {


		init: function(time) {
			camera = new THREE.PerspectiveCamera( 75, ec.width / ec.height, 1, 10000 );
		    //camera = new THREE.OrthographicCamera( ec.width / - 2, ec.width / 2, ec.height / 2, ec.height / - 2, 1, 10000 );
		    //camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 10000 );
		    camera.position.z = 100;
		    
		    scene = new THREE.Scene();

		    geometry = new THREE.CubeGeometry( 200, 200, 200 );
		    material = new THREE.MeshBasicMaterial( {
				color: 0xff0000, wireframe: true
		    } );

		    mesh = new THREE.Mesh( geometry, material );
		    scene.add( mesh );

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


		    deltaTime = time;
		    requestAnimationFrame( core.animate );
		},

		animate: function(time) {
			stats.begin();

			delta = time - deltaTime;
			deltaTime = time;

			// note: three.js includes requestAnimationFrame shim
		    requestAnimationFrame( core.animate );

		    mesh.rotation.x += 0.01;
		    mesh.rotation.y += 0.02;

		    camera.position.z++;
		    //camera.lookAt(mesh.position);
		    // camera.left--;
		    // camera.top--;
		    // camera.right++;
		    // camera.bottom++;
		    //camera.updateProjectionMatrix();
		    //console.log(camera.position.z, camera.left);

		    renderer.render( scene, camera );

		    stats.end();
		}

	};

	requestAnimationFrame( core.init );

	ec.Core = core;

})();