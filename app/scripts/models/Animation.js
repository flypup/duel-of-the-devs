(function(window) {
	'use strict';

	var ec = window.ec;

	var Animation = ec.Animation = function(track, actors, fps) {
		ec.extend(this, track);

		this.actor = actors[this.element.name];
		this.fps = fps;

		this.complete = false;
		this.index = -1;
		this.tween = null;
		this.update = this.nextTween;
	};

	var proto = Animation.prototype;

	proto.idle = function() {};

	proto.nextTween = function(time) {
		var keyframes = this.keyframes;

		// last keyframe
		var kindex = ++this.index;
		if (kindex >= keyframes.length) {
			this.update = this.idle;
			this.complete = true;
			return;
		}

		// get new tween
		var tween = this.tween = {};
		var fromFrame = keyframes[kindex];

		tween.index = kindex;
		tween.from = fromFrame;
		tween.startTime = this.calculateTime(fromFrame.start);
		tween.duration  = this.calculateTime(fromFrame.duration);
		tween.endTime   = tween.startTime + tween.duration;
		
		if (fromFrame.empty) {
			console.log('empty keyframe', this);
			tween.complete = true;
			this.update = this.checkNext;
			this.actor.z = 10000;
			return;
		}

		tween.complete = false;
		if (fromFrame.tween) {
			var toFrame = keyframes[kindex+1];
			tween.to = toFrame;

			if (fromFrame.ease === 'inout') {
				tween.fn = this.easeInOutQuad;

			} else if (fromFrame.ease === 'in') {
				tween.fn = this.easeInQuad;

			} else if (fromFrame.ease === 'out') {
				tween.fn = this.easeOutQuad;

			} else {
				tween.fn = this.linearTween;
			}
		}

		this.update = this.updateTween;
		this.update(time);
	};

	proto.updateTween = function(time) {
		var tween = this.tween;
		var from = tween.from;

		var x = from.x;
		var y = from.y;
		var z = from.z;
		
		if (from.tween) {
			if (this.checkNext(time)) {
				return;
			}
			var to = tween.to;
			var tweenTime = time - tween.startTime;
			x = tween.fn(tweenTime, x, to.x - x, tween.duration);
			y = tween.fn(tweenTime, y, to.y - y, tween.duration);
			if (tweenTime < 0 || tweenTime > tween.duration) {
				throw('Tween time is out of range of current keyframe');
			}
			if (this.element.type === 'Viewport') {
				// TODO: zoom (and maybe rotation?)
				this.actor.lookAt(x, y);
			} else {
				// TODO: map sorting and z adjustment
				if (z !== undefined) {
					if (to.z !== undefined) {
						z = tween.fn(tweenTime, from.z, to.z - from.z, tween.duration);
					}
					y += z;
				}
				this.actor.setPos(x, y, z);
				if (ec.debug > 0) {
					console.log(this.actor.type, 'pos', x, y, z, this.actor.mapCollision);
				}
				// TODO: 'a' entity angle (character rotation)

				// TODO: entity actions (or spritesheet frames?)

			}
		} else {
			//single frame, no tween
			if (this.element.type === 'Viewport') {
				this.actor.lookAt(x, y);
			} else {
				if (z !== undefined) {
					y += z;
				}
				this.actor.setPos(x, y, z);
				if (ec.debug > 0) {
					console.log(this.actor.type, 'pos', x, y, z, this.actor.mapCollision);
				}
			}
			tween.complete = true;
			this.update = this.checkNext;
			//this.update(time);
		}
	};

	proto.checkNext = function(time) {
		// wait for next tween
		if (time > this.tween.endTime) {
			this.update = this.nextTween;
			this.update(time);
			return true;
		}
		return false;
	};

	proto.linearTween = function (t, b, c, d) {
		return c*t/d + b;
	};

	proto.easeInQuad = function (t, b, c, d) {
		t /= d;
		return c*t*t + b;
	};

	proto.easeOutQuad = function (t, b, c, d) {
		t /= d;
		return -c * t*(t-2) + b;
	};

	proto.easeInOutQuad = function (t, b, c, d) {
		t /= d/2;
		if (t < 1) return c/2*t*t + b;
		t--;
		return -c/2 * (t*(t-2) - 1) + b;
	};

	proto.calculateTime = function(value) {
		if (this.fps !== 1) {
			return value / this.fps;
		}
		return value;
	};

})(window);