(function(window) {
	'use strict';

	var cp = window.cp;
	var v = cp.v;
	var GRABABLE_MASK_BIT = 1<<31;
	var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;

	var WORLD_BOUNDS = 640;

	var World = window.ec.World = function() {
		this.time = 0;

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

	var proto = World.prototype;

	proto.addWalls = function() {
		this.addLineSegment(v( WORLD_BOUNDS, -WORLD_BOUNDS ), v( WORLD_BOUNDS,  WORLD_BOUNDS ));
		this.addLineSegment(v( WORLD_BOUNDS,  WORLD_BOUNDS ), v(-WORLD_BOUNDS,  WORLD_BOUNDS ));
		this.addLineSegment(v(-WORLD_BOUNDS,  WORLD_BOUNDS ), v(-WORLD_BOUNDS, -WORLD_BOUNDS ));
		this.addLineSegment(v(-WORLD_BOUNDS, -WORLD_BOUNDS ), v( WORLD_BOUNDS, -WORLD_BOUNDS ));
	};

	proto.addLineSegment = function(v1, v2) {
		var wall = this.space.addShape(new cp.SegmentShape(this.space.staticBody, v1, v2, 0));
		wall.setElasticity(0);
		wall.setFriction(1);
		wall.setLayers(NOT_GRABABLE_MASK);
		return wall;
	};

	proto.add = function(entity) {
		if (this.entities.indexOf(entity) < 0) {
			if (!entity.body.isStatic()) {
				this.space.addBody(entity.body);
			}
			this.space.addShape(entity.shape);
			this.entities.push(entity);
			return entity;
		}
		console.error('entity already a child of world', entity);
		return null;
	};

	proto.remove = function(entity) {
		var index = this.entities.indexOf(entity);
		if (index > -1) {
			if (!entity.body.isStatic()) {
				this.space.removeBody(entity.body);
			}
			this.space.removeShape(entity.shape);
			this.entities.splice(index, 1);
			return entity;
		}
		console.error('entity not a child of world', entity);
		return null;
	};

	proto.contains = function(entity) {
		return (this.entities.indexOf(entity) > -1);
	};

	proto.createStaticBody = function() {
		var body = new cp.Body(Infinity, Infinity);
		body.nodeIdleTime = Infinity;
		return body;
	};

	proto.step = function(delta) {
		for(var i = this.entities.length; i-- > 0;) {
			this.entities[i].step(delta);
		}
		this.space.step(delta / 1000);
		this.time += delta;
	};

})(window);