import global from '../global';

export default class Canvas2dView {

    constructor() {
        this.children = [];

        const canvas = this.canvas = window.document.createElement('canvas');
        canvas.style.position = 'absolute';

        if (/Firefox\//.test(navigator.userAgent)) {
            canvas.setAttribute('moz-opaque', true);
        }

        this.context = canvas.getContext('2d');

        this.resize(global.width, global.height, global.pixelRatio);

        window.document.body.appendChild(this.canvas);

        if (global.debug > 1 && this.constructor === Canvas2dView) {
            Object.seal(this);
        }
    }

    draw(delta) {
        const context = this.context;

        const children = this.children;
        for (let i = 0, len = children.length; i < len; i++) {
            children[i].draw(context, delta);
        }
    }

    pause() {

    }

    resume() {

    }

    getDom() {
        return this.canvas;
    }

    add(child) {
        if (this.children.indexOf(child) < 0) {
            child.resize(this.width, this.height, this.pixelRatio);
            this.children.push(child);
            return child;
        }
        console.error('object already a child of world', child);
        return null;
    }

    remove(child) {
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
            return child;
        }
        console.error('object not a child of world', child);
        return null;
    }

    removeAll() {
        this.children.length = 0;
    }

    resize(width, height, ratio) {
        const canvas = this.canvas;
        this.width = width;
        this.height = height;
        this.pixelRatio = ratio;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = this.width + 'px';
        canvas.style.height = this.height + 'px';

        const children = this.children;
        for (let i = 0, len = children.length; i < len; i++) {
            children[i].resize(width, height, ratio);
        }
    }

    debugGui(debugView) {
        const view = this;
        const resize = function () {
            const pixelRatio = global.pixelRatio;
            global.resizeDisplay();
            global.pixelRatio = pixelRatio;
            view.resize(global.width, global.height, pixelRatio);
        };
        debugView.addGui([
            {
                name: 'view',
                remember: true,
                target: view[0], //worldView
                props: [
                    { name: 'x', params: { min: -480, max: 1600 }}, //lookAt()
                    { name: 'y', params: { min: -320, max: 1600 }}, //lookAt()
                    {
                        name: 'zoom',
                        onChange(value) {
                            view.zoom(value);
                        },
                        params: { step: 0.01, min: 0.25, max: 4 }
                    }
                ]
            },
            {
                name: 'pixelRatio',
                target: global,
                props: [
                    {
                        name: 'pixelRatio',
                        params: {min: 1, max: 2, step: 0.5 },
                        onChange: resize
                    }
                ]
            }
        ]);
    }
}
