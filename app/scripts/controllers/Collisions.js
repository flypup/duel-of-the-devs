(function(window) {

	var ec = window.ec;

	var Collisions = ec.Collisions = function() {
		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	//shape layers
	Collisions.GRABABLE_MASK_BIT = 1<<31;
	Collisions.NOT_GRABABLE_MASK = ~Collisions.GRABABLE_MASK_BIT;
	
	
	//shape groups
	Collisions.PLAYER = 1;
	Collisions.PLAYER_HAND = 2;
	Collisions.MONSTER = 10;
	Collisions.PROJECTILE = 12;
	Collisions.MAP = 50;
	Collisions.PROP = 100;

	var DAMAGE = 10;
	
	// PRIVATE Collision Handlers
	
	// ENTITY-ENTITY

	function entityCollision(arbiter) {//, space) {
		var entityA = arbiter.swappedColl ? arbiter.body_b.userData.parent : arbiter.body_a.userData.parent;
		var entityB = arbiter.swappedColl ? arbiter.body_a.userData.parent : arbiter.body_b.userData.parent;
		// TESTS
		if (!(entityA && entityB)) {
			throw('entityCollision: undefined entity');
		}
		if (!(arbiter.contacts && arbiter.contacts.length)) {
			throw('entityCollision: no contacts');
		}

		// See collision points in world
		if (ec.debug > 1) {
			var p = arbiter.contacts[0].p,
				z = entityA.z + entityA.depth / 2;
			setTimeout(function() {
				// TODO: dot pool
				var dot = new ec.Dot(entityA.groupId, 1000);
				dot.setPos(p.x, -p.y, z);
				ec.world.add(dot);
			}, 0);
		}

		// if either returns true, contact is ignored
		var ignoreA = entityA.contact(entityB, arbiter);
		return entityB.contact(entityA, arbiter) || ignoreA;
	}

	// ENTITY-MAP

	function mapBegin(arbiter, space) {
		var entityBody = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
		var mapBody    = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
		var entity     = entityBody.userData.parent;
		var mapElement = mapBody.userData.parent;
		if (ec.debug > 0) {
			//console.log('mapBegin', entity.type, mapElement);
		}
		// Add Map Element to Entity's Checklist
		entity.addMapCollision(mapElement);

		return true;
	}

	function mapSeparate(arbiter, space) {
		var entityBody = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
		var mapBody    = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
		var entity     = entityBody.userData.parent;
		var mapElement = mapBody.userData.parent;
		if (ec.debug > 0) {
			//console.log('mapSeparate', entity.type, mapElement);
		}

		// don't separate if we're inside the object
		var mapShape = arbiter.swappedColl ? arbiter.a : arbiter.b;
		var info = mapShape.nearestPointQuery(entity.body.p);
		if (info.d < 0) {
			return;
		}

		// Remove Map Element from Entity's Checklist
		entity.removeMapCollision(mapElement);
	}

	// ENTITY OR MAP

	function debugDepthTest(arbiter, space) {
		var bodyA = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
		var bodyB = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;

		if (ec.debug > 0) {
			if (bodyB.userData && bodyB.userData.parent && bodyB.userData.parent instanceof ec.Player) {
				console.log('wawawaw', bodyB.userData.parent);
			}
		}

		//return depthCollision(bodyA.userData.parent, bodyB.userData.parent);
		var a = bodyA.userData.parent;
		var b = bodyB.userData.parent;

		var aBounds = a.getSortBounds();
		//standing under
		if ( aBounds.top < b.z ) {
			console.log('standing under', a, b);
			return false;
		}
		var bBounds = b.getSortBounds();
		//standing over - fall
		if ( a.z > bBounds.top) {
			console.log('standing over - fall', a, b);
			return false;
		}
		//standing on
		//if ( a.z === bBounds.top) {
		if ( a.z - bBounds.top > -2) { //with tolerance
			if (a.z < bBounds.top) {
				console.warn('corrected entity z in depth collision test', a.type, b.name);
				a.z = bBounds.top; //correction
			}
			console.log('standing on', a, b);
			return false;
		}

		if (ec.debug > 0) {
			console.log('depth Collision', a, b);
		}
		//collision
		return true;
	}

	function depthTest(arbiter, space) {
		//this one happens on every step and must be very efficient
		var bodyA = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
		var bodyB = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
		return depthCollision(bodyA.userData.parent, bodyB.userData.parent);
	}

	function depthCollision(a, b) {
		//determine if entity is outside of collision z

		var aBounds = a.getSortBounds();
		//standing under
		if ( aBounds.top < b.z ) {
			return false;
		}
		var bBounds = b.getSortBounds();
		//standing over - fall
		if ( a.z > bBounds.top) {
			return false;
		}
		//standing on
		//if ( a.z === bBounds.top) {
		if ( a.z - bBounds.top > -2) { //with tolerance
			if (a.z < bBounds.top) {
				console.warn('corrected entity z in depth collision test', a.type, b.name);
				a.z = bBounds.top; //correction
			}
			return false;
		}

		if (ec.debug > 0) {
			//console.log('depth Collision', a, b);
		}
		//collision
		return true;
	}

	function passThrough() {
		return false;
	}

	Collisions.prototype = {
		init: function(space) {
			var _ = null;
			// Player Attacks
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.MONSTER,	_,	depthTest,			entityCollision,	_);
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.PROJECTILE,_,	depthTest,			entityCollision,	_);

			// Entity to Entity
			space.addCollisionHandler(Collisions.MONSTER,	Collisions.MONSTER,		_,	depthTest,			entityCollision,	_);
			//space.addCollisionHandler(Collisions.MONSTER,	Collisions.PLAYER,		_,	depthTest,			entityCollision,	_);
			
			// Projectile to Obstacle / Target
			space.addCollisionHandler(Collisions.PROJECTILE, Collisions.PROP,		_,	depthTest,			entityCollision,	_);
			space.addCollisionHandler(Collisions.PROJECTILE, Collisions.PLAYER,		_,	depthTest,			entityCollision,	_);

			// Entity to Map
			space.addCollisionHandler(Collisions.PLAYER,	Collisions.MAP,			mapBegin,	depthTest,	_,				mapSeparate);
			space.addCollisionHandler(Collisions.MONSTER,	Collisions.MAP,			mapBegin,	depthTest,	_,				mapSeparate);
			space.addCollisionHandler(Collisions.PROJECTILE, Collisions.MAP,		mapBegin,	depthTest,	_,				mapSeparate);
			
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.MAP,		_,	depthTest,			_, _);
			space.addCollisionHandler(Collisions.PROP,  Collisions.MONSTER,		    _,	depthTest,			_, _);
			space.addCollisionHandler(Collisions.PROP,	Collisions.PLAYER,		    _,	depthTest,			_, _);
			space.addCollisionHandler(Collisions.PROP,	Collisions.PLAYER_HAND,		_,	depthTest,			_, _);
			
		},

		term: function() {

		},


	};

})(window);
