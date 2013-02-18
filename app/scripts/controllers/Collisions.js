(function(window) {
	'use strict';

	var ec = window.ec;

	var Collisions = ec.Collisions = function() {
		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

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
		//console.log('push collision', arbiter);
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
		var entityA = arbiter.body_a.userData.parent;
		var entityB = arbiter.body_b.userData.parent;
		if (entityA && entityB) {
			if (entityA.hitTime && !entityB.hitTime) {
				entityB.hit(arbiter, 0);
			} else if (entityB.hitTime && !entityA.hitTime) {
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
		// Remove Map Element from Entity's Checklist
		entity.removeMapCollision(mapElement);
	}

	// ENTITY OR MAP

	function depthTest(arbiter, space) {
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
		if ( a.z === bBounds.top) {
			return false;
		}

		if (ec.debug > 0) {
			//console.log('map', a, b);
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
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.MONSTER,	depthTest,	_,			pushCollision,	_);
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.PROJECTILE,depthTest,	_,			pushCollision,	_);

			// Entity to Entity
			space.addCollisionHandler(Collisions.MONSTER,	Collisions.MONSTER,		depthTest,	_,			entitiesCollide,_);
			
			// Projectile to Obstacle / Target
			space.addCollisionHandler(Collisions.PROJECTILE, Collisions.PROP,		depthTest,	_, 			entitiesCollide,_);
			space.addCollisionHandler(Collisions.PROJECTILE, Collisions.PLAYER,		depthTest,	_,			pushCollision,	_);

			// Entity to Map
			space.addCollisionHandler(Collisions.PLAYER,	Collisions.MAP,			mapBegin,	depthTest,	_,				mapSeparate);
			space.addCollisionHandler(Collisions.MONSTER,	Collisions.MAP,			mapBegin,	depthTest,	_,				mapSeparate);
			space.addCollisionHandler(Collisions.PROJECTILE, Collisions.MAP,		mapBegin,	depthTest,	_,				mapSeparate);
			
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.MAP,		depthTest,	_,			_,				_);
			
		},

		term: function() {

		},


	};

})(window);
