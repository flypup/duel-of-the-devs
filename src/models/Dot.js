import global from '../global.js';
import PhysicsEntity from './PhysicsEntity.js';

const RADIUS = 10;

export default class Dot extends PhysicsEntity {

    constructor(params) {
        super();
        // this.setBaseProperties();
        this.type = 'Dot';

        this.depth = RADIUS * 2;
        this.radius = RADIUS;
        this.alpha = 1.0;

        this.term = function() {};
        this.init.apply(this, params);

        if (global.debug > 1 && this.constructor === Dot) {
            Object.seal(this);
        }
    }

    init(duration, fillStyle) {
        this.time =
        this.duration = duration || 500;
        this.fillStyle = fillStyle || '#ff0800';//'rgba(255, 8, 0, 1.0)';
        // this.fillStyleSplit = this.fillStyle.split(',');
        // if (this.fillStyleSplit.length === 0) {
        // 	this.fillStyleSplit = null;
        // }
    }

    step(delta) {
        this.time -= delta;
        if (this.time <= 0) {
            global.world.remove(this);
            this.term();
        } else {
            this.alpha = this.time / this.duration;
            // if (this.fillStyleSplit.length === 4) {
            // 	this.fillStyleSplit[3] = this.alpha.toFixed(2) +')';
            // 	this.fillStyle = this.fillStyleSplit.join(',');
            // }
        }
    }

    postStep() {
    }

    postStepScene() {
    }

}

global.entities.Dot = Dot;

global.addPool(Dot);
