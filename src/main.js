import polyfills from './polyfills';
import global from './global';
import Core from './core';
import { scene } from './scenes/ninja-infiltration';

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

    global.loadScene(scene);

    core.begin();
    //core.trackCustom(2, 'version', global.version, 3);
})();
