import global from '../global.js';
import Entity from './Entity.js';
import EmptyHand, { PASSIVE, PULLING } from './EmptyHand.js';
import Projectile from './Projectile.js';
import Puff from './Puff.js';
import { MONSTER } from '../controllers/Collisions';
import ShadowCloneInput from '../controllers/ShadowCloneInput';

const cp = window.cp;
const v = cp.v;
const abs = Math.abs;

const direction = v(0, 0);
const intent = v(0, 0);

export default class Ninja extends Entity {

    constructor(settings) {
        super();
        this.groupId = Entity.groupId++;

        var radius = 32;
        var mass = 5;
        this.assignCircleShape(radius, mass);

        this.shape.setElasticity(0);
        this.shape.setFriction(0);

        // TODO: better states!
        this.shape.group = this.groupId;
        this.state = 'standing';
        this.walkCount = 0;
        this.attack = new EmptyHand(radius - 4, 1);
        this.type = 'Ninja';
        this.depth = 118;
        this.hasShadow = true;

        this.isShadowClone = false;
        this.shadowClones = null;
        this.master = null;
        this.fx = null;

        this.speed = 28;
        this.hitPoints = 100;

        if (settings) {
            global.copy(this, settings);
        }

        if (global.debug > 1 && this.constructor === Ninja) {
            Object.seal(this);
        }
    }

    removed() {
        this.mapCollision.length = 0;
        if (this.shadowClones) { //maybe keep these
            this.shadowClones.length = 0;
        }
        if (this.master) {
            // TODO: tell em to remove from shadowClones
        }
    }

    term() {
        super.term();
        this.attack = null;
        this.shadowClones = null;
        this.master = null;
        this.fx = null;
    }

    shadowClone() {
        if (this.isShadowClone) {
            console.error('shadow clone tried to clone itself!');
            return;
        }
        // use ShadowClone class and prototype or something cool to inherit stuff
        var pos = this.getPos();
        var shadowClone = new Ninja().setPos(pos.x, pos.y, pos.z).setInput(new ShadowCloneInput());
        shadowClone.isShadowClone = true;
        shadowClone.master = this;
        if (!this.shadowClones) {
            this.shadowClones = [];
        }
        this.shadowClones.push(shadowClone);
        global.world.add(shadowClone);
        this.puffSmoke();
        shadowClone.puffSmoke();
    }

    getClones() {
        // get number of shadow clones, clear 'dead' clone refs
        var shadowClones = this.shadowClones;
        if (!shadowClones) {
            shadowClones = this.shadowClones = [];
        }
        for (var i = shadowClones.length; i-- > 0;) {
            // TODO: check if they've been removed
            if (shadowClones[i].state === 'dead') {
                shadowClones.splice(i, 1);
            }
        }
        return shadowClones;
    }

    puffSmoke() {
        const puff = Puff.create();
        global.world.add(puff);
        this.fx = puff;
        this.fx.track(this);
    }

    throwStar() {
        if (this.state !== 'hit' && this.state !== 'dead') {
            var pos = this.getPos();
            var angle = this.body.a;
            var velocity = 800;
            var angleVelocity = 30;

            var throwingStar = new Projectile()
                .setPos(pos.x, pos.y, pos.z + 64)
                .setAngle(angle, angleVelocity)
                .setVelocity(Math.cos(angle) * velocity, Math.sin(angle) * velocity, 0);
            throwingStar.shape.group = this.groupId;
            global.world.add(throwingStar);
            //this.state = 'throwing'; // can be walking or standing
        }
    }

    contact(entity, arbiter) {
        //console.log('CONTACT', arbiter.state, arbiter.contacts.length, this.type, entity.type);

        // ignore if already hit
        if (this.hitTime) {
            return true;
        }

        // NINJA <-> NINJA
        if (entity.type === this.type || entity.type === 'Player') {//+ Collisions.BODY (PLAYER or MONSTER)
            // TODO: Should this impact push me back?
            if (entity.hitTime && !this.hitTime) {
                return this.hit(arbiter);
            }
            //ignore this collision
            arbiter.ignore();
            return true;
        }

        // HIT
        return this.hit(arbiter);
    }

    hit(arbiter) {
        var energy = (arbiter && arbiter.totalKE()) || 1000;
        //console.log('HIT', this, 'KE', energy);
        if (energy > 0 && this.state !== 'hit' && this.state !== 'dead') {
            //ignore this collisions
            if (arbiter) {
                arbiter.ignore();
            }

            var damage = 10; // TODO: relative damage

            this.state = 'hit';
            if (this.isShadowClone) {
                //hit a clone
                this.hitTime = 400;
                this.hitPoints = damage ? 0 : this.hitPoints;
            } else {
                //hit ninja
                this.hitPoints -= damage;
                this.hitTime = 600;
            }
            this.input.completeTask();
            this.hitDuration = this.hitTime;
            // apply impulse
            this.body.w = energy / 10000;
            this.body.vx *= 2;
            this.body.vy *= 2;
            return true;
        }
        return false;
    }

    updateFx(/* delta */) {
        if (this.fx) {
            if (this.fx.time > 0) {
                this.fx.update(this);
            } else {
                this.fx = null;
            }
        }
    }

    step(delta) {
        if (this.hitTime > 0) {
            if (this.isShadowClone && this.hitTime === this.hitDuration && this.hitPoints === 0) {
                this.puffSmoke();
            }
            this.hitTime -= delta;
            //hit animation
            if (this.hitTime <= 0) {
                this.hitTime = 0;
                if (this.hitPoints <= 0) {
                    this.state = 'dead';
                    if (this.isShadowClone) {
                        global.world.remove(this);
                        this.term();
                    }
                } else {
                    this.state = 'standing'; //getting up
                }
            }
            this.updateFx();
            return this;

        } else if (this.isShadowClone && this.master.hitPoints <= 0) {
            // HP 0 event for master
            this.puffSmoke();
            this.hit(null);

        } else if (this.state === 'dead') {
            this.body.vx = 0;
            this.body.vy = 0;
            this.body.w *= 0.5;
            this.updateFx();
            return this;
        }

        this.input.poll(this, delta);

        this.resetForces();

        if (this.attack.phase === PASSIVE || this.attack.phase === PULLING) {
            direction.x = this.input.axes[0];
            direction.y = this.input.axes[1];
            if (abs(direction.x) > 0.1 || abs(direction.y) > 0.1) {
                if (abs(direction.x) > 0.7 || abs(direction.y) > 0.7) {
                    // normalize the vector
                    direction.mult(1 / v.len(direction));
                }

                this.state = 'walking';

                // console.log(this.input.axes, direction.x, direction.y);
                // console.log('v', this.body.vx, this.body.vy);

                direction.mult(this.speed * delta);
                this.body.activate();
                this.body.vx += direction.x;
                this.body.vy -= direction.y;
                this.body.vx *= 0.5;
                this.body.vy *= 0.5;
                //this.body.applyForce(direction, cp.vzero);
                // direction.mult(this.speed);
                // this.body.applyImpulse(direction, cp.vzero);

                if (delta) {
                    var velocity = Math.sqrt(this.body.vx * this.body.vx + this.body.vy * this.body.vy) * delta / 36000;
                    this.walkCount += Math.max(0.15, velocity);
                }

                // TODO: tween angular motion
                this.setAngle(direction, 0);

            } else {
                this.state = 'standing';

                this.body.vx = 0;
                this.body.vy = 0;
                this.body.w *= 0.99;
                // if(!this.body.isSleeping() && this.body.space) {
                //	this.body.space.deactivateBody(this.body);
                // }
            }
        }
        intent.x = this.input.axes[2];
        intent.y = -this.input.axes[3];
        if (abs(intent.x) > 0.1 || abs(intent.y) > 0.1) {
            //if (abs(intent.x) > 0.7 || abs(intent.y) > 0.7) {
            // normalize the vector
            intent.mult(1 / v.len(intent));
            //}

            //this.punch(global.world.time, global.world, delta);
        } else {
            intent.x = 0;
            intent.y = 0;
        }

        this.updateFx();
        return this;
    }

    activate() {
        this.shape.collision_type = MONSTER;
    }

}

global.entities.Ninja = Ninja;
