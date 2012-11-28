(function(window) {
	'use strict';

	var ec = window.ec;
	var document = window.document;

	ec.addBrowserListeners = function(input) {
		this.bind(window, 'blur',  this.core.pause,  false);
		this.bind(window, 'focus', this.core.resume, false);
		if (ec.touch) {
			this.bind(ec.core.getViewDom(), 'touchstart', input.touchstart, false);
			this.bind(ec.core.getViewDom(), 'touchmove', input.touchmove, false);
			this.bind(ec.core.getViewDom(), 'touchend', input.touchend, false);
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

	ec.bind = function(obj, event, func, bool) {
		bool = bool || false;
		if (obj.addEventListener) {
			obj.addEventListener(event, func, bool);
		} else if (obj.attachEvent) {
			obj.attachEvent('on' + event, func);
		} else {
			// not exactly 'trigger' or 'dispatchEvent' friendly
			obj['on' + event] = func;
		}
	};

	ec.unbind = function(obj, event, func, bool) {
		bool = bool || false;
		if (obj.removeEventListener) {
			obj.removeEventListener(event, func, bool);
		} else if (obj.detachEvent) {
			obj.detachEvent('on' + event, func);
		} else {
			delete obj['on' + event];
		}
	};

})(window);