(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;
	var GRABABLE_MASK_BIT = 1<<31;
	var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;

	var WORLD_BOUNDS = 640;

	var World = ec.World = function() {
		this.time = 0;

		var space =
		this.space = new cp.Space();
		space.gravity = v(0, 0);
		space.iterations = 10;
		space.sleepTimeThreshold = ec.TIME_STEP * 9;
		space.idleSpeedThreshold = 0.1;//5;//0.01;//
		space.collisionSlop = 0.025;
		space.collisionBias = Math.pow(1 - 0.75, 60);
		space.damping = 0.5;//0.99;//

		//space.addCollisionHandler(a, b, begin, preSolve, postSolve, separate)
		var pushHandler = ec.delegate(this, this.pushCollision);
		var bumpHandler = ec.delegate(this, this.bumpCollision);
		space.addCollisionHandler(World.PLAYER_HAND, World.MONSTER_TYPE, null, null, pushHandler, null);
		space.addCollisionHandler(World.MONSTER_TYPE, World.MONSTER_TYPE, bumpHandler, null, bumpHandler, null);

		this.entities = [];
	};

	World.PLAYER_TYPE = 1;
	World.PLAYER_HAND = 2;

	World.MONSTER_TYPE = 10;

	World.PROP_TYPE = 100;

	var proto = World.prototype;

	var DAMAGE = 10;
	proto.pushCollision = function(arbiter, space) {
		// var contact = arbiter.contacts && arbiter.contacts.length && arbiter.contacts[0];
		// if (contact) {
		//console.log('push collision', arbiter);
		var monsterBody = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
		var monsterEntity = this.entityForBody(monsterBody);
		if (monsterEntity) {
			monsterEntity.hit(arbiter, this, DAMAGE);
			arbiter.ignore();
			return false;
		}
		return (arbiter.contacts && arbiter.contacts.length);
	};

	proto.bumpCollision = function(arbiter, space) {

		//console.log('push collision', arbiter);
		var monsterEntityA = this.entityForBody(arbiter.body_a);
		var monsterEntityB = this.entityForBody(arbiter.body_b);
		if (monsterEntityA  && monsterEntityB) {
			if (monsterEntityA.hitTime && !monsterEntityB.hitTime) {
				monsterEntityB.hit(arbiter, this, 0);
			} else if (monsterEntityB.hitTime && !monsterEntityA.hitTime) {
				monsterEntityA.hit(arbiter, this, 0);
			}
			return !(monsterEntityA.hitTime > 0 && monsterEntityB.hitTime > 0);
		}
		return true;
	};

	proto.addWalls = function() {
		this.addBox(v( 0, -WORLD_BOUNDS -64), WORLD_BOUNDS*2 + 256, 128);
		this.addBox(v( 0,  WORLD_BOUNDS +64), WORLD_BOUNDS*2 + 256, 128);
		this.addBox(v( WORLD_BOUNDS +64,  0 ), 128, WORLD_BOUNDS*2 + 256);
		this.addBox(v(-WORLD_BOUNDS -64,  0 ), 128, WORLD_BOUNDS*2 + 256);

		// this.addLineSegment(v( WORLD_BOUNDS, -WORLD_BOUNDS ), v( WORLD_BOUNDS,  WORLD_BOUNDS ));
		// this.addLineSegment(v( WORLD_BOUNDS,  WORLD_BOUNDS ), v(-WORLD_BOUNDS,  WORLD_BOUNDS ));
		// this.addLineSegment(v(-WORLD_BOUNDS,  WORLD_BOUNDS ), v(-WORLD_BOUNDS, -WORLD_BOUNDS ));
		// this.addLineSegment(v(-WORLD_BOUNDS, -WORLD_BOUNDS ), v( WORLD_BOUNDS, -WORLD_BOUNDS ));
	};

	proto.addBox = function(v1, w, h) {
		var body = new cp.Body(Infinity, Infinity);
		body.nodeIdleTime = Infinity;
		body.p = v1;
		var wall = this.space.addShape(new cp.BoxShape(body, w, h));
		wall.setElasticity(0);
		wall.setFriction(1);
		wall.setLayers(NOT_GRABABLE_MASK);
		return wall;
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

	proto.entityForBody = function(body) {
		for(var i = this.entities.length; i-- > 0;) {
			if (this.entities[i].body === body) {
				return this.entities[i];
			}
		}
		console.error('no entity for body', body);
		return null;
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