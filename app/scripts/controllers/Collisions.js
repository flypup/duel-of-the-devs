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

	function pushCollision(arbiter, space) {
		// var contact = arbiter.contacts && arbiter.contacts.length && arbiter.contacts[0];
		// if (contact) {
		if (ec.debug > 0) {
			//console.log('push collision', arbiter);
		}
		var pushedBody   = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
		var pushedEntity = pushedBody.userData.parent;
		if (pushedEntity) {
			pushedEntity.hit(arbiter, DAMAGE); // pushed
			arbiter.ignore();
			return false;
		}
		return (arbiter.contacts && arbiter.contacts.length);
	}

	function entitiesCollide(arbiter, space) {
		var entityA = arbiter.swappedColl ? arbiter.body_b.userData.parent : arbiter.body_a.userData.parent;
		var entityB = arbiter.swappedColl ? arbiter.body_a.userData.parent : arbiter.body_b.userData.parent;
		if (entityA && entityB) {
			if (entityA.hitTime && !entityB.hitTime) {
				entityB.hit(arbiter, 0);
			} else if (entityB.hitTime && !entityA.hitTime) {
				if (arbiter.handler.a === Collisions.PLAYER) {
					return;
				}
				entityA.hit(arbiter, 0);
			}
		}
		return true;
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
		if ( a.z === bBounds.top) {
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
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.MONSTER,	_,	depthTest,			pushCollision,	_);
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.PROJECTILE,_,	depthTest,			pushCollision,	_);

			// Entity to Entity
			space.addCollisionHandler(Collisions.MONSTER,	Collisions.MONSTER,		_,	depthTest,			entitiesCollide,_);
			space.addCollisionHandler(Collisions.PLAYER,	Collisions.MONSTER,		_,	depthTest,			entitiesCollide,_);
			
			// Projectile to Obstacle / Target
			space.addCollisionHandler(Collisions.PROJECTILE, Collisions.PROP,		_,	depthTest,			entitiesCollide,_);
			space.addCollisionHandler(Collisions.PROJECTILE, Collisions.PLAYER,		_,	depthTest,			pushCollision,	_);

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
