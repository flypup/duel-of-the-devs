(function(window) {
	'use strict';

	var ec = window.ec;

	var BOX_WIDTH = 64;
	var BOX_HEIGHT = 64;

	var Box = ec.Box = function(mass, width, height) {
		width  = width  || BOX_WIDTH;
		height = height || BOX_HEIGHT;
		if (mass === undefined) {
			mass = 1;
		}
		this.assignBoxShape(width, height, mass);

		this.shape.setElasticity(0);
		this.shape.setFriction(0.6);
		
		this.shape.collision_type = ec.Collisions.PROP;
	};

	var proto = Box.prototype;
	Box.ready = function() {
		ec.extend(proto, ec.Entity.prototype);
	};
	
})(window);