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
		var mapBeginHandler  = ec.delegate(this, this.mapCollisionBegin);
		var mapPreSolveHandler = ec.delegate(this, this.mapCollisionPreSolve);
		var mapSeparateHandler = ec.delegate(this, this.mapCollisionSeparate);
		space.addCollisionHandler(World.PLAYER_HAND, World.MONSTER_TYPE, null, null, pushHandler, null);
		space.addCollisionHandler(World.MONSTER_TYPE, World.MONSTER_TYPE, bumpHandler, null, bumpHandler, null);
		space.addCollisionHandler(World.PLAYER_TYPE,  World.MAP_TYPE, mapBeginHandler, mapPreSolveHandler, null, mapSeparateHandler);
		space.addCollisionHandler(World.MONSTER_TYPE, World.MAP_TYPE, mapBeginHandler, mapPreSolveHandler, null, mapSeparateHandler);
		space.addCollisionHandler(World.PLAYER_HAND, World.MAP_TYPE, returnFalse, null, null, null);
		
		this.entities = [];
		this.elements = [];
	};

	World.PLAYER_TYPE = 1;
	World.PLAYER_HAND = 2;

	World.MONSTER_TYPE = 10;

	World.MAP_TYPE = 50;

	World.PROP_TYPE = 100;

	var proto = World.prototype;

	var returnFalse = function() {
		return false;
	};
	
	proto.term = function() {
		// TODO: call remove on all entities > bodies > shapes
		this.entities.length = 0;
		var space = this.space;
		space.locked = 0;
		space.removeCollisionHandler(World.PLAYER_HAND, World.MONSTER_TYPE);
		space.removeCollisionHandler(World.MONSTER_TYPE, World.MONSTER_TYPE);
		space.bodies.length = 0;
		space.sleepingComponents.length = 0;
		space.constraints.length = 0;
		space.arbiters.length = 0;
		space.constraints.length = 0;
		delete this.space;
	};

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

	proto.mapCollisionBegin = function(arbiter, space) {
		var mapBody    = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
		var mapElement = this.elementForBody(mapBody);
		console.log('mapCollisionBegin', arbiter, mapElement);

		// TODO: Add Map Element to Entity's Checklist

		return true;
	};

	proto.mapCollisionSeparate = function(arbiter, space) {
		var mapBody    = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
		var mapElement = this.elementForBody(mapBody);
		console.log('mapCollisionSeparate', arbiter, mapElement);

		// TODO: Remove Map Element from Entity's Checklist

		return true;
	};

	proto.mapCollisionPreSolve = function(arbiter, space) {
		// var contact = arbiter.contacts && arbiter.contacts.length && arbiter.contacts[0];
		// if (contact) {
		var entityBody = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
		var mapBody    = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
		var entity = this.entityForBody(entityBody);
		var mapElement = this.elementForBody(mapBody);
		//console.log('mapCollision', arbiter, mapElement);

		// TODO: Don't use this callback. Apply rules only based on Entity's Checklist - which element it's over - after step, pre draw

		if (entity && mapElement) {
			var entityBounds = entity.getSortBounds();
			//standing under
			if ( entityBounds.top < mapElement.z ) {
				return false;
			}
			var mapBounds = mapElement.getSortBounds();
			//standing over - fall
			if ( entity.z > mapBounds.top) {
				entity.z -= 4;
				return false;
			}
			//standing on
			if ( entity.z === mapBounds.top) {
				return false;
			}
			// able to climb
			if ( entity.z >= mapElement.z ) {
				if ((mapBounds.top - entity.z) <=128) { //mapBounds.top ) {
					//entity.z = Math.min(entity.z+4, mapBounds.top);
				}
			}

			//arbiter.ignore();
		}
		return true;
	};

	proto.addMapElement = function(element, offsetX, offsetY) {
		var x = element.x + offsetX;
		var y = element.y + offsetY;
		var z = element.mZ;

		if (element.mapType === 'entity') {
			var EntityClass = ec[element.type];
			
			console.log('map entity', element, x, y, z);
			var entity = this.add(new EntityClass(
				element.mass,
				element.mWidth,
				element.mHeight
			).setPos(x, y, z));
			entity.depth = element.mDepth;
			return entity;
		}

		var mapElement = new ec.MapElement();
		ec.extend(mapElement, element);
		mapElement.init();
		
		if (mapElement.mapType === 'wall') {
			var wall = this.addBox(v(x, y-(mapElement.mHeight/2)+z), mapElement.mWidth, mapElement.mHeight);
			wall.depth = mapElement.mDepth;
			wall.collision_type = World.MAP_TYPE;
			mapElement.body = wall.body;
			this.elements.push(mapElement);

		} else if (mapElement.mapType === 'floor') {
			var floor = this.addBox(v(x, y+mapElement.mDepth+z), mapElement.mWidth, mapElement.mHeight);
			floor.depth = mapElement.mDepth;
			floor.collision_type = World.MAP_TYPE;
			//floor.isSensor = true;
			mapElement.body = floor.body;
			this.elements.push(mapElement);

		} else if (mapElement.mapType === 'steps') {
			var steps = this.addBox(v(x, y-(mapElement.mHeight/2)+z), mapElement.mWidth, mapElement.mHeight);
			steps.depth = mapElement.mDepth;
			steps.collision_type = World.MAP_TYPE;
			mapElement.body = steps.body;
			this.elements.push(mapElement);

		} else {
			// parallax
			console.log('can\'t make cp shape for map shape:', mapElement);
		}

		return mapElement;
	};

	proto.addWalls = function(left, top, right, bottom) {
		this.addBox(v( (right-left)/2, top   -64), 256+right-left, 128);
		this.addBox(v( (right-left)/2, bottom+64), 256+right-left, 128);
		this.addBox(v(right +64,  (bottom-top)/2 ), 128, bottom-top);
		this.addBox(v(left  -64,  (bottom-top)/2 ), 128, bottom-top);
	};

	proto.addBox = function(v1, w, h) {
		var body = new cp.Body(Infinity, Infinity);
		body.nodeIdleTime = Infinity;
		v1.y = -v1.y;
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

	proto.elementForBody = function(body) {
		for(var i = this.elements.length; i-- > 0;) {
			if (this.elements[i].body === body) {
				return this.elements[i];
			}
		}
		console.error('no elements for body', body);
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
		for(var i = this.entities.length; i-- > 0;) {
			this.entities[i].postStep(delta);
		}
		this.time += delta;
	};

})(window);