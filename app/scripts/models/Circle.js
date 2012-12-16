(function(window) {
	'use strict';

	var ec = window.ec;

	var RADIUS = 32;

	var Circle = ec.Circle = function(mass, radius, height) {
		if (height) {
			radius = radius/2;
		}
		radius = radius || RADIUS;
		if (mass === undefined) {
			mass = 1;
		}
		
		this.assignCircleShape(radius, mass);
		
		this.shape.setElasticity(0);
		this.shape.setFriction(0.6);
		
		this.shape.collision_type = ec.World.PROP_TYPE;
	};

	var proto = Circle.prototype;
	ec.extend(proto, ec.Entity.prototype);

	
})(window);