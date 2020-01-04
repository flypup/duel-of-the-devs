import { webgl } from './env';

const document = window.document;
const navigator = window.navigator;

export default {
    debug: 0,
    ready: false,

    // Display
    forcePixelRatio: false,
    fullscreen: true,
    pixelRatio: 1,
    width: 1280,
    height: 720,
    webgl: webgl,

    // Environment
    touch: (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch),
    msTouch: navigator.msPointerEnabled,
    mobile: (/iPhone|iPad|iPod|Android/).test(navigator.userAgent),
    ios: (/iPhone|iPad|iPod/).test(navigator.userAgent),
    ipad: (/iPad/).test(navigator.userAgent),
    android: (/Android/).test(navigator.userAgent),
    standalone: !!navigator.standalone,
    webaudio: !!window.AudioContext,
    gamepads: !!navigator.getGamepads,

    mapList: [
        'hallway',
        'training-hall',
        'testmap3S',
        'noodleshop3S',
        'testmap',
        'testmap2',
        'courtyard'
    ],
    playerInteractions: -2,
    maps: {},
    scenes: {},
    entities: {
        Box: null,
        Circle: null,
        Dot: null,
        EmptyHand: null,
        Ninja: null,
        Player: null,
        Projectile: null,
        Puff: null,
        MapElement: null,
    },
    inputs: {
        EnemyInput: null,
        GoalBasedInput: null,
        ShadowCloneInput: null,
        UserInput: null,
    },
    core: null,
    sound: null,
    view: null,
    world: null,
    player: null,

    loadMap: function (data) {
        console.log('loadMap', data.name);
        this.maps[data.name] = data;
    },

    loadScene: function (data) {
        console.log('loadScene', data.name);
        this.scenes[data.name] = data;
    },

    extend: function (target, source) {
        if (this.debug && source === undefined) {
            throw 'extend "source" param undefined.';
        }
        for (const prop in source) {
            if (Object.prototype.hasOwnProperty.call(source, prop)) {
                if (!Object.prototype.hasOwnProperty.call(target, prop)) {
                    const copy = source[prop];
                    if (copy !== undefined) {
                        target[prop] = copy;
                    }
                }
            }
        }
        return target;
    },

    copy: function (target, source) {
        if (this.debug && source === undefined) {
            throw 'copy "source" param undefined.';
        }
        target = target || {};
        for (const prop in source) {
            target[prop] = source[prop];
        }
        return target;
    },

    delegate: function (obj, func) {
        return function () {
            return func.apply(obj, arguments);
        };
    },

    objectToProps: function (arr, prop) {
        const propArray = [];
        for (let i = 0, len = arr.length; i < len; i++) {
            propArray.push(arr[i][prop]);
        }
        return propArray;
    },

    bind: function (obj, event, func, bool) {
        bool = bool || false;
        if (obj.addEventListener) {
            obj.addEventListener(event, func, bool);
        } else if (obj.attachEvent) {
            obj.attachEvent('on' + event, func);
        } else {
            // not exactly 'trigger' or 'dispatchEvent' friendly
            obj['on' + event] = func;
        }
    },

    unbind: function (obj, event, func, bool) {
        bool = bool || false;
        if (obj.removeEventListener) {
            obj.removeEventListener(event, func, bool);
        } else if (obj.detachEvent) {
            obj.detachEvent('on' + event, func);
        } else {
            delete obj['on' + event];
        }
    },

    addPool: function (fnClass) {
        const pool = fnClass.pool = [];
        const term = fnClass.prototype.term;
        fnClass.create = function () {
            let instance = this.pool.pop();
            if (!instance) {
                instance = new this(arguments);
            } else {
                instance.init.apply(instance, arguments);
            }
            return instance;
        };
        fnClass.prototype.term = function () {
            if (term) {
                term.apply(this);
            }
            pool.push(this);
        };
    },
};
