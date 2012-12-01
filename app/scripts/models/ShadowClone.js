(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;

	var RADIUS = 32;

	var ShadowClone = ec.ShadowClone = function(entity) {
		this.assignCircleShape(RADIUS, 1);
		
		this.shape.setElasticity(0);
		this.shape.setFriction(0);

		this.setPos(64, 64, 32);

		this.shape.collision_type = ec.World.MONSTER_TYPE;

		// this.input = function(){};
		// this.speed = 8;
		
		this.isShadowClone = true;
		this.master = entity;

		this.prototype = entity;
	};

	var proto = ShadowClone.prototype;
	ec.extend(proto, ec.Entity.prototype);


})(window);