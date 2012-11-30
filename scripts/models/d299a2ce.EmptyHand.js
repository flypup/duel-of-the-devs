(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;

	var EmptyHand = ec.EmptyHand = function(radius, mass) {
		radius = radius || 24;
		mass = mass || 1;

		this.assignCircleShape(radius, mass);
		
		this.shape.setElasticity(0.5);
		this.shape.setFriction(1);

		this.setPos(64, 64, 32);

		this.time = 0;
		this.phase = EmptyHand.PASSIVE;
	};

	EmptyHand.PASSIVE = 0;
	EmptyHand.PUSHING = 1;
	EmptyHand.GRABBING = 2;
	EmptyHand.PULLING = 3;

	var proto = EmptyHand.prototype;
	ec.extend(proto, ec.Entity.prototype);


})(window);