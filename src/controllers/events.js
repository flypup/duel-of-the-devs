import global from '../global.js';
import { android, mobile, touch } from '../env.js';

const document = window.document;

const viewportmeta = android && document.querySelector && document.querySelector('meta[name="viewport"]');

// var preventDefault = function(e) {
//	e.preventDefault();
// };

export function addBrowserListeners(input) {
    global.bind(window, 'blur', global.core.pause, false);
    if (touch) {
        global.bind(global.core.getViewDom(), 'touchstart', input.touchstart, false);
        global.bind(global.core.getViewDom(), 'touchmove', input.touchmove, false);
        global.bind(global.core.getViewDom(), 'touchend', input.touchend, false);

        // global.bind(document, 'gesturestart', preventDefault, false);
        // global.bind(document, 'gesturechange', preventDefault, false);
        // thisglobal.bind(document, 'gestureend', preventDefault, false);
    } else {
        // TODO: we might want to listen to both - ex: win 8 tablet
        global.bind(global.core.getViewDom(), 'mousedown', input.mousedown, false);
        //global.bind(global.core.getViewDom(), 'mousemove', input.mousemove, false);
        global.bind(global.core.getViewDom(), 'mouseup', input.mouseup, false);
    }
    if (!mobile) {
        // resize window
        global.bind(window, 'resize', global.core.resize, false);
    }
    global.bind(document, 'keydown', input.keydown, false);
    global.bind(document, 'keyup', input.keyup, false);
}

export function preventPinchZoom() {
    if (android && viewportmeta) {
        viewportmeta.content = 'width=device-width, user-scalable=0';
    }
}

export function allowPinchZoom() {
    if (android && viewportmeta) {
        viewportmeta.content = 'width=device-width, user-scalable=1';
    }
}
