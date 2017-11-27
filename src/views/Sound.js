import global from '../global.js';

function testAudio() {
    var audioTest = new Audio();
    return {
        m4a: !!(audioTest.canPlayType('audio/mp4') || audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')
        // wav: !!(audioTest.canPlayType('audio/x-wav') || audioTest.canPlayType('audio/wav; codecs="1"')).replace(/^no$/,''),
        // mp3: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/,''),
        // webm: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,'')
    };
}

function randomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj) {
        if (Math.random() < 1 / ++count) {
            result = prop;
        }
    }
    return result;
}

export default class Sound {

    constructor() {
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
                    step1: [403 / 48000, 2807 / 48000],
                    step2: [6405 / 48000, 2798 / 48000],
                    step3: [12403 / 48000, 2806 / 48000],
                    step4: [18397 / 48000, 2806 / 48000]
                },
                maxInstances: 2,
                volume: 0.1,
                state: 0
            },
            strikes: {
                name: 'strikes',
                urls: ['audio/strikes.m4a', 'audio/strikes.ogg'],
                sprites: {
                    strike1: [0, 18400 / 48000],
                    strike2: [18208 / 48000, 13210 / 48000],
                    strike3: [31418 / 48000, 19279 / 48000],
                    strike4: [57124 / 48000, 21064 / 48000],
                    strike5: [81401 / 48000, 27134 / 48000],
                    strike6: [117817 / 48000, 21422 / 48000],
                    strike7: [139239 / 48000, 16155 / 48000],
                    strike8: [155394 / 48000, 21990 / 48000],
                    strike9: [180525 / 48000, 20315 / 48000],
                    strike10: [200840 / 48000, 17173 / 48000]
                },
                maxInstances: 3,
                volume: 0.6,
                state: 0
            },
            hits: {
                name: 'hits',
                urls: ['audio/hits.m4a', 'audio/hits.ogg'],
                sprites: {
                    hit1: [0, 27722 / 48000],
                    hit2: [27722 / 48000, 20278 / 48000],
                    hit3: [48000 / 48000, 23654 / 48000],
                    hit4: [71654 / 48000, 21144 / 48000],
                    hit5: [92798 / 48000, 23494 / 48000],
                    hit6: [116292 / 48000, 21496 / 48000]
                },
                maxInstances: 5,
                volume: 0.5,
                state: 0
            },
            stars: {
                name: 'stars',
                urls: ['audio/stars.m4a', 'audio/stars.ogg'],
                sprites: {
                    star1: [0, 18094 / 48000],
                    star2: [18094 / 48000, 22488 / 48000]
                },
                maxInstances: 6,
                volume: 0.2,
                state: 0
            }
        };
        this.buffers = {};
        this.sources = {};

        var context;
        if (global.webaudio) {
            try {
                if (window.AudioContext) {
                    context = new window.AudioContext();
                } else if (window.webkitAudioContext) {
                    context = new window.webkitAudioContext();
                }
            } catch (e) {
                console.error('Web Audio API not supported');
            }
        }

        if (!context) {
            global.webaudio = false;

            // Web Audio API Polyfill
            const BufferSourcePolyfill = function () {
                global.extend(this, {
                    audio: new Audio(),
                    buffer: null,
                    loop: false,
                    gain: {value: 1},
                    playbackState: 0,
                    timeoutId: -1
                });
            };
            BufferSourcePolyfill.prototype = {
                connect(node) {
                    this.gain = node.gain || this.gain;
                },
                disconnect() {
                    this.playbackState = 3;
                    if (this.timeoutId > -1) {
                        clearTimeout(this.timeoutId);
                    }
                },
                start(i, pos, duration) {
                    i = 0;
                    var audio = this.audio;
                    audio.id = Date.now() + '';
                    audio.src = this.buffer.url;
                    audio.preload = 'auto';
                    audio.volume = this.gain.value * global.sound.volume;
                    audio.loop = this.loop;
                    this.playbackState = 1;
                    var self = this;
                    var ended = function () {
                        audio.removeEventListener('ended', ended, false);
                        audio.removeEventListener('paused', ended, false);
                        self.disconnect();
                    };
                    var playthrough = function () {
                        //pos, duration
                        audio.currentTime = pos;
                        audio.play();
                        self.playbackState = self.PLAYING_STATE;
                        if (!self.loop) {
                            audio.addEventListener('ended', ended, false);
                            audio.addEventListener('paused', ended, false);
                        }
                        if (duration > 0) {
                            self.timeoutId = setTimeout(function () {
                                if (self.stop) {
                                    self.stop(0);
                                } else {
                                    self.noteOff(0);
                                }
                            }, duration * 1000 - 16.7);
                        }
                        audio.removeEventListener('canplay', playthrough, false);
                    };
                    audio.addEventListener('canplay', playthrough, false);
                    audio.load();
                },
                stop() {
                    this.audio.pause();
                    this.disconnect();
                },
                PLAYING_STATE: 2
            };
            context = {
                pool: [],
                destination: null,
                createBufferSource() {
                    var source;
                    if (this.pool.length > 8) {
                        for (var i = this.pool.length; i-- > 0;) {
                            var pooledSource = this.pool[i];
                            if (pooledSource.playbackState === 3) {
                                source = pooledSource;
                                break;
                            }
                        }
                    }
                    if (!source) {
                        source = new BufferSourcePolyfill();
                        this.pool.push(source);
                    }
                    return source;
                },
                createGain() {
                    return {
                        gain: {
                            value: 1
                        },
                        connect() {
                        },
                        disconnect() {
                        }
                    };
                }
            };
            // end Web Audio API Polyfill
        } else {
            var createGainNode = context.createGainNode;
            if (createGainNode) {
                context.createGain = createGainNode;
            }
        }
        this.gainNode = context.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(context.destination);
        this.context = context;

        if (global.debug > 1 && this.constructor === Sound) {
            Object.seal(this);
        }
    }

    // special commands
    playGameMusic() {
        if (this.context) {
            this.playSound(this.sounds.game);
            this.stopSound(this.sounds.ending);
        }
    }

    playEndingMusic() {
        if (this.context) {
            this.playSound(this.sounds.ending);
            this.stopSound(this.sounds.game);
        }
    }

    // global commands
    pause() {
        this.paused = true;
        for (var prop in this.sources) {
            this.pauseSound(this.sounds[prop]);
        }
    }

    resume() {
        this.paused = false;
        for (var prop in this.sources) {
            this.resumeSound(this.sounds[prop]);
        }
    }

    stop() {
        for (var prop in this.sources) {
            this.stopSound(this.sounds[prop]);
        }
    }

    setVolume(value) {
        this.volume = value;
        if (this.gainNode) {
            this.gainNode.gain.value = value;
        }
    }

    //resource / instance specific commands
    playSound(resource, spriteName) {
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
                    return;
                }
            }
            source = this.sources[resource.name] = this.context.createBufferSource();
            source.buffer = buffer;

            source.loop = resource.loop;

            var gainNode = this.gainNode;
            if (resource.volume !== undefined) {
                gainNode = this.context.createGain();
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
                if (source.start) {
                    source.start(0, pos, duration);
                } else {
                    source.noteGrainOn(0, pos, duration);
                }
            } else {
                if (source.start) {
                    source.start(0);
                } else {
                    source.noteOn(0);
                }
            }

        } else {
            this.loadSound(resource, !spriteName);
        }
    }

    pauseSound(resource) {
        var source = this.sources[resource.name];
        if (source && source.playbackState === source.PLAYING_STATE) {
            if (source.stop) {
                source.stop(0);
            } else {
                source.noteOff(0);
            }
        }
    }

    resumeSound(resource) {
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
                if (resumedSource.start) {
                    resumedSource.start(0);
                } else {
                    resumedSource.noteOn(0);
                }
            }
        }
    }

    stopSound(resource) {
        var source = this.sources[resource.name];
        if (source) {
            this.pauseSound(resource);
            delete this.sources[resource.name];
            source.disconnect(0);
            source = null;
        }
    }

    loadSound(resource, autoPlay) {
        if (!resource.state) {

            var url = null;
            for (var i = 0; i < resource.urls.length; i++) {
                var ext = resource.urls[i].toLowerCase().match(/.+\.([^?]+)(\?|$)/)[1];
                if (this.codecs[ext]) {
                    url = resource.urls[i];
                    break;
                }
            }

            resource.state = 1;

            var soundLoaded = (buffer) => {
                this.buffers[resource.name] = buffer;
                resource.state = 3;
                if (autoPlay) {
                    this.playSound(resource);
                }
            };

            if (global.webaudio === false) {
                // TODO: use polyfill
                var fakeBuffer = {url: url};
                soundLoaded(fakeBuffer);
                return;
            }

            var context = this.context;
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';

            // Decode asynchronously
            request.onload = function () {
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
    }

    onError() {
        console.error('Audio Error', arguments);
    }
}
