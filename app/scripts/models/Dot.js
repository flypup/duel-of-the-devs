(function(window) {

	var ec = window.ec;

	var RADIUS = 10;

	var Dot = ec.Dot = function(params) {
		this.setBaseProperties();
		this.type = 'Dot';

		this.depth = RADIUS * 2;
		this.radius = RADIUS;
		this.alpha = 1.0;

		this.init.apply(this, params);

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	Dot.ready = function() {
		ec.extend(Dot.prototype, ec.Entity.prototype);
		ec.copy(Dot.prototype, ec.PhysicsStub);
		ec.addPool(Dot);
	};

	Dot.prototype = {
		init: function(duration, fillStyle) {
			this.time =
			this.duration = duration || 500;
			this.fillStyle = fillStyle || '#ff0800';//'rgba(255, 8, 0, 1.0)';
			// this.fillStyleSplit = this.fillStyle.split(',');
			// if (this.fillStyleSplit.length === 0) {
			// 	this.fillStyleSplit = null;
			// }
		},

		term: null,

		step: function(delta) {
			this.time -= delta;
			if (this.time <= 0) {
				ec.world.remove(this);
				this.term();
			} else {
				this.alpha = this.time / this.duration;
				// if (this.fillStyleSplit.length === 4) {
				// 	this.fillStyleSplit[3] = this.alpha.toFixed(2) +')';
				// 	this.fillStyle = this.fillStyleSplit.join(',');
				// }
			}
		},

		postStep: function() {},
		postStepScene: function() {}
	};


})(window);