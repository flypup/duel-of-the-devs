import global from '../global';
import { gamepads, touch } from '../env';
import { traceTime, traceTimeEnd } from '../logging';

const KEY = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    SPACE: 32,
    NUM0: 48,
    NUM1: 49,
    NUM2: 50,
    NUM3: 51,
    NUM4: 52,
    NUM5: 53,
    NUM6: 54,
    NUM7: 55,
    NUM8: 56,
    NUM9: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    SLASH: 191,
    BACKSLASH: 220
};

const BUTTON = {
    SELECT: 0,
    CANCEL: 1
};

const dummyGamePadList = [undefined, undefined, undefined, undefined];

let keyPressed = {};

let self;

export default class UserInput {

    constructor(index) {
        self = this;
        this.index = index || 0;
        this.gamepadTime = 1;
        const buttons = this.buttons = [];
        for (let i = 0; i < 17; i++) {
            buttons[i] = 0;
        }
        this.axes = [0, 0, 0, 0];

        if (gamepads) {
            global.bind(window, 'MozGamepadConnected', this.onGamepadConnect, false);
            global.bind(window, 'MozGamepadDisconnected', this.onGamepadDisconnect, false);
        }

        this.pollGamePad = (navigator.webkitGetGamepads !== undefined) ? this.pollGamePadList : this.pollDummyGamePadList;
        this.keyboardAxes1 = false;
        this.keyboardAxes2 = false;
        this.overlays = [];

        this.width = 0;
        this.height = 0;
        this.pixelRatio = 1.0;

        if (global.debug > 1 && this.constructor === UserInput) {
            Object.seal(this);
        }
    }

    addButtonOverlay(overlay) {
        const index = this.overlays.indexOf(overlay);
        if (index < 0) {
            this.overlays.push(overlay);
            return overlay;
        }
        console.error('overlay already a child of input', overlay);
        return null;
    }

    removeButtonOverlay(overlay) {
        const index = this.overlays.indexOf(overlay);
        if (index > -1) {
            this.overlays.splice(index, 1);
            global.unbind(overlay, 'touchstart', overlay.touchStart, false);
            global.unbind(overlay, 'touchend', overlay.touchEnd, false);
            return overlay;
        }
        console.error('overlay not a child of input', overlay);
        return null;
    }

    draw(context) {
        // TODO: Canvas2dOverlayView ------------
        context.save();

        let overlay;
        for (let i = 0, len = this.overlays.length; i < len; i++) {
            overlay = this.overlays[i];
            overlay.draw(context, this.width, this.height);
        }

        if (global.core.paused()) {
            // dim screen
            context.fillStyle = '#000000';
            context.globalAlpha = 0.33;
            context.fillRect(0, 0, this.width, this.height);
            // TODO: Play Icon Sprite
            context.fillStyle = '#ffffff';
            context.globalAlpha = 0.8;
            context.beginPath();
            context.moveTo(this.width - 15, 35);
            context.lineTo(this.width - 50, 15);
            context.lineTo(this.width - 50, 55);
            context.fill();

        } else if (touch) {
            // TODO: Pause Icon Sprite
            context.fillStyle = '#ffffff';
            context.globalAlpha = 0.8;
            context.fillRect(this.width - 43, 15, 10, 40);
            context.fillRect(this.width - 25, 15, 10, 40);
        }

        overlay = global.core.getOverlay();
        if (overlay) {
            const scale = Math.min(this.height / overlay.height, this.width / overlay.width);
            const x = this.width - overlay.width * scale;
            const y = this.height - overlay.height * scale;
            context.globalAlpha = 1;
            if (global.debug === 1) {
                traceTime('drawImage overlay ' + overlay.src);
            }
            context.drawImage(overlay, x / 2, y / 2, overlay.width * scale, overlay.height * scale);
            if (global.debug === 1) {
                traceTimeEnd('drawImage overlay ' + overlay.src);
            }
        }
        context.restore();
    }

    resize(width, height, ratio) {
        this.width = width * ratio;
        this.height = height * ratio;
        this.pixelRatio = ratio;
    }

    testOverlays(type, data, id) {
        const width = this.width / this.pixelRatio;
        const height = this.height / this.pixelRatio;
        for (let i = 0, len = this.overlays.length; i < len; i++) {
            const overlay = this.overlays[i];
            if (type === 'touchend') {
                if (overlay === this.leftStickOverlay || overlay === this.rightStickOverlay) {
                    if (overlay['on' + type] !== undefined) {
                        overlay['on' + type].apply(overlay, [data, id]);
                    }
                }
            }
            if (overlay.hitTest(data.clientX, data.clientY, width, height)) {//offsetX,Y ?
                //console.log('hit overlay:', overlay, id);
                if (overlay['on' + type] !== undefined) {
                    overlay['on' + type].apply(overlay, [data, id]);
                }
                return overlay;
            }
        }
        //console.log('no hit:', type, data, id);
        return null;
    }

    setLeftStickOverlay(overlay) {
        this.leftStickOverlay = overlay;
        global.bind(overlay, 'touchstart', overlay.touchStart, false);
        global.bind(overlay, 'touchend', overlay.touchEnd, false);
    }

    setRightStickOverlay(overlay) {
        this.rightStickOverlay = overlay;
        global.bind(overlay, 'touchstart', overlay.touchStart, false);
        global.bind(overlay, 'touchend', overlay.touchEnd, false);
    }

    setAxes1(x, y) {
        this.axes[0] = x;
        this.axes[1] = y;
        // console.log(this.axes);
    }

    setAxes2(x, y) {
        this.axes[2] = x;
        this.axes[3] = y;
        // console.log(this.axes);
    }

    setButton(index, value) {
        this.buttons[index] = value;
        // console.log(this.buttons);
    }

    mapButton(name, index) {
        BUTTON[name] = index;
    }

    // game loop
    poll() {
        this.pollGamepads();
    }

    pollGamepads() {
        // virtial gamepad
        if (this.leftStickOverlay && !this.keyboardAxes1) {
            this.setAxes1(this.leftStickOverlay.vx / 100, this.leftStickOverlay.vy / 100);
        }

        if (this.rightStickOverlay && !this.keyboardAxes2) {
            this.setAxes2(this.rightStickOverlay.vx / 100, this.rightStickOverlay.vy / 100);
        }

        // gamepad
        const gamepad = this.pollGamePad()[this.index];
        if (gamepad && this.gamepadTime !== gamepad.timestamp) {
            this.gamepadTime = gamepad.timestamp || 1;
            //pause button
            if (gamepad.buttons[9] === 1 && this.buttons[9] !== 1) {
                global.core.togglePause();
            }
            if (gamepad.buttons.join('') !== this.buttons.join('')) {
                console.log('gamepad button change', gamepad.buttons.indexOf(1), this.buttons.indexOf(1), gamepad.axes);
            }
            this.buttons = gamepad.buttons.slice(0);
            if (!this.keyboardAxes1) {
                this.setAxes1(gamepad.axes[0], gamepad.axes[1]);
            }
            if (!this.keyboardAxes2) {
                this.setAxes2(gamepad.axes[3], gamepad.axes[4]);
            }
        }
    }

    mapCollision() {
    }

    // Touch / Mouse

    touchstart(e) {
        //console.log(e.type, e);
        if (global.core.paused()) {
            return;
        }
        for (let i = 0, len = e.changedTouches.length; i < len; i++) {
            self.testOverlays(e.type, e.changedTouches[i], e.changedTouches[i].identifier);
        }
    }

    touchmove(e) {
        //console.log(e.type, e.changedTouches[0].identifier, e.changedTouches);
        for (let i = 0, len = self.overlays.length; i < len; i++) {
            const overlay = self.overlays[i];
            for (let j = 0, jlen = e.changedTouches.length; j < jlen; j++) {
                if (overlay.hasTouch(e.changedTouches[j].identifier)) {
                    overlay.updateTouch(e.changedTouches[j].identifier, e.changedTouches[j].clientX, e.changedTouches[j].clientY);
                    break;
                }
            }
        }

        // prevent scrolling
        e.preventDefault();
    }

    touchend(e) {
        //console.log(e.type, e);
        if (global.core.paused()) {
            global.core.resume();
            return;
        }
        for (let i = 0, len = e.changedTouches.length; i < len; i++) {
            self.testOverlays(e.type, e.changedTouches[i], e.changedTouches[i].identifier);
        }
    }

    mousedown(e) {
        //console.log(e.type, e);
        if (global.core.paused()) {
            return;
        }
        if (!self.testOverlays(e.type, e, -1)) {
            global.bind(global.core.getViewDom(), 'mousemove', self.mouseRightStick, false);
            global.bind(window, 'mouseup', self.mouseRightStickEnd, false);
            self.mouseRightStick(e);
        }
    }

    mouseRightStick(e) {
        //console.log(e.type, e);
        const halfWidth = e.target.width / 2;
        const halfHeight = e.target.height / 2;
        let x = (e.offsetX || e.layerX) - halfWidth;
        let y = (e.offsetY || e.layerY) - halfHeight;
        const camera = global.core.getCamera();
        //camera to player offset
        y -= 64 * camera.scaleY;
        const length = Math.sqrt(x * x + y * y);
        x /= length;
        y /= length;
        self.setAxes2(x, y);
    }

    mouseRightStickEnd() {
        global.unbind(global.core.getViewDom(), 'mousemove', self.mouseRightStick, false);
        self.setAxes2(0, 0);
    }

    mouseup(e) {
        ////console.log(e.type, e);
        if (global.core.paused()) {
            global.core.resume();
            return;
        }
        self.testOverlays(e.type, e, -1);
    }

    // Keyboard

    keydown(e) {
        const keyCode = e.keyCode || e.which;

        keyPressed[keyCode] = true;

        switch (keyCode) {
        case KEY.RIGHT:
        case KEY.D:
        case KEY.LEFT:
        case KEY.A:
        case KEY.UP:
        case KEY.W:
        case KEY.DOWN:
        case KEY.S:
            self.updateAxes1FromKeys();
            break;

        case KEY.SPACE:
        case KEY.ENTER:
            self.setButton(BUTTON.SELECT, 1);
            break;

        case KEY.BACKSLASH:
            self.setButton(BUTTON.CANCEL, 1);
            break;
        }
    }

    keyup(e) {
        const keyCode = e.keyCode || e.which;

        keyPressed[keyCode] = false;

        switch (keyCode) {
        case KEY.RIGHT:
        case KEY.D:
        case KEY.LEFT:
        case KEY.A:
        case KEY.UP:
        case KEY.W:
        case KEY.DOWN:
        case KEY.S:
            self.updateAxes1FromKeys();
            break;

        case KEY.SPACE:
        case KEY.ENTER:
            self.setButton(BUTTON.SELECT, 0);
            break;

        case KEY.BACKSLASH:
            self.setButton(BUTTON.CANCEL, 0);
            break;

        case KEY.P:
            if (global.core.paused()) {
                global.core.resume();
            } else {
                global.core.pause();
            }
            break;

        case KEY.O:
            global.core.cycleDebug();
            break;

        case KEY.M:
            global.core.cycleMap();
            break;

        case KEY.F:
        case KEY.SLASH:
            global.core.fullscreen();
            break;

        default:
            console.log(String.fromCharCode(keyCode), keyCode);
        }
    }

    clearKeys() {
        keyPressed = {};
        this.keyboardAxes1 = false;
        this.keyboardAxes2 = false;
        this.setAxes1(0, 0);
        this.setAxes2(0, 0);
        this.setButton(BUTTON.SELECT, 0);
        this.setButton(BUTTON.CANCEL, 0);
    }

    updateAxes1FromKeys() {
        const x = ((keyPressed[KEY.LEFT] || keyPressed[KEY.A]) ? -1 : 0) + ((keyPressed[KEY.RIGHT] || keyPressed[KEY.D]) ? 1 : 0);
        const y = ((keyPressed[KEY.UP] || keyPressed[KEY.W]) ? -1 : 0) + ((keyPressed[KEY.DOWN] || keyPressed[KEY.S]) ? 1 : 0);
        this.keyboardAxes1 = x || y;
        this.setAxes1(x, y);
    }

    // GamePad

    pollDummyGamePadList() {
        return dummyGamePadList;
    }

    pollGamePadList() {
        return navigator.webkitGetGamepads();
    }

    onGamepadConnect(e) {
        console.log('onGamepadConnect', e);
        if (e.gamepad.index === 0) {
            const gamepad = e.gamepad;
            this.pollGamePad();
            {
                return gamepad;
            }
            
        }
    }

    onGamepadDisconnect(e) {
        console.log('onGamepadDisconnect', e);
        if (e.gamepad.index === 0) {
            this.pollGamePad = this.pollDummyGamePadList;
        }
    }

}

global.inputs.UserInput = UserInput;
