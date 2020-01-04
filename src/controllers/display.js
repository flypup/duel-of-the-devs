import global from '../global';
import { mobile, ipad, standalone } from '../env';

const document = window.document;

export function resizeDisplay() {

    // viewport width and height
    let width;
    let height;

    // pixel ratio (x2 = retina, reduce scale to improve performance of canvas rendering)
    let pixelRatio = global.forcePixelRatio || window.devicePixelRatio || 1;

    if (mobile) {
        // fit to screen
        const screenWidth = Math.max(window.screen.width, window.screen.height);
        const screenHeight = Math.min(window.screen.width, window.screen.height);

        width = screenWidth;
        height = screenHeight;

        /* iPad 3 does not render full resultion well */
        // TODO: do same for iPhone 4
        if (ipad) {//} && !webgl) {
            pixelRatio = Math.min(1, pixelRatio);

            if (!standalone) {
                height -= 96;
            }
        }

    } else {
        // fit to browser window
        const x =  16; // window.innerWidth;
        const y =  9; // Math.min(window.innerHeight, window.innerWidth * 4 / 3);
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight;

        width = x;
        height = y;

        while (width + x <= maxWidth && height + y <= maxHeight) {
            width += x;
            height += y;
        }
        //center display in browser window
        document.body.style.left = Math.floor((maxWidth - width) / 2) + 'px';
        document.body.style.top = Math.floor((maxHeight - height) / 2) + 'px';
    }

    if (global.width !== width || global.height !== height || global.pixelRatio !== pixelRatio) {
        global.pixelRatio = pixelRatio;
        global.width = width;
        global.height = height;
        document.body.style.width = width + 'px';
        document.body.style.height = height + 'px';

        return true;
    }

    return false;
}
