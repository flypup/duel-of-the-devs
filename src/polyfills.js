export default function () {

    const document = window.document;
    const navigator = window.navigator;

    function prefixed(str, obj) {
        return obj[str] || obj['webkit' + str] || obj['moz' + str] || obj['o' + str] || obj['ms' + str];
    }

    const date = Date;
    if (!date.now) {
        date.now = function () {
            return +(new date());
        };
    }

    if (!window.requestAnimationFrame) {
        let lastTime = 0;
        window.requestAnimationFrame = prefixed('RequestAnimationFrame', window) || function (callback) {
            const currTime = date.now(), timeToCall = Math.max(0, 16 - ( currTime - lastTime ));
            const id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = prefixed('CancelAnimationFrame', window) || prefixed('CancelRequestAnimationFrame', window) || function (id) {
            window.clearTimeout(id);
        };
    }


    if (!window.localStorage) {
        window.localStorage = {
            _data: {},
            setItem: function (id, val) {
                return this._data[id] = String(val);
            },
            getItem: function (id) {
                return Object.prototype.hasOwnProperty.call(this._data, id) ? this._data[id] : undefined;
            },
            removeItem: function (id) {
                return delete this._data[id];
            },
            clear: function () {
                return this._data = {};
            }
        };
    }

    const body = document.body;

    if (!body.requestFullscreen) {
        body.requestFullscreen = body.requestFullscreen || prefixed('RequestFullScreen', body) || prefixed('RequestFullscreen', body);
        document.cancelFullScreen = prefixed('CancelFullScreen', document);
    }

    //tests
    if (!window.AudioContext) {
        window.AudioContext = prefixed('AudioContext', window);
    }

    if (!navigator.getGamepads) {
        navigator.getGamepads = prefixed('GetGamepads', navigator);
    }
}
