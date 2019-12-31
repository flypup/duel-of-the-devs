import global from '../global';
import Dot from './Dot';

const RADIUS = 50;

export default class Puff extends Dot {

    constructor(params) {
        super();
        this.type = 'Puff';

        this.depth = RADIUS * 2;
        this.radius = RADIUS;

        this.term = function() {};
        this.init.apply(this, params);

        if (global.debug > 1 && this.constructor === Puff) {
            Object.seal(this);
        }
    }

    init(duration) {
        this.time =
        this.duration = duration || 500;
    }

    step(delta) {
        this.time -= delta;
        if (this.time <= 0) {
            this.time = 0;
            global.world.remove(this);
            this.term();
        }
    }

    update(entity) {
        if (this.time > 0) {
            this.track(entity);
        }
    }

    track(entity) {
        const pos = entity.getPos();
        this.setPos(pos.x, pos.y + 1, pos.z + 1);
        //this.setVelocity(entity.body.vx, entity.body.vy, 0);
    }

}

global.entities.Puff = Puff;

global.addPool(Puff);
