(function($) {
	'use strict';

	var cp = $.cp;
	var v = cp.v;

	var RADIUS = 32;

	var Circle = $.ec.Circle = function() {
		this.z = 0;
		
		var mass = 1;
		var moment = cp.momentForCircle(mass, 0, RADIUS, v(0, 0));//cp.vzero);
		
		var body =
		this.body = new cp.Body(mass, moment);

		var shape =
		this.shape = new cp.CircleShape(body, RADIUS, v(0, 0));
		
		shape.setElasticity(0);
		shape.setFriction(0.6);

		this.setView({});
		this.setPos(64, 64, 32);
	};

	Circle.prototype.setView = function(view) {
		this.view = this.shape.view = view;
		return this;
	};

	Circle.prototype.setPos = function(x, y, z) {
		this.body.setPos(v(x, y));
		this.z = this.body.z = z;
		return this;
	};

	Circle.prototype.step = function(time) {
		return this;
	};

})(window);