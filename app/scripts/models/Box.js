(function(window) {

	var ec = window.ec;

	var Box = ec.Box = function(mass, width, height) {
		this.setBaseProperties();

		width  = width  || 64;
		height = height || 64;
		if (mass === undefined) {
			mass = 1;
		}
		this.assignBoxShape(width, height, mass);

		this.shape.setElasticity(0);
		this.shape.setFriction(0.6);
		
		this.shape.collision_type = ec.Collisions.PROP;

		this.type = 'Box';

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	Box.ready = function() {
		ec.extend(Box.prototype, ec.Entity.prototype);
	};

	Box.prototype = {
		activate: function() {
			this.shape.collision_type = ec.Collisions.PROP;
		}
	};
	
})(window);