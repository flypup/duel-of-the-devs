(function(window) {
	'use strict';

	var cp = window.cp;
	var v = cp.v;

	var RADIUS = 32;

	var Circle = window.ec.Circle = function() {
		var mass = 1;
		var moment = cp.momentForCircle(mass, 0, RADIUS, v(0, 0));//cp.vzero);
		
		var body =
		this.body = new cp.Body(mass, moment);

		var shape =
		this.shape = new cp.CircleShape(body, RADIUS, v(0, 0));
		
		shape.setElasticity(0);
		shape.setFriction(0.6);

		this.setPos(64, 64, 32);
	};

	var proto = Circle.prototype;
	proto.z = 0;

	proto.setView = function(view) {
		this.view = this.shape.view = view;
		return this;
	};

	proto.setPos = function(x, y, z) {
		this.body.activate();
		this.body.p.x = x;
		this.body.p.y = y;
		if (z !== undefined) {
			this.z = this.body.z = z;
		}
		return this;
	};

	proto.step = function(time) {
		return this;
	};

})(window);