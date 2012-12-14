(function(window) {
	'use strict';

	var ec = window.ec;
	var THREE = window.THREE;
	
	var ThreeJsSphereView = ec.ThreeJsSphereView = function() {
		this.update = this.createMesh;
	};

	ThreeJsSphereView.prototype.createMesh = function(body, scene) {

		//var verts = body.shape.verts;
		var RADIUS  = 32;
		var segmentsWidth = 4;//12;//3;//
		var segmentsHeight = 2;//6;//

		var geometry = new THREE.SphereGeometry( RADIUS, segmentsWidth, segmentsHeight );
	    var material = new THREE.MeshBasicMaterial( {
			color: 0xff0000, wireframe: true
	    } );

	    var mesh =
	    this.mesh = new THREE.Mesh( geometry, material );
	    mesh.matrixAutoUpdate = false;
	    mesh.frustumCulled = false;
	    //mesh.renderDepth

	    scene.add( mesh );

	    this.update = this.updateMesh;
	    this.update(body, scene);
	};

	ThreeJsSphereView.prototype.updateMesh = function(shape, scene) {
		if (shape.body && !shape.body.isSleeping()) {
		    this.mesh.position.x = shape.body.p.x;
			this.mesh.position.y = shape.body.p.y;
			this.mesh.position.z = shape.body.z;
			this.mesh.rotation.z = shape.body.a;
			// TODO: mesh.renderDepth - custom (faster) depth sorting
			this.mesh.updateMatrix();
		}
	};

})(window);