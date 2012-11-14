var ec = ec || {};
var cp = cp;
(function() {
	'use strict';

	var v = cp.v;
	var GRABABLE_MASK_BIT = 1<<31;
	var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;

	ec.World = function() {
		var space =
		this.space = new cp.Space();
		space.gravity = v(0, -300);
		space.iterations = 8;
		space.sleepTimeThreshold = ec.TIME_STEP * 9;
		space.idleSpeedThreshold = 5;
		space.collisionSlop = 0.1;
		space.damping = 0.99;
	};

	ec.World.prototype.add = function(bodyShape) {
		if (!bodyShape.body.isStatic()) {
			this.space.addBody(bodyShape.body);
		}
		this.space.addShape(bodyShape.shape);
		return bodyShape;
	};

	ec.World.prototype.createStaticBody = function() {
		var body = new cp.Body(Infinity, Infinity);
		body.nodeIdleTime = Infinity;
		return body;
	};

	ec.World.prototype.addFloor = function() {
		var floor = this.space.addShape(new cp.SegmentShape(this.space.staticBody, v(-10000, -500), v(10000, -500), 0));
		floor.setElasticity(1);
		floor.setFriction(1);
		floor.setLayers(NOT_GRABABLE_MASK);
		return floor; // Floor.js / Wall.js
	};

	ec.World.prototype.step = function(time) {
		this.space.step(time);
	};

})();