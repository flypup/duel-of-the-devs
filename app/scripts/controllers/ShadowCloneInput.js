(function(window) {

	var ec = window.ec;

	var ShadowCloneInput = ec.ShadowCloneInput = function() {
		this.setBaseProperties();
		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	var proto = ShadowCloneInput.prototype;
	ShadowCloneInput.ready = function() {
		ec.extend(proto, ec.GoalBasedInput.prototype);
	};

})(window);