(function(window) {
	'use strict';

	var ec = window.ec;

	var ShadowCloneInput = ec.ShadowCloneInput = function() {
		this.axes = [];
		for (var i = 0; i < 4; i++) {
			this.axes[i] = 0;
		}
		this.task = null;
	};

	var proto = ShadowCloneInput.prototype;

	proto.poll = function(entity, delta) {
		if (this.task) {
			if (this.task.complete) {
				this.task = null;
				return;
			}
			this.taskTime += delta;
			this.task.apply(this, arguments);//[entity]);
		}
	};

	proto.mapCollision = function(entity, mapElement) {
		this.completeTask();
	};

	proto.setAxes1 = function(x, y) {
		this.axes[0] = x;
		this.axes[1] = y;
	};

	proto.completeTask = function() {
		if (this.task) {
			this.task.complete = true;
		}
	};

})(window);