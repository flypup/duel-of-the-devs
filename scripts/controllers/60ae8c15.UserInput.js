(function(window) {
	'use strict';

	var ec = window.ec;
	var dummyGamePadList = [undefined, undefined, undefined, undefined];

	var UserInput = ec.UserInput = function(index) {
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
	};

	UserInput.prototype.setAxes1 = function(x, y) {
		this.axes[0] = x;
		this.axes[1] = y;
		// console.log(this.axes);
	};

	UserInput.prototype.setButton = function(index, value) {
		this.buttons[index] = value;
		// console.log(this.buttons);
	};

	UserInput.prototype.poll = function() {
		var gamepad = this.pollGamePad()[this.index];
		if (gamepad && this.gamepadTime !== gamepad.timestamp) {
			this.gamepadTime = gamepad.timestamp || 1;
			//pause button
			if (gamepad.buttons[9] === 1 && this.buttons[9] !== 1) {
				if (ec.core.paused()) {
					ec.core.resume();
				} else {
					ec.core.pause();
				}
			}
			if (gamepad.buttons.join('') !== this.buttons.join('')) {
				console.log('gamepad button change', gamepad.buttons.indexOf(1), this.buttons.indexOf(1), gamepad.axes);
			}
			this.buttons = gamepad.buttons.slice(0);
			this.axes = gamepad.axes.slice(0);
		}
	};

	UserInput.prototype.pollDummyGamePadList = function() {
		return dummyGamePadList;
	};

	UserInput.prototype.pollGamePadList = function() {
		return navigator.webkitGetGamepads();
	};

	UserInput.prototype.onGamepadConnect = function(e) {
		console.log('onGamepadConnect', e);
		if (e.gamepad.index === 0) {
			var gamepad = e.gamepad;
			this.pollGamePad = function() {
				return gamepad;
			};
		}
	};

	UserInput.prototype.onGamepadDisconnect = function(e) {
		console.log('onGamepadDisconnect', e);
		if (e.gamepad.index === 0) {
			this.pollGamePad = this.pollDummyGamePadList;
		}
	};

})(window);