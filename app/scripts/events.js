var ec = ec || {};

(function() {
	'use strict';

	var preventDefault = function(e) {
		 e.preventDefault();
	};

	ec.addBrowserListeners = function() {
		this.bind(window, 'blur',  ec.core.pause,  false);
		this.bind(window, 'focus', ec.core.resume, false);
		if (ec.mobile) {
			// prevent scrolling
			this.bind(document, 'touchmove', preventDefault, false);
		} else {
			// resize window
			this.bind(window, 'resize', ec.core.resize, false);
		}
	};

	ec.bind = function(elem, event, func, bool) {
		bool = bool || false;
		if (elem.addEventListener) {
			elem.addEventListener(event, func, bool);
		} else if (elem.attachEvent) {
			elem.attachEvent('on' + event, func);
		}
	};

})();