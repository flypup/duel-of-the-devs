(function(window) {
	'use strict';

	var ec = window.ec;

	var Sound = ec.Sound = function() {
		this.codecs = testAudio();
		this.volume = 1.0;
		this.paused = false;
		this.sounds = { //resources
			game: {
				name: 'game',
				urls: ['audio/crickets.m4a', 'audio/crickets.ogg'],
				loop: true,
				maxInstances: 1,
				state: 0
			},
			ending: {
				name: 'ending',
				urls: ['audio/ending.m4a', 'audio/ending.ogg'],
				maxInstances: 1,
				state: 0
			},
			steps: {
				name: 'steps',
				urls: ['audio/steps.m4a', 'audio/steps.ogg'],
				sprites: {
/*
<rdf:li rdf:parseType="Resource">\s+<xmpDM:startTime>(\d+)</xmpDM:startTime>\s+<xmpDM:duration>(\d+)</xmpDM:duration>\s+<xmpDM:name>([^\<]+)</xmpDM:name>\s+</rdf:li>
*/
					step1: [403/48000, 2807/48000],
					step2: [6405/48000, 2798/48000],
					step3: [12403/48000, 2806/48000],
					step4: [18397/48000, 2806/48000]
				},
				maxInstances: 2,
				volume: 0.1,
				state: 0
			},
			strikes: {
				name: 'strikes',
				urls: ['audio/strikes.m4a', 'strikes/steps.ogg'],
				sprites: {
					strike1: [0, 18400/48000],
                    strike2: [18208/48000, 13210/48000],
                    strike3: [31418/48000, 19279/48000],
                    strike4: [57124/48000, 21064/48000],
                    strike5: [81401/48000, 27134/48000],
                    strike6: [117817/48000, 21422/48000],
                    strike7: [139239/48000, 16155/48000],
                    strike8: [155394/48000, 21990/48000],
                    strike9: [180525/48000, 20315/48000],
                    strike10: [200840/48000, 17173/48000]
				},
				maxInstances: 3,
				volume: 0.6,
				state: 0
			},
			hits: {
				name: 'hits',
				urls: ['audio/hits.m4a', 'audio/hits.ogg'],
				sprites: {
					hit1: [0, 27722/48000],
                    hit2: [27722/48000, 20278/48000],
                    hit3: [48000/48000, 23654/48000],
                    hit4: [71654/48000, 21144/48000],
                    hit5: [92798/48000, 23494/48000],
                    hit6: [116292/48000, 21496/48000]
				},
				maxInstances: 5,
				volume: 0.5,
				state: 0
			},
			stars: {
				name: 'stars',
				urls: ['audio/stars.m4a', 'audio/stars.ogg'],
				sprites: {
					star1: [0, 18094/48000],
                    star2: [18094/48000, 22488/48000]
				},
				maxInstances: 6,
				volume: 0.2,
				state: 0
			}
		};
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

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	function testAudio() {
		var audioTest = new Audio();
		return {
			m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/,''),
			ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'')
			// wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/,''),
			// mp3: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/,''),
			// webm: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,'')
		};
	}

	function randomProperty(obj) {
		var result;
		var count = 0;
		for (var prop in obj) {
			if (Math.random() < 1/++count) {
				result = prop;
			}
		}
		return result;
	}

	Sound.prototype = {

		// special commands
		playGameMusic: function() {
			if (this.context) {
				this.playSound(this.sounds.game);
				this.stopSound(this.sounds.ending);
			}
		},

		playEndingMusic: function() {
			if (this.context) {
				this.playSound(this.sounds.ending);
				this.stopSound(this.sounds.game);
			}
		},

		// global commands
		pause: function() {
			this.paused = true;
			for (var prop in this.sources) {
				this.pauseSound(this.sounds[prop]);
			}
		},

		resume: function() {
			this.paused = false;
			for (var prop in this.sources) {
				this.resumeSound(this.sounds[prop]);
			}
		},

		stop: function() {
			for (var prop in this.sources) {
				this.stopSound(this.sounds[prop]);
			}
		},

		setVolume: function(value) {
			this.volume = value;
			if (this.gainNode) {
				this.gainNode.gain.value = value;
			}
		},

		//resource / instance specific commands
		playSound: function(resource, spriteName) {
			if (this.paused || this.volume < 0) {
				return;
			}
			var buffer = this.buffers[resource.name];
			if (buffer) {
				var source = this.sources[resource.name];
				if (source) {
					// instance of sound may be playing, but we're going to play a new one
					// TODO:  resource.maxInstances = 5
					if (resource.maxInstances === 1 && source.playbackState > 0) {

					}
				}
				source = this.sources[resource.name] = this.context.createBufferSource();
				source.buffer = buffer;

				source.loop = resource.loop;

				var gainNode = this.gainNode;
				if (resource.volume !== undefined) {
					gainNode = this.context.createGainNode();
					gainNode.gain.value = resource.volume;
					gainNode.connect(this.context.destination);
				}
				source.connect(gainNode);

				if (spriteName) {
					if (spriteName === '*') {
						spriteName = randomProperty(resource.sprites);
					}
					var sprite = resource.sprites[spriteName];
					var pos = sprite[0];
					var duration = sprite[1];
					//source.start(0, pos, buffer.duration);
					source.noteGrainOn(0, pos, duration);
				} else {
					source.noteOn(0);
				}

			} else {
				this.loadSound(resource, !spriteName);
			}
		},

		pauseSound: function(resource) {
			var source = this.sources[resource.name];
			if (source && source.playbackState === source.PLAYING_STATE) {
				source.noteOff(0);
			}
		},

		resumeSound: function(resource) {
			// TODO: handle resuming sprites (which sprite span)
			if (resource.sprites) {
				return;
			}
			var source = this.sources[resource.name];
			if (source) {
				if (source.playbackState !== source.PLAYING_STATE) {
					var resumedSource = this.sources[resource.name] = this.context.createBufferSource();
					resumedSource.buffer = source.buffer;
					resumedSource.loop = source.loop;
					resumedSource.connect(this.gainNode);
					resumedSource.noteOn(0);
				}
			}
		},

		stopSound: function(resource) {
			var source = this.sources[resource.name];
			if (source) {
				this.pauseSound(resource);
				delete this.sources[resource.name];
				source.disconnect(0);
				source = null;
			}
		},

		loadSound: function(resource, autoPlay) {
			if (!resource.state) {
				var context = this.context;
				var request = new XMLHttpRequest();
				
				var url = null;
				for (var i=0; i<resource.urls.length; i++) {
					var ext = resource.urls[i].toLowerCase().match(/.+\.([^?]+)(\?|$)/)[1];
					if (this.codecs[ext]) {
						url = resource.urls[i];
						break;
					}
				}
				resource.state = 1;
				request.open('GET', url, true);
				request.responseType = 'arraybuffer';

				var soundLoaded = ec.delegate(this, function(buffer) {
					this.buffers[resource.name] = buffer;
					resource.state = 3;
					if (autoPlay) {
						this.playSound(resource);
					}
				});

				// Decode asynchronously
				request.onload = function() {
					resource.state = 2;
					context.decodeAudioData(request.response, soundLoaded, this.onError);
				};
				try {
					request.send();
				} catch (err) {
					console.log(err);
					resource.state = 0;
				}
				
			}
		},

		onError: function() {
			console.error('Audio Error', arguments);
		}
	};

})(window);