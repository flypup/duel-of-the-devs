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

		var pos = entity.getPos();
		this.setPos(pos.x, pos.y+1, pos.z+1);
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
			var pos = this.master.getPos();
			this.setPos(pos.x, pos.y+1, pos.z+1);
		}
	};

})(window);