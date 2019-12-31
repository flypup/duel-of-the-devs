import global from '../global';

const defaults = {
    type: 'circle',
    x: 0,
    y: 0,
    radius: 50
};

// Coordinates are relative to a container of this size:
let viewWidth_ = 1280;
let viewHeight_ = 720;

export default class ButtonOverlay {

    static get viewWidth() {
        return viewWidth_;
    }

    static set viewWidth(value) {
        viewWidth_ = value;
    }

    static get viewHeight() {
        return viewHeight_;
    }

    static set viewHeight(value) {
        viewHeight_ = value;
    }

    /*
     *	{
     *		type: 'rectangle',
     *		left: 0,
     *		top: 0,
     *		bottom: 50,
     *		right: 50
     *	};
     */

    constructor(options) {
        options = global.extend(options || {}, defaults);

        global.extend(this, options);
        this.radiusSq = this.radius ? this.radius * this.radius : 0;

        this.touches = [];
        this.pressed = false;
        this.vx =
        this.vy = 0;

        this.containerWidth = ButtonOverlay.viewWidth;
        this.containerHeight = ButtonOverlay.viewHeight;

        if (global.debug > 1 && this.constructor === ButtonOverlay) {
            Object.seal(this);
        }
    }

    hitTest(x, y, width, height) {
        this.containerWidth = width;
        this.containerHeight = height;
        if (this.type === 'circle') {
            const vx = x * ButtonOverlay.viewWidth / width - this.x;
            const vy = y * ButtonOverlay.viewHeight / height - this.y;
            if (vx * vx + vy * vy <= this.radiusSq) {
                return true;
            }
        } else if (this.type === 'rectangle') {
            if (x > this.left && x < this.right && y > this.top && y < this.buttom) {
                return true;
            }
        } else {
            console.error(this, 'invalid type:', this.type);
        }
        return false;
    }

    addTouch(id) {
        if (this.touches.indexOf(id) < 0) {
            this.touches.push(id);
        }
    }

    removeTouch(id) {
        const index = this.touches.indexOf(id);
        if (index > -1) {
            this.touches.splice(index, 1);
            this.vx =
            this.vy = 0;
        }
    }

    hasTouch(id) {
        return (this.touches.indexOf(id) > -1);
    }

    updateTouch(id, x, y) {
        let vx = x * ButtonOverlay.viewWidth / this.containerWidth - this.x;
        let vy = y * ButtonOverlay.viewHeight / this.containerHeight - this.y;
        //normalize and cap at 100 ?//
        const length = Math.sqrt(vx * vx + vy * vy);
        if (Math.abs(vx) > Math.abs(vx * 100 / length)) {
            vx = vx * 100 / length;
        }
        if (Math.abs(vy) > Math.abs(vy * 100 / length)) {
            vy = vy * 100 / length;
        }
        this.vx = vx;
        this.vy = vy;
    }

    touchStart(data, id) {
        this.addTouch(id);
        this.pressed = true;
        this.updateTouch(id, data.clientX, data.clientY);
    }

    touchEnd(data, id) {
        if (this.hasTouch(id)) {
            this.removeTouch(id);
            this.pressed = false;
        }
    }

    draw(context, width, height) {
        //if (context instanceof window.CanvasRenderingContext2D) {
        if (this.type === 'circle') {
            context.beginPath();
            context.fillStyle = '#000000';
            context.globalAlpha = 0.05;
            context.arc(
                this.x * ButtonOverlay.viewWidth / width,
                this.y * ButtonOverlay.viewHeight / height,
                this.radius * ButtonOverlay.viewWidth / width, 0, 2 * Math.PI, false);
            context.fill();
            if (this.pressed) {
                context.beginPath();
                context.fillStyle = '#000000';
                context.globalAlpha = 0.1;
                context.arc(
                    (this.x + this.vx) * ButtonOverlay.viewWidth / width,
                    (this.y + this.vy) * ButtonOverlay.viewHeight / height,
                    80 * ButtonOverlay.viewWidth / width, 0, 2 * Math.PI, false);
                context.fill();
            }
        }
    }

}
