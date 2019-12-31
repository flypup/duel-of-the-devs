import global from '../global';
import Entity from './Entity';
import { PLAYER_HAND } from '../constants/physics';

const cp = window.cp;

export const PASSIVE = 0;
export const PUSHING = 1;
export const GRABBING = 2;
export const PULLING = 3;

export default class EmptyHand extends Entity {

    constructor(radius = 24, mass = 1) {
        super();
        this.assignCircleShape(radius, mass);

        this.shape.setElasticity(0.5);
        this.shape.setFriction(1);

        this.depth = 64;

        this.time = 0;
        this.phase = PASSIVE;

        this.pushDuration = 1000 * 5 / 60;
        this.grabDuration = 1000 * 10 / 60;
        this.punchDuration = this.pushDuration + this.grabDuration / 2;

        this.force = cp.v(0, 0);

        this.type = 'EmptyHand';

        if (global.debug > 1 && this.constructor === EmptyHand) {
            Object.seal(this);
        }
    }

    postStep(/*delta*/) {
        return this;
    }

    contact(/*entity, arbiter*/) {
        //console.log('CONTACT', arbiter.state, arbiter.contacts.length, this.type, entity.type);
        // ignore collision handlers?
        return false;
    }

    entityStep(delta, entity) {
        if (this.phase) {
            this.z = entity.z;
            this.time += delta;

            if (this.phase === PUSHING) {
                if (this.time < this.punchDuration) {
                    //punching
                    // TODO: check for early hit - GRAB/PUSH

                    this.force.x = entity.pushpull.x * entity.speed * delta;
                    this.force.y = -entity.pushpull.y * entity.speed * delta;

                    this.body.vx = entity.body.vx + this.force.x;
                    this.body.vy = entity.body.vy + this.force.y;

                } else if (entity.passive()) {
                    //done punching
                    entity.attackEnd();
                    //console.log('punch ended passively');

                } else if (this.time > this.pushDuration) {
                    this.phase = GRABBING;
                    //console.log('grabbing');
                }

            } else if (this.phase === GRABBING) {
                this.body.vx *= 0.9;
                this.body.vy *= 0.9;
                if (entity.passive()) {
                    //done punching
                    entity.attackEnd();
                    //console.log('grab ended passively');

                } else if (this.time > this.pushDuration + this.grabDuration) {
                    // TODO: did we grab anyone?
                    const grabbedTarget = false;
                    if (!grabbedTarget) {
                        //done punching
                        entity.attackEnd();
                        //console.log('grab ended empty handed');
                    } else {

                        // TODO: this.phase = PULLING;

                        // add constraints
                        //world.space.addConstraint(new cp.GrooveJoint(entity.body, this.body, v(40, 0), v(80 , 0), v(0,0)));
                    }
                }

            } else if (this.phase === PULLING) {
                // TODO: how long can we keep this up?

                if (entity.passive()) {
                    //done punching
                    entity.attackEnd();
                    console.log('pull ended passively');
                }

            }
        }
    }

    activate() {
        this.shape.collision_type = PLAYER_HAND;
    }

}

global.entities.EmptyHand = EmptyHand;
