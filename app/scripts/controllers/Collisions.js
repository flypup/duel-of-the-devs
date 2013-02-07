(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;

	var Collisions = ec.Collisions = function() {};

	//shape groups
	Collisions.PLAYER = 1;
	Collisions.PLAYER_HAND = 2;
	Collisions.MONSTER = 10;
	Collisions.MONSTER_PROJECTILE = 12;
	Collisions.MAP = 50;
	Collisions.PROP = 100;

	var returnFalse = function(arbiter, space) {
		return false;
	};

	var DAMAGE = 10;
	
	Collisions.prototype = {
		init: function(world) {
			this.world = world;

			var pushHandler = ec.delegate(this, this.pushCollision);
			var bumpHandler = ec.delegate(this, this.bumpCollision);
			var mapBeginHandler  = ec.delegate(this, this.mapCollisionBegin);
			var mapPreSolveHandler = ec.delegate(this, this.mapCollisionPreSolve);
			var mapSeparateHandler = ec.delegate(this, this.mapCollisionSeparate);

			var space = world.space;
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.MONSTER, null, null, pushHandler, null);
			space.addCollisionHandler(Collisions.MONSTER, Collisions.MONSTER, bumpHandler, null, bumpHandler, null);
			space.addCollisionHandler(Collisions.PLAYER,  Collisions.MAP, mapBeginHandler, mapPreSolveHandler, null, mapSeparateHandler);
			space.addCollisionHandler(Collisions.MONSTER, Collisions.MAP, mapBeginHandler, mapPreSolveHandler, null, mapSeparateHandler);
			// TODO: Don't allow player hand to pass through obstacles
			space.addCollisionHandler(Collisions.PLAYER_HAND, Collisions.MAP, returnFalse, null, null, null);
			space.addCollisionHandler(Collisions.MONSTER_PROJECTILE, Collisions.MAP, mapBeginHandler, mapPreSolveHandler, null, mapSeparateHandler);
		},

		term: function() {
			this.world = null;
		},

		pushCollision: function(arbiter, space) {
			// var contact = arbiter.contacts && arbiter.contacts.length && arbiter.contacts[0];
			// if (contact) {
			//console.log('push collision', arbiter);
			var monsterBody = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
			var monsterEntity = this.world.entityForBody(monsterBody);
			if (monsterEntity) {
				monsterEntity.hit(arbiter, this.world, DAMAGE);
				arbiter.ignore();
				return false;
			}
			return (arbiter.contacts && arbiter.contacts.length);
		},

		bumpCollision: function(arbiter, space) {

			//console.log('push collision', arbiter);
			var monsterEntityA = this.world.entityForBody(arbiter.body_a);
			var monsterEntityB = this.world.entityForBody(arbiter.body_b);
			if (monsterEntityA  && monsterEntityB) {
				if (monsterEntityA.hitTime && !monsterEntityB.hitTime) {
					monsterEntityB.hit(arbiter, this.world, 0);
				} else if (monsterEntityB.hitTime && !monsterEntityA.hitTime) {
					monsterEntityA.hit(arbiter, this.world, 0);
				}
				return !(monsterEntityA.hitTime > 0 && monsterEntityB.hitTime > 0);
			}
			return true;
		},

		mapCollisionBegin: function(arbiter, space) {
			//console.log('mapCollisionBegin');
			var entityBody = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
			var mapBody    = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
			var entity     = this.world.entityForBody(entityBody);
			var mapElement = this.world.elementForBody(mapBody);
			if (ec.debug > 0) {
				//console.log('mapCollisionBegin', entity.type, mapElement);
			}
			// Add Map Element to Entity's Checklist
			entity.addMapCollision(mapElement);

			return true;
		},

		mapCollisionSeparate: function(arbiter, space) {
			//console.log('mapCollisionSeparate');
			var entityBody = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
			var mapBody    = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
			var entity     = this.world.entityForBody(entityBody);
			var mapElement = this.world.elementForBody(mapBody);
			if (ec.debug > 0) {
				//console.log('mapCollisionSeparate', entity.type, mapElement);
			}
			// Remove Map Element from Entity's Checklist
			entity.removeMapCollision(mapElement);
		},

		mapCollisionPreSolve: function(arbiter, space) {
			//console.log('mapCollisionPreSolve');
			// var contact = arbiter.contacts && arbiter.contacts.length && arbiter.contacts[0];
			// if (contact) {
			var entityBody = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
			var mapBody    = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
			var entity = this.world.entityForBody(entityBody);
			var mapElement = this.world.elementForBody(mapBody);
			//console.log('mapCollision', entity, mapElement);

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
				//console.log('mapCollision', entity, mapElement);
			}
			//collision
			return true;
		}
	};

})(window);
