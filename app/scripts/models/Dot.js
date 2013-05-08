(function(window) {

	var ec = window.ec;

	var RADIUS = 10;

	var Dot = ec.Dot = function(params) {
		this.setBaseProperties();
		this.type = 'Dot';

		this.depth = RADIUS * 2;
		this.radius = RADIUS;

		this.init.apply(this, params);

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	Dot.ready = function() {
		ec.extend(Dot.prototype, ec.Entity.prototype);
		ec.addPool(Dot);
	};

	Dot.prototype = {
		init: function(duration, fillStyle) {
			this.time =
			this.duration = duration || 500;
			this.fillStyle = fillStyle || 'rgba(255, 8, 0, 1.0)';
		},

		term: null,

		step: function(delta) {
			this.time -= delta;
			if (this.time <= 0) {
				ec.world.remove(this);
				this.term();
			} else {
				this.fillStyle = 'rgba(255, 8, 0, '+ (this.time / this.duration).toFixed(2) +')';
			}
		},

		// Physics Stub
		isStatic: function() {
			return true;
		},

		getPos: function() {
			return this.pos;
		},

		setPos: function(x, y, z) {
			this.pos.x =  x;
			this.pos.y =  y;
			this.pos.z =  z;
			return this;
		},

		getSortBounds: function() {
			var bounds = this.sortBounds;
			var radius = this.radius;
			bounds.bottom = this.z;
			bounds.top = this.z + this.depth;
			bounds.front =  radius/2 +this.pos.y;
			bounds.back  = -radius/2 +this.pos.y;
			bounds.left  = -radius   +this.pos.x;
			bounds.right =  radius   +this.pos.x;
			return bounds;
		}
	};


})(window);