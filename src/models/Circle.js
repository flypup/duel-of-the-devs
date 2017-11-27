import global from '../global.js';
import Entity from './Entity.js';
import { PROP } from '../controllers/Collisions.js';

export default class Circle extends Entity {

    constructor(mass = 1, radius = 32, height = 0) {
        super();

        if (height && radius) {
            // width was pased in the place of radius
            radius = radius / 2;
        }

        this.assignCircleShape(radius, mass);

        this.shape.setElasticity(0);
        this.shape.setFriction(0.6);

        this.type = 'Circle';

        if (global.debug > 1 && this.constructor === Circle) {
            Object.seal(this);
        }
    }

    activate() {
        this.shape.collision_type = PROP;
    }

}

global.entities.Circle = Circle;
