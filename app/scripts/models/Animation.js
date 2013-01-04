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
		if (from.tween) {
			if (this.checkNext(time)) {
				return;
			}
			var to = tween.to;
			var tweenTime = time - tween.startTime;
			var x = tween.fn(tweenTime, from.x, to.x - from.x, tween.duration);
			var y = tween.fn(tweenTime, from.y, to.y - from.y, tween.duration);
			if (this.element.type === 'Viewport') {
				// TODO: zoom (and maybe rotation?)
				this.actor.lookAt(x, y);
			} else {

				// TODO: map sorting and z adjustment
				var z = from.z;
				if (z !== undefined && to.z !== undefined) {
					z = tween.fn(tweenTime, from.z, to.z - from.z, tween.duration);
				}
				this.actor.setPos(x, y, z);

				// TODO: 'a' entity angle (character rotation)

				// TODO: entity actions (or spritesheet frames?)

			}
		} else {
			//single frame, no tween
			if (this.element.type === 'Viewport') {
				this.actor.lookAt(from.x, from.y);
			} else {
				this.actor.setPos(from.x, from.y, from.z);
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