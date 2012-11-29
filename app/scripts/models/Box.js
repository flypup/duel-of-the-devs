(function(window) {
	'use strict';

	var ec = window.ec;

	var BOX_WIDTH = 64;
	var BOX_HEIGHT = 64;

	var Box = window.ec.Box = function(mass) {
		if (mass === undefined) {
			mass = 1;
		}
		this.assignBoxShape(BOX_WIDTH, BOX_HEIGHT, mass);

		this.shape.setElasticity(0);
		this.shape.setFriction(0.6);

		this.setPos(-64, 0, 32);
	};

	var proto = Box.prototype;
	ec.extend(proto, ec.Entity.prototype);

	
})(window);