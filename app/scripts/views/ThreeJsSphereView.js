var ec = ec || {};

(function() {
	'use strict';
	var THREE = window.THREE;

	ec.ThreeJsSphereView = function() {
		this.update = this.createMesh;
	};

	ec.ThreeJsSphereView.prototype.createMesh = function(body, scene) {

		//var verts = body.shape.verts;
		var RADIUS  = 75;
		var segmentsWidth = 12;
		var segmentsHeight = 6;

		var geometry = new THREE.SphereGeometry( RADIUS, segmentsWidth, segmentsHeight );
	    var material = new THREE.MeshBasicMaterial( {
			color: 0xff0000, wireframe: true
	    } );

	    this.mesh = new THREE.Mesh( geometry, material );

	    scene.add( this.mesh );

	    this.update = this.updateMesh;
	    this.update(body, scene);
	};

	ec.ThreeJsSphereView.prototype.updateMesh = function(shape, scene) {
	    this.mesh.position.x = shape.body.p.x;
		this.mesh.position.y = shape.body.p.y;
		this.mesh.rotation.z = shape.body.a;
	};

})();