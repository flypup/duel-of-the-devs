(function(window) {
	'use strict';

	var ec = window.ec;
	var document = window.document;

	var viewportmeta = ec.android && document.querySelector && document.querySelector('meta[name="viewport"]');

	// var preventDefault = function(e) {
	//	e.preventDefault();
	// };

	ec.addBrowserListeners = function(input) {
		this.bind(window, 'blur',  this.core.pause,  false);
		if (ec.touch) {
			this.bind(ec.core.getViewDom(), 'touchstart', input.touchstart, false);
			this.bind(ec.core.getViewDom(), 'touchmove', input.touchmove, false);
			this.bind(ec.core.getViewDom(), 'touchend', input.touchend, false);

			// this.bind(document, 'gesturestart', preventDefault, false);
			// this.bind(document, 'gesturechange', preventDefault, false);
			// this.bind(document, 'gestureend', preventDefault, false);
		} else {
			// TODO: we might want to listen to both - ex: win 8 tablet
			this.bind(ec.core.getViewDom(), 'mousedown', input.mousedown, false);
			//this.bind(ec.core.getViewDom(), 'mousemove', input.mousemove, false);
			this.bind(ec.core.getViewDom(), 'mouseup', input.mouseup, false);
		}
		if (!ec.mobile) {
			// resize window
			this.bind(window, 'resize', this.core.resize, false);
		}
		this.bind(document, 'keydown', input.keydown, false);
		this.bind(document, 'keyup',   input.keyup, false);
	};

	ec.preventPinchZoom = function() {
		if (ec.android && viewportmeta) {
			viewportmeta.content = 'width=device-width, user-scalable=0';
		}
	};

	ec.allowPinchZoom = function() {
		if (ec.android && viewportmeta) {
			viewportmeta.content = 'width=device-width, user-scalable=1';
		}
	};
	
})(window);