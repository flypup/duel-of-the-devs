(function(window) {
	'use strict';

	var ec = window.ec;

	var RADIUS = 50;

	var Puff = ec.Puff = function(entity) {
		this.groupId = entity.groupId;

		this.assignCircleShape(RADIUS, 1);
		
		this.shape.setElasticity(0);
		this.shape.setFriction(0);

		this.shape.sensor = true;
		
		this.time =
		this.duration = 500;

		this.master = entity;
		this.setPos(entity.body.p.x, entity.body.p.y-1, 0);
	};

	var proto = Puff.prototype;
	ec.extend(proto, ec.Entity.prototype);

	proto.step = function(delta) {
		this.time -= delta;
		if (this.time <= 0) {
			this.time = 0;
			ec.world.remove(this);
			delete this.master;
		} else {
			this.setPos(this.master.body.p.x, this.master.body.p.y-1, this.z+1);
		}
	};

})(window);