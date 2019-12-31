import global from '../global';
import Entity from './Entity';
import { PROP } from '../constants/physics';

export default class Box extends Entity {

    constructor(mass = 1, width = 64, height = 64) {
        super();

        this.assignBoxShape(width, height, mass);

        this.shape.setElasticity(0);
        this.shape.setFriction(0.6);

        this.shape.collision_type = PROP;

        this.type = 'Box';

        if (global.debug > 1 && this.constructor === Box) {
            Object.seal(this);
        }
    }

    activate() {
        this.shape.collision_type = PROP;
    }

}

global.entities.Box = Box;
