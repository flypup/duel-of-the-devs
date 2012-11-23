(function($) {
	'use strict';

	var cp = $.cp;
	var v = cp.v;
	var GRABABLE_MASK_BIT = 1<<31;
	var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;

	var WORLD_BOUNDS = 800;

	var World = $.ec.World = function() {
		var space =
		this.space = new cp.Space();
		space.gravity = v(0, 0);
		space.iterations = 10;
		space.sleepTimeThreshold = $.ec.TIME_STEP * 9;
		space.idleSpeedThreshold = 1;//5;//0.01;//
		space.collisionSlop = 0.1;
		space.damping = 0.5;//0.99;//
	};

	World.prototype.addWalls = function() {
		this.addLineSegment(v( WORLD_BOUNDS, -WORLD_BOUNDS ), v( WORLD_BOUNDS,  WORLD_BOUNDS ));
		this.addLineSegment(v( WORLD_BOUNDS,  WORLD_BOUNDS ), v(-WORLD_BOUNDS,  WORLD_BOUNDS ));
		this.addLineSegment(v(-WORLD_BOUNDS,  WORLD_BOUNDS ), v(-WORLD_BOUNDS, -WORLD_BOUNDS ));
		this.addLineSegment(v(-WORLD_BOUNDS, -WORLD_BOUNDS ), v( WORLD_BOUNDS, -WORLD_BOUNDS ));
	};

	World.prototype.addLineSegment = function(v1, v2) {
		var wall = this.space.addShape(new cp.SegmentShape(this.space.staticBody, v1, v2, 0));
		wall.setElasticity(0);
		wall.setFriction(1);
		wall.setLayers(NOT_GRABABLE_MASK);
		return wall;
	};

	World.prototype.add = function(bodyShape) {
		if (!bodyShape.body.isStatic()) {
			this.space.addBody(bodyShape.body);
		}
		this.space.addShape(bodyShape.shape);
		return bodyShape;
	};

	World.prototype.createStaticBody = function() {
		var body = new cp.Body(Infinity, Infinity);
		body.nodeIdleTime = Infinity;
		return body;
	};

	World.prototype.step = function(time) {
		this.space.step(time);
	};

})(window);