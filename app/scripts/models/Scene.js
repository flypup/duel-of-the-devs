(function(window) {
	'use strict';

	var ec = window.ec;

	var Scene = ec.Scene = function(data) {
		// TODO: clone data?
		this.data = data;
		this.mapName = data.map;
		this.fps = this.data.useFrames ? this.data.fps : 1;
		this.duration = this.calculateTime(data.duration);
	};

	var proto = Scene.prototype;

	proto.init = function(actors) {
		this.actors = actors;
		this.time = 0;
		this.complete = false;

		this.animations = [];
		var tracks = this.data.tracks;
		for (var i=0; i<tracks.length; i++) {
			var animation = new ec.Animation(tracks[i], actors, this.fps);
			this.animations.push(animation);
		}
	};

	proto.step = function(delta) {
		delta /= 1000;
		this.time += delta;
		if (this.time > this.duration) {
			this.time = this.duration;
			this.complete = true;
		}

		for (var i=0; i<this.animations.length; i++) {
			var animation = this.animations[i];
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