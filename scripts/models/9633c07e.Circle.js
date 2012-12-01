(function(window) {
	'use strict';

	var ec = window.ec;

	var RADIUS = 32;

	var Circle = window.ec.Circle = function() {
		this.assignCircleShape(RADIUS, 1);
		
		this.shape.setElasticity(0);
		this.shape.setFriction(0.6);

		this.setPos(64, 64, 0);
		
		this.shape.collision_type = ec.World.PROP_TYPE;
	};

	var proto = Circle.prototype;
	ec.extend(proto, ec.Entity.prototype);

	
})(window);