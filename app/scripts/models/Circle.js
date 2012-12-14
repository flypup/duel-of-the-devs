(function(window) {
	'use strict';

	var ec = window.ec;

	var RADIUS = 32;

	var Circle = ec.Circle = function(mass, radius) {
		radius = radius || RADIUS;
		if (mass === undefined) {
			mass = 1;
		}
		
		this.assignCircleShape(radius, mass);
		
		this.shape.setElasticity(0);
		this.shape.setFriction(0.6);

		this.setPos(64, 64, 0);
		
		this.shape.collision_type = ec.World.PROP_TYPE;
	};

	var proto = Circle.prototype;
	ec.extend(proto, ec.Entity.prototype);

	
})(window);