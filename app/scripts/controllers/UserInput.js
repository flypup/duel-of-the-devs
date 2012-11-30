(function(window) {
	'use strict';

	var ec = window.ec;
	var dummyGamePadList = [undefined, undefined, undefined, undefined];

	ec.keyPressed = {};

	var self;

	var UserInput = ec.UserInput = function(index) {
		self = this;
		this.index = index || 0;
		this.gamepadTime = 1;
		var buttons = this.buttons = new Array(17);
		for (var i = 0; i < 17; i++) {
			buttons[i] = 0;
		}
		var axes = this.axes = new Array(4);
		for (i = 0; i < 4; i++) {
			axes[i] = 0;
		}

		if (ec.gamepads) {
			ec.bind(window, 'MozGamepadConnected', this.onGamepadConnect, false);
			ec.bind(window, 'MozGamepadDisconnected', this.onGamepadDisconnect, false);
		}

		this.pollGamePad = (navigator.webkitGetGamepads !== undefined) ? this.pollGamePadList : this.pollDummyGamePadList;
		this.keyboardAxes1 = false;
		this.keyboardAxes2 = false;
		this.overlays = [];
	};

	var proto = UserInput.prototype;

	proto.addButtonOverlay = function(overlay) {
		var index = this.overlays.indexOf(overlay);
		if (index < 0) {
			this.overlays.push(overlay);
			return overlay;
		}
		console.error('overlay already a child of input', overlay);
		return null;
	};

	proto.removeButtonOverlay = function(overlay) {
		var index = this.overlays.indexOf(overlay);
		if (index > -1) {
			this.overlays.splice(index, 1);
			ec.unbind(overlay, 'touchstart', overlay.touchStart, false);
			ec.unbind(overlay, 'touchend',   overlay.touchEnd, false);
			return overlay;
		}
		console.error('overlay not a child of input', overlay);
		return null;
	};
	
	proto.draw = function(context, width, height) {
		for (var i=0, len=this.overlays.length; i<len; i++) {
			var overlay = this.overlays[i];
			overlay.draw(context, width, height);
		}
	};

	proto.resize = function(width, height) {
		this.width  = width;
		this.height = height;
	};

	proto.testOverlays = function(type, data, id) {
		var width  = this.width;
		var height = this.height;
		for (var i=0, len=this.overlays.length; i<len; i++) {
			var overlay = this.overlays[i];
			if (type === 'touchend') {
				if (overlay === this.leftStickOverlay || overlay === this.rightStickOverlay) {
					if (overlay['on'+type] !== undefined) {
						overlay['on'+type].apply(overlay, [data, id]);
					}
				}
			}
			if (overlay.hitTest(data.clientX, data.clientY, width, height)) {//offsetX,Y ?
				//console.log('hit overlay:', overlay, id);
				if (overlay['on'+type] !== undefined) {
					overlay['on'+type].apply(overlay, [data, id]);
				}
				return overlay;
			}
		}
		//console.log('no hit:', type, data, id);
		return null;
	};

	proto.setLeftStickOverlay = function(overlay) {
		this.leftStickOverlay = overlay;
		ec.bind(overlay, 'touchstart', overlay.touchStart, false);
		ec.bind(overlay, 'touchend',  overlay.touchEnd, false);
	};

	proto.setRightStickOverlay = function(overlay) {
		this.rightStickOverlay = overlay;
		ec.bind(overlay, 'touchstart', overlay.touchStart, false);
		ec.bind(overlay, 'touchend',  overlay.touchEnd, false);
	};
	
	proto.setAxes1 = function(x, y) {
		this.axes[0] = x;
		this.axes[1] = y;
		// console.log(this.axes);
	};

	proto.setAxes2 = function(x, y) {
		this.axes[2] = x;
		this.axes[3] = y;
		// console.log(this.axes);
	};

	proto.setButton = function(index, value) {
		this.buttons[index] = value;
		// console.log(this.buttons);
	};

	proto.mapButton= function(name, index) {
		BUTTON[name] = index;
	};

	// game loop

	proto.poll = function() {
		// virtial gamepad
		if (this.leftStickOverlay && !this.keyboardAxes1) {
			this.setAxes1(this.leftStickOverlay.vx/100, this.leftStickOverlay.vy/100);
		}

		if (this.rightStickOverlay && !this.keyboardAxes2) {
			this.setAxes2(this.rightStickOverlay.vx/100, this.rightStickOverlay.vy/100);
		}

		// gamepad
		var gamepad = this.pollGamePad()[this.index];
		if (gamepad && this.gamepadTime !== gamepad.timestamp) {
			this.gamepadTime = gamepad.timestamp || 1;
			//pause button
			if (gamepad.buttons[9] === 1 && this.buttons[9] !== 1) {
				ec.core.togglePause();
			}
			if (gamepad.buttons.join('') !== this.buttons.join('')) {
				console.log('gamepad button change', gamepad.buttons.indexOf(1), this.buttons.indexOf(1), gamepad.axes);
			}
			this.buttons = gamepad.buttons.slice(0);
			if (!this.keyboardAxes1) {
				this.setAxes1(gamepad.axes[0], gamepad.axes[1]);
			}
			if (!this.keyboardAxes2) {
				this.setAxes2(gamepad.axes[3], gamepad.axes[4]);
			}
		}
	};

	// Touch / Mouse

	proto.touchstart = function(e) {
		//console.log(e.type, e);
		if (ec.core.paused()) {
			return;
		}
		for (var i=0, len=e.changedTouches.length; i<len; i++) {
			self.testOverlays(e.type, e.changedTouches[i], e.changedTouches[i].identifier);
		}
	};

	proto.touchmove = function(e) {
		//console.log(e.type, e.changedTouches[0].identifier, e.changedTouches);
		for (var i=0, len=self.overlays.length; i<len; i++) {
			var overlay = self.overlays[i];
			for (var j=0, jlen=e.changedTouches.length; j<jlen; j++) {
				if (overlay.hasTouch(e.changedTouches[j].identifier)) {
					overlay.updateTouch(e.changedTouches[j].identifier, e.changedTouches[j].clientX, e.changedTouches[j].clientY);
					break;
				}
			}
		}

		// prevent scrolling
		e.preventDefault();
	};

	proto.touchend = function(e) {
		//console.log(e.type, e);
		if (ec.core.paused()) {
			ec.core.resume();
			return;
		}
		for (var i=0, len=e.changedTouches.length; i<len; i++) {
			self.testOverlays(e.type, e.changedTouches[i], e.changedTouches[i].identifier);
		}
	};

	proto.mousedown = function(e) {
		//console.log(e.type, e);
		if (ec.core.paused()) {
			return;
		}
		if (!self.testOverlays(e.type, e, -1)) {
			ec.bind(ec.core.getViewDom(), 'mousemove', self.mouseRightStick, false);
			ec.bind(window, 'mouseup', self.mouseRightStickEnd, false);
			self.mouseRightStick(e);
		}
	};

	proto.mouseRightStick = function(e) {
		//console.log(e.type, e);
		var halfWidth  = e.target.width /2;
		var halfHeight = e.target.height/2 + 100;
		var x = e.clientX - halfWidth;
		var y = e.clientY - halfHeight;
		var length = Math.sqrt(x*x + y*y);
		x /= length;
		y /= length;
		self.setAxes2(x, y);
	};

	proto.mouseRightStickEnd = function(e) {
		ec.unbind(ec.core.getViewDom(), 'mousemove', self.mouseRightStick, false);
		self.setAxes2(0, 0);
	};

	proto.mouseup = function(e) {
		////console.log(e.type, e);
		if (ec.core.paused()) {
			ec.core.resume();
			return;
		}
		self.testOverlays(e.type, e, -1);
	};

	// Keyboard

	proto.keydown = function(e) {
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
				self.updateAxes1FromKeys();
				break;

			case KEY.SPACE:
			case KEY.ENTER:
				self.setButton(BUTTON.SELECT, 1);
				break;

			case KEY.BACKSLASH:
				self.setButton(BUTTON.CANCEL, 1);
				break;
		}
	};

	proto.keyup = function(e) {
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
				self.updateAxes1FromKeys();
				break;

			case KEY.SPACE:
			case KEY.ENTER:
				self.setButton(BUTTON.SELECT, 0);
				break;

			case KEY.BACKSLASH:
				self.setButton(BUTTON.CANCEL, 0);
				break;

			case KEY.P:
				if (ec.core.paused()) {
					ec.core.resume();
				} else {
					ec.core.pause();
				}
				break;

			case KEY.O:
				ec.core.cycleDebug();
				break;

			case KEY.F:
			case KEY.SLASH:
				ec.core.fullscreen();
				break;

			default:
				console.log(String.fromCharCode(keyCode), keyCode);
		}
	};

	proto.updateAxes1FromKeys = function() {
		var x = ((ec.keyPressed[KEY.LEFT] || ec.keyPressed[KEY.A]) ? -1 : 0) + ((ec.keyPressed[KEY.RIGHT] || ec.keyPressed[KEY.D]) ? 1 : 0);
		var y = ((ec.keyPressed[KEY.UP] || ec.keyPressed[KEY.W]) ? -1 : 0) + ((ec.keyPressed[KEY.DOWN] || ec.keyPressed[KEY.S]) ? 1 : 0);
		this.keyboardAxes1 = x || y;
		this.setAxes1(x, y);
	};

	// GamePad

	proto.pollDummyGamePadList = function() {
		return dummyGamePadList;
	};

	proto.pollGamePadList = function() {
		return navigator.webkitGetGamepads();
	};

	proto.onGamepadConnect = function(e) {
		console.log('onGamepadConnect', e);
		if (e.gamepad.index === 0) {
			var gamepad = e.gamepad;
			this.pollGamePad = function() {
				return gamepad;
			};
		}
	};

	proto.onGamepadDisconnect = function(e) {
		console.log('onGamepadDisconnect', e);
		if (e.gamepad.index === 0) {
			this.pollGamePad = this.pollDummyGamePadList;
		}
	};

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

})(window);