(function(window) {

	var ec = window.ec;

	var Scene = ec.Scene = function(data) {
		// TODO: clone data?
		this.data = data;
		this.mapName = data.map;
		this.fps = this.data.useFrames ? this.data.fps : 1;
		this.duration = this.calculateTime(data.duration);
		this.time = 0;
		this.complete = false;
		this.animations = null;
		//this.actors = null;

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	var proto = Scene.prototype;

	proto.init = function(actors) {
		//this.actors = actors;
		this.time = 0;
		this.complete = false;

		this.animations = [];
		var tracks = this.data.tracks;
		for (var i=0; i<tracks.length; i++) {
			var animation = new ec.Animation(tracks[i], actors, this.fps);
			this.animations.push(animation);
			//make shapes sensors so they don't collide with obstacles
			if (animation.actor.shape) {
				animation.sensor = animation.actor.shape.sensor;
				animation.actor.shape.sensor = true;
			}
		}
	};

	proto.step = function(delta) {
		var i;
		var animation;
		delta /= 1000;
		this.time += delta;
		if (this.time > this.duration) {
			this.time = this.duration;
			this.complete = true;
			//reset shapes
			for (i=0; i<this.animations.length; i++) {
				animation = this.animations[i];
				if (animation.actor.shape) {
					animation.actor.shape.sensor = animation.sensor;
				}
			}
		}

		for (i=0; i<this.animations.length; i++) {
			animation = this.animations[i];
			animation.update(this.time);
		}
	};

	proto.skip = function() {
		this.time = this.duration;
		this.step(0);
	};

	proto.calculateTime = function(value) {
		if (this.data.useFrames) {
			return value / this.fps;
		}
		return value;
	};

})(window);