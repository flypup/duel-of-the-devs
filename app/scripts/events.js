(function(window) {
	'use strict';

	var ec = window.ec;
	var document = window.document;
	var KEY = {
		'LEFT' : 37,
		'UP' : 38,
		'RIGHT' : 39,
		'DOWN' : 40,
		'ENTER' : 13,
		'SHIFT' : 16,
		'CTRL' : 17,
		'ALT' : 18,
		'SPACE' : 32,
		'NUM0' : 48,
		'NUM1' : 49,
		'NUM2' : 50,
		'NUM3' : 51,
		'NUM4' : 52,
		'NUM5' : 53,
		'NUM6' : 54,
		'NUM7' : 55,
		'NUM8' : 56,
		'NUM9' : 57,
		'A' : 65,
		'B' : 66,
		'C' : 67,
		'D' : 68,
		'E' : 69,
		'F' : 70,
		'G' : 71,
		'H' : 72,
		'I' : 73,
		'J' : 74,
		'K' : 75,
		'L' : 76,
		'M' : 77,
		'N' : 78,
		'O' : 79,
		'P' : 80,
		'Q' : 81,
		'R' : 82,
		'S' : 83,
		'T' : 84,
		'U' : 85,
		'V' : 86,
		'W' : 87,
		'X' : 88,
		'Y' : 89,
		'Z' : 90,
		'SLASH': 191,
		'BACKSLASH': 220
	};

	var BUTTON = {
		'SELECT': 0,
		'CANCEL': 1
	};

	var userInput = {};

	ec.keyPressed = {};

	var preventDefault = function(e) {
		 e.preventDefault();
	};

	var cycleDebug = function() {
		 ec.core.setDebugLevel(ec.debug-1);
	};

	ec.addBrowserListeners = function(input) {
		userInput = input;
		this.bind(window, 'blur',  this.core.pause,  false);
		this.bind(window, 'focus', this.core.resume, false);
		if (ec.mobile) {
			// prevent scrolling
			this.bind(document, 'touchmove', preventDefault, false);
			this.bind(ec.core.getViewDom(), 'touchstart', cycleDebug, false);
		} else {
			// resize window
			this.bind(window, 'resize', this.core.resize, false);
		}
		this.bind(document, 'keydown', this.keydown, false);
		this.bind(document, 'keyup', this.keyup, false);
	};

	var updateAxes1 = function() {
		var x = ((ec.keyPressed[KEY.LEFT] || ec.keyPressed[KEY.A]) ? -1 : 0) + ((ec.keyPressed[KEY.RIGHT] || ec.keyPressed[KEY.D]) ? 1 : 0);
		var y = ((ec.keyPressed[KEY.UP] || ec.keyPressed[KEY.W]) ? -1 : 0) + ((ec.keyPressed[KEY.DOWN] || ec.keyPressed[KEY.S]) ? 1 : 0);
		userInput.setAxes1(x, y);
	};

	ec.mapButton= function(name, index) {
		BUTTON[name] = index;
	};

	ec.keydown = function(e) {
		var keyCode = e.keyCode || e.which;

		ec.keyPressed[keyCode] = true;

		switch(keyCode) {
			case KEY.RIGHT:
			case KEY.D:
			case KEY.LEFT:
			case KEY.A:
			case KEY.UP:
			case KEY.W:
			case KEY.DOWN:
			case KEY.S:
				updateAxes1();
				break;

			case KEY.SPACE:
			case KEY.ENTER:
				userInput.setButton(BUTTON.SELECT, 1);
				break;

			case KEY.BACKSLASH:
				userInput.setButton(BUTTON.CANCEL, 1);
				break;
		}
	};

	ec.keyup = function(e) {
		var keyCode = e.keyCode || e.which;

		ec.keyPressed[keyCode] = false;

		switch(keyCode) {
			case KEY.RIGHT:
			case KEY.D:
			case KEY.LEFT:
			case KEY.A:
			case KEY.UP:
			case KEY.W:
			case KEY.DOWN:
			case KEY.S:
				updateAxes1();
				break;

			case KEY.SPACE:
			case KEY.ENTER:
				userInput.setButton(BUTTON.SELECT, 0);
				break;

			case KEY.BACKSLASH:
				userInput.setButton(BUTTON.CANCEL, 0);
				break;

			case KEY.P:
				if (ec.core.paused()) {
					ec.core.resume();
				} else {
					ec.core.pause();
				}
				break;

			case KEY.O:
				cycleDebug();
				break;

			case KEY.F:
			case KEY.SLASH:
				ec.core.fullscreen();
				break;

			default:
				console.log(String.fromCharCode(keyCode), keyCode);
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

})(window);