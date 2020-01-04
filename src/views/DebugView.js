import global from '../global';
import { TIME_STEP } from '../constants/physics';

const Stats = window.Stats;

export default class DebugView {

    constructor() {
        const stats = this.stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        //window.document.body.appendChild( stats.domElement );

        if (global.debug > 1 && this.constructor === DebugView) {
            Object.seal(this);
        }
    }

    begin() {
        this.stats.begin();
    }

    end() {
        this.stats.end();
    }

    show() {
        this.stats.domElement.style.display = 'block';
        window.document.body.appendChild(this.stats.domElement);
    }

    hide() {
        this.stats.domElement.style.display = 'none';
        if (this.stats.domElement.parentNode) {
            window.document.body.removeChild(this.stats.domElement);
        }
    }

    addGui(settings) {
        const gui = new dat.GUI();
        let folder = gui;
        for (let i = 0; i < settings.length; i++) {
            const object = settings[i];
            if (object.remember) {
                gui.remember(object.target);
            }
            if (object.name) {
                folder = gui.addFolder(object.name);
                folder.open();
            }
            for (let j = 0; j < object.props.length; j++) {
                const prop = object.props[j];
                let name = prop;
                let params = null;
                var controller;
                if (prop.name) {
                    params = prop.params;
                    name = prop.name;
                }
                if (params) {
                    if (params.min !== undefined && params.max !== undefined) {
                        controller = folder.add(object.target, name, params.min, params.max, params.step);
                    } else if (params.step) {
                        controller = folder.add(object.target, name).step(params.step);
                    }
                } else {
                    controller = folder.add(object.target, name, params);
                }
                if (prop.listen) {
                    controller.listen();
                }
                if (prop.onChange) {
                    controller.onChange(prop.onChange);
                }
            }
        }
        return gui;
    }

    worldGui(world) {
        this.addGui([
            {
                name: 'space',
                remember: true,
                target: world.space,
                props: [
                    { name: 'iterations', params: { min: 1, max: 40 }},
                    { name: 'sleepTimeThreshold', params: { step: TIME_STEP, min: TIME_STEP, max: 1 }},
                    { name: 'collisionSlop', params: { step: 0.1, min: 0.1, max: 1 }},
                    'damping',
                    { name: 'idleSpeedThreshold', listen: true, params: { min: 0, max: 50 }},
                    { name: 'collisionBias' },
                    'enableContactGraph'
                ]
            }
        ]);
        this.addGui([
            {
                name: 'gravity',
                target: world.space.gravity,
                props: [
                    { name: 'x', params: { step: 10, min: -1000, max: 1000 }},
                    { name: 'y', params: { step: 10, min: -1000, max: 1000 }}
                ]
            }
        ]);
    }

}
