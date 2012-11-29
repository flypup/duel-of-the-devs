(function(window) {
	'use strict';

	var cp = window.cp;
	var v = cp.v;
	var GRABABLE_MASK_BIT = 1<<31;
	var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;

	var WORLD_BOUNDS = 640;

	var World = window.ec.World = function() {
		var space =
		this.space = new cp.Space();
		space.gravity = v(0, 0);
		space.iterations = 10;
		space.sleepTimeThreshold = window.ec.TIME_STEP * 9;
		space.idleSpeedThreshold = 0.1;//5;//0.01;//
		space.collisionSlop = 0.025;
		space.collisionBias = Math.pow(1 - 0.75, 60);
		space.damping = 0.5;//0.99;//

		this.entities = [];
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
		var index = this.entities.indexOf(bodyShape);
		if (index < 0) {
			if (!bodyShape.body.isStatic()) {
				this.space.addBody(bodyShape.body);
			}
			this.space.addShape(bodyShape.shape);
			this.entities.push(bodyShape);
			return bodyShape;
		}
		console.error('entity already a child of world', bodyShape);
		return null;
	};

	World.prototype.remove = function(bodyShape) {
		var index = this.entities.indexOf(bodyShape);
		if (index > -1) {
			if (!bodyShape.body.isStatic()) {
				this.space.removeBody(bodyShape.body);
			}
			this.space.removeShape(bodyShape.shape);
			this.entities.splice(index, 1);
			return bodyShape;
		}
		console.error('entity not a child of world', bodyShape);
		return null;
	};

	World.prototype.createStaticBody = function() {
		var body = new cp.Body(Infinity, Infinity);
		body.nodeIdleTime = Infinity;
		return body;
	};

	World.prototype.step = function(time) {
		for(var i = 0, len = this.entities.length; i < len; i++) {
			this.entities[i].step(time);
		}
		this.space.step(time);
	};

})(window);