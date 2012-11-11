var ec = ec || {};

(function() {
	'use strict';
	var THREE = window.THREE;

	ec.ThreeJsBoxView = function() {
		this.update = this.createMesh;
	};

	ec.ThreeJsBoxView.prototype.createMesh = function(body, scene) {

		//var verts = body.shape.verts;
		var BOX_WIDTH  = 200;
		var BOX_HEIGHT = 200;

		var geometry = new THREE.CubeGeometry( BOX_WIDTH, BOX_HEIGHT, BOX_WIDTH );
	    var material = new THREE.MeshBasicMaterial( {
			color: 0xff0000, wireframe: true
	    } );

	    this.mesh = new THREE.Mesh( geometry, material );

	    scene.add( this.mesh );

	    this.update = this.updateMesh;
	    this.update(body, scene);
	};

	ec.ThreeJsBoxView.prototype.updateMesh = function(body, scene) {
	    this.mesh.position.x = body.p.x;
		this.mesh.position.y = body.p.y;
		this.mesh.rotation.z = body.a;
	};

})();