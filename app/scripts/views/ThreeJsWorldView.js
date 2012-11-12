var ec = ec || {};

(function() {
	'use strict';
	var THREE = window.THREE;

	ec.ThreeJsWorldView = function() {
		var camera =
		this.camera = new THREE.PerspectiveCamera( 75, ec.width / ec.height, 1, 10000 );
	    //this.camera = new THREE.OrthographicCamera( ec.width / - 2, ec.width / 2, ec.height / 2, ec.height / - 2, 1, 10000 );
	    //this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 10000 );
	    camera.position.z = 1000;
	    camera.position.x = -1000;
	    camera.lookAt(new THREE.Vector3(0, 0, 0));

	    this.scene = new THREE.Scene();

	    var renderer =
	    this.renderer = new THREE.CanvasRenderer();
	    renderer.setSize( ec.width, ec.height );
	    
	    renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.left = '0px';
		renderer.domElement.style.top = '0px';
	    document.body.appendChild( renderer.domElement );
	};

	ec.ThreeJsWorldView.prototype.updateBody = function() {
		var scene = this.scene;
		return function(body) {
			body.view.update(body, scene);
		};
	};

	ec.ThreeJsWorldView.prototype.draw = function() {
		this.renderer.render( this.scene, this.camera );
	};

})();