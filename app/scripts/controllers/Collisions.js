(function(window) {
	'use strict';

	var ec = window.ec;

	var Collisions = ec.Collisions = function() {};

	//shape groups
	Collisions.PLAYER = 1;
	Collisions.PLAYER_HAND = 2;
	Collisions.MONSTER = 10;
	Collisions.PROJECTILE = 12;
	Collisions.MAP = 50;
	Collisions.PROP = 100;

	var DAMAGE = 10;
	
	// PRIVATE Collision Handlers
	function passThrough() {
		return false;
	}

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

	function bumpCollision(arbiter, space) {

		//console.log('push collision', arbiter);
		var monsterEntityA = arbiter.body_a.userData.parent;
		var monsterEntityB = arbiter.body_b.userData.parent;
		if (monsterEntityA  && monsterEntityB) {
			if (monsterEntityA.hitTime && !monsterEntityB.hitTime) {
				monsterEntityB.hit(arbiter, 0);
			} else if (monsterEntityB.hitTime && !monsterEntityA.hitTime) {
				monsterEntityA.hit(arbiter, 0);
			}
			return !(monsterEntityA.hitTime > 0 && monsterEntityB.hitTime > 0);
		}
		return true;
	}

	function mapBegin(arbiter, space) {
		//console.log('mapBegin');
		var entityBody = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
		var mapBody    = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
		var entity     = entityBody.userData.parent;
		var mapElement = mapBody.userData.parent;
		if (ec.debug > 0) {
			//console.log('mapBegin', entity.type, mapElement);
		}
		// Add Map Element to Entity's Checklist
		entity.addMapCollision(mapElement);

		//determine if entity is outside of collision z
		var entityBounds = entity.getSortBounds();
		//standing under
		if ( entityBounds.top < mapElement.z ) {
			return false;
		}
		var mapBounds = mapElement.getSortBounds();
		//standing over - fall
		if ( entity.z > mapBounds.top) {
			return false;
		}
		//standing on
		if ( entity.z === mapBounds.top) {
			return false;
		}
		//arbiter.ignore();

		if (ec.debug > 0) {
			//console.log('map', entity, mapElement);
		}
		//collision
		return true;
	}

	function mapSeparate(arbiter, space) {
		//console.log('mapSeparate');
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

	Collisions.prototype = {
		init: function(space) {
			var _ = null;
			// Player Attacks
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.MONSTER,	_,				_, pushCollision,	_);
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.PROJECTILE,_,				_, pushCollision,	_);

			// Entity to Entity
			space.addCollisionHandler(Collisions.MONSTER,	Collisions.MONSTER,		bumpCollision,	_, bumpCollision,	_);

			// Projectile to Obstacle / Target
			// TODO : obstacle collision - or entity.collide(entity)
			space.addCollisionHandler(Collisions.PROJECTILE, Collisions.PROP,		passThrough,	_, _,				_);
			space.addCollisionHandler(Collisions.PROJECTILE, Collisions.PLAYER,		_,				_, pushCollision,	_);

			// Entity to Map
			space.addCollisionHandler(Collisions.PLAYER,	Collisions.MAP,			mapBegin,		_, _,				mapSeparate);
			space.addCollisionHandler(Collisions.MONSTER,	Collisions.MAP,			mapBegin,		_, _,				mapSeparate);
			// TODO: Don't allow player hand to pass through obstacles
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.MAP,		passThrough,	_, _,				_);
			space.addCollisionHandler(Collisions.PROJECTILE, Collisions.MAP,		mapBegin,		_, _,				mapSeparate);
			
		},

		term: function() {

		},


	};

})(window);
