(function(window) {
	'use strict';

	var ec = window.ec;

	var ShadowCloneInput = ec.ShadowCloneInput = function() {
		this.axes = [];
		for (var i = 0; i < 4; i++) {
			this.axes[i] = 0;
		}
		this.goal = null;
		this.goalIndex = -1;
	};

	var proto = ShadowCloneInput.prototype;
	ShadowCloneInput.ready = function() {
		ec.extend(proto, ec.GoalBasedInput.prototype);
	};

})(window);