(function(window) {
	'use strict';

	var ec = window.ec;

	var ShadowCloneInput = ec.ShadowCloneInput = function() {
		this.setBaseProperties();
	};

	var proto = ShadowCloneInput.prototype;
	ShadowCloneInput.ready = function() {
		ec.extend(proto, ec.GoalBasedInput.prototype);
	};

})(window);