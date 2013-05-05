(function(window) {

	var ec = window.ec;

	var RADIUS = 10;

	var Dot = ec.Dot = function(groupId, duration) {
		this.setBaseProperties();
		this.groupId = groupId || ec.Entity.groupId++;

		this.assignCircleShape(RADIUS, 0);
		this.depth = RADIUS * 2;
		this.shape.sensor = true;
		
		this.time =
		this.duration = duration || 500;

		this.type = 'Dot';

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	Dot.ready = function() {
		ec.extend(Dot.prototype, ec.Entity.prototype);
	};

	Dot.prototype = {
		step: function(delta) {
			this.time -= delta;
			if (this.time <= 0) {
				this.time = 0;
				ec.world.remove(this);
				this.term();
			}
		}
	};


})(window);