(function(window) {
	'use strict';

	var ec = window.ec;
	var Howler = window.Howler;
	var Howl = window.Howl;

	var Sound = ec.Sound = function() {
		ec.extend(this, {
			background: null,
			game: new Howl({
				urls: ['audio/game.aac', 'audio/game.ogg'],
				loop: true
			}),
			ending: new Howl({
				urls: ['audio/ending.aac', 'audio/ending.ogg'],
				loop: true
			})
		});
		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	Sound.prototype = {
		playBackground: function(track) {
			// TODO: stop other music
			if (this.background) {
				this.background.stop();
			}
			this.background = track;
			track.play();
		},

		playGameMusic: function() {
			this.playBackground(this.game);
		},

		playEndingMusic: function() {
			this.playBackground(this.ending);
		},

		setVolume: function(value) {
			Howler.volume(value);
		},

		pause: function() {
			if (this.background) {
				this.background.pause();
			}
		},

		resume: function() {
			if (this.background) {
				this.background.play();
			}
		},


		stop: function() {
			this.game.stop();
			this.ending.stop();
		}
	};

})(window);