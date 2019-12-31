import global from '../global';
import { traceTime, traceTimeEnd } from '../logging';

export default class TextField {

    constructor(context, x, y, width, height, fillStyle) {
        this.setContext(context);
        this.text = '';
        this.multiline = true;
        this.x = x || 0;
        this.y = y || 0;
        this.width = 0;
        this.height = 0;
        this.ratio = 1;

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.context.textAlign = 'start';
        this.context.textBaseline = 'top';
        this.context.font = '12px sans-serif';
        this.lineHeight = 14; // measure 'M'

        if (width || height) {
            this.setSize(width, height);
        }
        if (fillStyle) {
            this.setStyle(fillStyle);
        }
        if (global.debug > 1 && this.constructor === TextField) {
            Object.seal(this);
        }
    }

    setText(value) {
        if (this.text !== value) {
            this.text = value;
            this.redraw();
        }
        this.draw();
        return this;
    }
    
    setContext(context) {
        this.ctx = context;
        return this;
    }

    setSize(width, height) {
        this.width = width || 100;
        this.height = height || (this.lineHeight + 2);

        const ratio = this.ratio = global.pixelRatio || 1;
        this.canvas.width = this.width * ratio;
        this.canvas.height = this.height * ratio;
        this.context.scale(ratio, ratio);
        return this;
    }

    setStyle(value) {
        this.context.fillStyle = value || 'black';
        if (this.text) {
            this.redraw();
        }
        return this;
    }

    setMultiline(value) {
        this.multiline = value;
        if (this.text) {
            this.redraw();
        }
        return this;
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    redraw() {
        this.context.clearRect(0, 0, this.width, this.height);
        if (global.debug === 1) {
            traceTime('fillText TextField ' + this.text.length);
        }
        if (this.multiline) {
            const lines = this.text.split(/[\r\n]/);
            let y = this.lineHeight;
            for (let i = 0; i < lines.length; i++) {
                this.context.fillText(lines[i], 0, y, this.width);
                y += this.lineHeight;
            }
        } else {
            this.context.fillText(this.text, 0, 0, this.width);
        }
        if (global.debug === 1) {
            traceTimeEnd('fillText TextField ' + this.text.length);
        }
    }

    draw() {
        if (global.debug === 1) {
            traceTime('draw TextField canvas');
        }
        this.ctx.drawImage(this.canvas, this.x, this.y, this.width, this.height);
        if (global.debug === 1) {
            traceTimeEnd('draw TextField canvas');
        }
    }

}
