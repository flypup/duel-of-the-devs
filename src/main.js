import polyfills from './polyfills.js';
import global from './global.js';
import Core from './core.js';

polyfills();

(function () {

    const core = new Core();

    global.core = core;

    const docReadyHandler = function () {
        global.unbind(window.document, 'DOMContentLoaded', docReadyHandler, false);
        global.unbind(window, 'load', docReadyHandler, false);
        global.ready = true;
    };

    global.bind(window.document, 'DOMContentLoaded', docReadyHandler, false);
    global.bind(window, 'load', docReadyHandler, false);

    core.begin();
    //core.trackCustom(2, 'version', global.version, 3);
})();
