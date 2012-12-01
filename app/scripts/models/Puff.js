(function(window) {
	'use strict';

	var ec = window.ec;
	//var cp = window.cp;
	//var v = cp.v;

	var RADIUS = 50;

	var Puff = ec.Puff = function(entity) {
		this.groupId = entity.groupId;

		this.assignCircleShape(RADIUS, 1);
		
		this.shape.setElasticity(0);
		this.shape.setFriction(0);

		this.shape.sensor = true;
		
		//this.joint = ec.world.space.addConstraint(new cp.DampedSpring(entity.body, this.body, v(0, 1), v(0,0), 10, 20, 5));

		this.time =
		this.duration = 1000;

		this.master = entity;
		this.setPos(entity.body.p.x, entity.body.p.y-1, 40);
	};

	var proto = Puff.prototype;
	ec.extend(proto, ec.Entity.prototype);

	proto.step = function(delta) {
		this.time -= delta;
		if (this.time <= 0) {
			this.time = 0;
			//ec.world.space.removeConstraint(this.joint);
			ec.world.remove(this);
			delete this.master;
		} else {
			this.setPos(this.master.body.p.x, this.master.body.p.y-1, this.z+1);
		}
	};

})(window);