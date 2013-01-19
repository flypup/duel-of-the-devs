(function(window) {
	'use strict';

	var ec = window.ec;

	var Sound = ec.Sound = function() {
		this.volume = 1.0;
		this.buffers = {};
		this.sources = {};
		if (ec.webaudio) {
			try {
				var context;
				if (window.AudioContext) {
					context = new window.AudioContext();
				} else if (window.webkitAudioContext) {
					context = new window.webkitAudioContext();
				}
				if (context) {
					this.gainNode = context.createGainNode();
					this.gainNode.gain.value = this.volume;
					this.gainNode.connect(context.destination);
					this.context = context;
				}
			} catch(e) {
				console.error('Web Audio API not supported');
			}
		}
	};

	var proto = Sound.prototype;

	proto.playGameMusic = function() {
		if (this.context) {
			this.playSound('audio/game.ogg', 'game', true);

			if (this.sources.ending) {
				this.sources.ending.disconnect(0);
			}
		}
	};

	proto.playEndingMusic = function() {
		if (this.context) {
			this.playSound('audio/ending.ogg', 'ending');

			if (this.sources.game) {
				this.sources.game.disconnect(0);
			}
		}
	};

	proto.setVolume = function(value) {
		this.volume = value;
		if (this.gainNode) {
			this.gainNode.gain.value = value;
		}
	};

	proto.playSound = function(url, name, loop) {
		if (this.volume === 0) {
			return;
		}
		var buffer = this.buffers[name];
		if (buffer) {
			var source = this.sources[name] = this.context.createBufferSource();
			source.buffer = buffer;

			// FIXME: hackalicious
			source.loop = (loop === true);

			source.connect(this.gainNode);

			source.noteOn(0);
		} else {
			this.loadSound(url, name);
		}
	};

	proto.stop = function() {
		if (this.sources.game) {
			this.sources.game.disconnect(0);
		}
		if (this.sources.ending) {
			this.sources.ending.disconnect(0);
		}
	};

	proto.loadSound = function(url, bufferName) {
		var context = this.context;
		var request = new XMLHttpRequest();
		
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		var soundLoaded = ec.delegate(this, function(buffer) {
			this.buffers[bufferName] = buffer;
			this.playSound(url, bufferName);
		});

		// Decode asynchronously
		request.onload = function() {
			context.decodeAudioData(request.response, soundLoaded, this.onError);
		};
		request.send();
	};

	proto.onError = function() {
		console.error('Audio Error', arguments);
	};

})(window);