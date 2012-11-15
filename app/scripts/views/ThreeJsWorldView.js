var ec = ec || {};

(function() {
	'use strict';
	var THREE = window.THREE;
	var ratio = window.devicePixelRatio || 1;
	ec.width = 960;//1280;
	ec.height = 540;//720;

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
	    renderer.setSize( ec.width * ratio, ec.height * ratio );
	    renderer.domElement.style.width = ec.width + 'px';
        renderer.domElement.style.height = ec.height + 'px';
	    renderer.domElement.style.position = 'absolute';
		renderer.domElement.style.left =
		renderer.domElement.style.top = '0px';
		renderer.domElement.getContext( '2d' ).scale(ratio, ratio);
	    document.body.appendChild( renderer.domElement );
	};

	ec.ThreeJsWorldView.prototype.updateShape = function() {
		var scene = this.scene;
		return function(shape) {
			if (shape.view) {
				shape.view.update(shape, scene);
			}
		};
	};

	ec.ThreeJsWorldView.prototype.lookAt = function(x, y, z) {
		this.camera.lookAt(new THREE.Vector3(x, y, z));
	};

	ec.ThreeJsWorldView.prototype.draw = function() {
		this.renderer.render( this.scene, this.camera );
	};

})();