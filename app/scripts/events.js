var ec = ec || {};

(function() {
	'use strict';

	var preventDefault = function(e) {
		 e.preventDefault();
	};

	ec.addBrowserListeners = function() {
		this.bind(window, 'blur',  this.core.pause,  false);
		this.bind(window, 'focus', this.core.resume, false);
		if (ec.mobile) {
			// prevent scrolling
			this.bind(document, 'touchmove', preventDefault, false);
		} else {
			// resize window
			this.bind(window, 'resize', this.core.resize, false);
		}
		this.bind(document, 'keyup', this.keyup, false);
	};

	ec.keyup = function(e) {
		var key = e.keyCode || e.which;
		console.log(String.fromCharCode(key), key);

		if (key === 80) { // "P"
			if (ec.core.paused()) {
				ec.core.resume();
			} else {
				ec.core.pause();
			}

		} else if (key === 68) { // "D"
			ec.core.setDebugLevel(ec.debug-1);
			
		} else if (key === 220) { // "\"
			ec.core.fullscreen();
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