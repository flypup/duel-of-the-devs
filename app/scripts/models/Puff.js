(function(window) {
	'use strict';

	var ec = window.ec;

	var RADIUS = 50;

	var Puff = ec.Puff = function(groupId) {
		this.groupId = groupId || ec.Entity.groupId++;

		this.assignCircleShape(RADIUS, 1);
		
		this.shape.setElasticity(0);
		this.shape.setFriction(0);

		this.shape.sensor = true;
		
		this.time =
		this.duration = 500;
	};

	var proto = Puff.prototype;
	Puff.ready = function() {
		ec.extend(proto, ec.Entity.prototype);
	};

	proto.step = function(delta) {
		this.time -= delta;
		if (this.time <= 0) {
			this.time = 0;
			ec.world.remove(this);
			this.term();
		}
	};

	proto.update = function(entity) {
		if (this.time > 0) {
			var pos = entity.getPos();
			this.setPos(pos.x, pos.y+1, pos.z+1);
			this.setVelocity(entity.body.vx, entity.body.vy, 0);
		}
	};

})(window);