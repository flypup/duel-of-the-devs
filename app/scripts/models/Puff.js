(function(window) {

	var ec = window.ec;

	var RADIUS = 50;

	var Puff = ec.Puff = function(params) {
		this.setBaseProperties();
		this.type = 'Puff';

		this.depth = RADIUS * 2;
		this.radius = RADIUS;
		
		this.init.apply(this, params);

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	Puff.ready = function() {
		//extend with physics stub from Dot
		ec.extend(Puff.prototype, ec.Dot.prototype);
		ec.copy(Puff.prototype, ec.PhysicsStub);
		ec.addPool(Puff);
	};

	Puff.prototype = {
		init: function(duration) {
			this.time =
			this.duration = duration || 500;
		},

		term: null,

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
		},

		track: function(entity) {
			var pos = entity.getPos();
			this.setPos(pos.x, pos.y+1, pos.z+1);
			//this.setVelocity(entity.body.vx, entity.body.vy, 0);
		}
	};


})(window);