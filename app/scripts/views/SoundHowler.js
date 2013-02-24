(function(window) {
	'use strict';

	var ec = window.ec;
	var Howler = window.Howler;
	var Howl = window.Howl;

	var Sound = ec.Sound = function() {
		ec.extend(this, {
			background: null,
			game: new Howl({
				urls: ['audio/crickets.m4a', 'audio/crickets.ogg'],
				loop: true
			}),
			ending: new Howl({
				urls: ['audio/ending.m4a', 'audio/ending.ogg']
			}),
			steps: new Howl({
				urls: ['audio/steps.m4a', 'audio/steps.ogg'],
				sprite: {
					step1: [403/48, 2807/48],
					step2: [6405/48, 2798/48],
					step3: [12403/48, 2806/48],
					step4: [18397/48, 2806/48]
				}
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