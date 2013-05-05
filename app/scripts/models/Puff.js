(function(window) {

	var ec = window.ec;

	var RADIUS = 50;

	var Puff = ec.Puff = function(groupId) {
		this.setBaseProperties();
		this.groupId = groupId || ec.Entity.groupId++;

		this.assignCircleShape(RADIUS, 1);
		
		this.shape.setElasticity(0);
		this.shape.setFriction(0);

		this.shape.sensor = true;
		
		this.time =
		this.duration = 500;

		this.type = 'Puff';

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	Puff.ready = function() {
		ec.extend(Puff.prototype, ec.Entity.prototype);
	};

	Puff.prototype = {
		track: function(entity) {
			var pos = entity.getPos();
			this.setPos(pos.x, pos.y+1, pos.z+1);
			this.setVelocity(entity.body.vx, entity.body.vy, 0);
		},

		step: function(delta) {
			this.time -= delta;
			if (this.time <= 0) {
				this.time = 0;
				ec.world.remove(this);
				this.term();
			}
		},

		update: function(entity) {
			if (this.time > 0) {
				this.track(entity);
			}
		}
	};


})(window);