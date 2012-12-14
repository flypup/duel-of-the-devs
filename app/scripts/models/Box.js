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

		this.setPos(-64, 0, 0);
		
		this.shape.collision_type = ec.World.PROP_TYPE;
	};

	var proto = Box.prototype;
	ec.extend(proto, ec.Entity.prototype);

	
})(window);