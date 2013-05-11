(function(window) {

	var ec = window.ec;

	var RADIUS = 32;

	var Circle = ec.Circle = function(mass, radius, height) {
		this.setBaseProperties();
		
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

		this.type = 'Circle';

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	Circle.ready = function() {
		ec.extend(Circle.prototype, ec.Entity.prototype);
	};

	Circle.prototype = {
		activate: function() {
			this.shape.collision_type = ec.Collisions.PROP;
		}
	};
	
})(window);