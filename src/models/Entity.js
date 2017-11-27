import global from '../global.js';
import { NULL } from '../controllers/Collisions.js';
import TextField from '../views/TextField.js';

const cp = window.cp;
const v = cp.v;

function assertSoft(value, message) {
    if (!value) {
        console.warn('Assertion failed: ' + message);
    }
    return value;
}

const labelPool_ = [];
let groupId_ = 1;

export default class Entity {

    static get groupId() {
        return groupId_;
    }

    static set groupId(value) {
        groupId_ = value;
    }

    static get labelPool() {
        return labelPool_;
    }

    static getLabel(context, fieldHeight) {
        let label = this.labelPool.pop();
        if (!label) {
            label = new TextField(context, 0, 0);
        } else {
            label.setContext(context);
        }
        return label.setSize(160, fieldHeight).setStyle('#0ff');
    }

    constructor() {
        this.type = 'Entity';
        this.isEntity = true;
        this.hasShadow = false;
        //position
        this.pos = { x: 0.0, y: 0.0, z: 0.0 };
        this.groundZ = 0.0;
        this.z = 0.0;
        this.velZ = 0.0;
        this.width = 0;
        this.height = 0;
        this.radius = 0;
        this.depth = 32.0;
        //physics
        this.shape = null;
        this.body = null;
        this.groupId = cp.NO_GROUP;
        //map layering and sprite sorting
        this.sortBounds = {top: 0, bottom: 0, front: 0, back: 0, left: 0, right: 0};
        this.mapCollision = [];
        this.maxCollisionTopZ = 0.0;
        this.layerNum = -1;
        this.layerName = '';
        // debug
        this.label = null;
        this.sortReason = null;
        // character specific
        this.input = null;
        this.climbHeight = 128.0;
        this.attack = null;
        this.fx = null;
        this.hitTime = 0.0;
        this.hitPoints = 0;
        this.hitDuration = 0.0;
        this.decomposed = 0.0;

        if (global.debug > 1 && this.constructor === Entity) {
            Object.seal(this);
        }
    }


    removed() {
        this.mapCollision.length = 0;
    }

    term() {
        this.shape = null;
        if (this.body) {
            if (this.body.userData) {
                this.body.userData.parent = null;
                this.body.userData = null;
            }
            this.body = null;
        }
        this.pos = null;
        this.sortBounds = null;
        //
        this.input = null;
        this.mapCollision = null;
        if (this.label) {
            Entity.labelPool.push(this.label);
            this.label = null;
        }
    }

    setView(view) {
        this.view = view;
        return this;
    }

    setInput(input) {
        this.input = input;
        return this;
    }

    step(/*delta*/) {
        return this;
    }

    postStep(delta) {
        this.groundZ = this.z;
        if (this.isStatic()) {
            return this;
        }

        // TODO: some things regarding entity z movement need to be worked out
        var distance;
        var gravity = -10;
        var damping = 1;
        var friction = 0;
        var thisEntitylimbSpeed = 5;

        // get floor. target z = floor z
        // no floor? target z = 0
        var climbHeight = this.climbHeight;
        if (this.state !== 'walking') {
            climbHeight = 0;//*= 0.2;
        }
        var targetZ = this.getTargetZ(climbHeight);

        distance = targetZ - this.z;
        if (distance > 0) {
            // TODO: update state and modify velX,velY when climbing or falling
            // climbing
            if (distance <= climbHeight) {
                //this.state = 'climbing';
                this.groundZ = this.z; // TODO: get next lowest floor
                //this.z = targetZ; // TODO: climb animation
                //this.velZ = 5;
                this.velZ = this.velZ * damping + (thisEntitylimbSpeed + friction * this.body.m_inv) * delta / 100;
                if (this.velZ < 0) {
                    this.velZ = 0;
                }
                this.z = Math.min(targetZ, this.z + this.velZ);
            }
        } else if (distance < 0) {
            // falling
            //this.state = 'falling';
            this.velZ = this.velZ * damping + (gravity + friction * this.body.m_inv) * delta / 100;
            this.z = Math.max(targetZ, this.z + this.velZ);
            this.groundZ = targetZ;
        } else {
            this.velZ = 0;
        }

        // check if movement is being restricted
        if (this.mapCollision.length > 0) {
            if (this.maxCollisionTopZ > targetZ) {
                this.hitMapWall();
            }
        }

        return this;
    }

    hitMapWall() {
        if (this.input) {
            this.input.mapCollision(this);
        }
    }

    postStepScene(/*delta*/) {
        this.groundZ = this.z;
        if (this.isStatic()) {
            return this;
        }

        var distance;
        var thisEntityCanClimb = 32;

        // get floor. target z = floor z
        // no floor? target z = 0
        var targetZ = this.getTargetZ(thisEntityCanClimb);

        distance = targetZ - this.z;
        if (distance >= thisEntityCanClimb) {
            // climbing
            if (distance <= 0) {
                this.groundZ = targetZ;//this.z; // TODO: get next lowest floor
            }
        } else if (distance < 0) {
            // falling
            this.groundZ = targetZ;
        }

        return this;
    }

    getTargetZ(climbHeight) {
        climbHeight = climbHeight || this.climbHeight;
        var targetZ = 0;
        this.maxCollisionTopZ = 0;
        for (var i = 0, len = this.mapCollision.length; i < len; i++) {
            var element = this.mapCollision[i];
            var top = element.getTop(this.body.p.x, -this.body.p.y);
            if (top > targetZ && (top - this.z) <= climbHeight) {
                targetZ = top;
            }
            this.maxCollisionTopZ = Math.max(this.maxCollisionTopZ, top);
        }
        return targetZ;
    }

    addMapCollision(mapElement) {
        if (this.mapCollision.indexOf(mapElement) < 0) {
            this.mapCollision.push(mapElement);
        }
    }

    removeMapCollision(mapElement) {
        var index = this.mapCollision.indexOf(mapElement);
        if (index > -1) {
            this.mapCollision.splice(index, 1);
        }
    }

    contact(/*entity, arbiter*/) {
        //console.log('CONTACT', arbiter.state, arbiter.contacts.length, this.type, entity.type);
        // ignore collision handlers?
        return false;
    }

    getSortBounds() {
        var bounds = this.sortBounds;
        var radius = this.radius;
        bounds.bottom = this.z;
        bounds.top = this.z + this.depth;
        bounds.front = radius / 2 - this.body.p.y;
        bounds.back = -radius / 2 - this.body.p.y;
        bounds.left = -radius + this.body.p.x;
        bounds.right = radius + this.body.p.x;

        //test bounds:
        if (global.debug > 0) {
            var dimension = bounds.right - bounds.left;
            if (!assertSoft(dimension > 0, this + ' bounds width ' + dimension)) {
                throw('bounds width should be greater than 0');
            }
            dimension = bounds.front - bounds.back;
            if (!assertSoft(dimension > 0, this + ' bounds height ' + dimension)) {
                if (dimension < 0) {
                    throw('bounds height cannot be a negative number');
                }
            }
            dimension = bounds.top - bounds.bottom;
            if (!assertSoft(dimension > 0, this + ' bounds depth ' + dimension)) {
                if (dimension < 0) {
                    throw('bounds depth cannot be a negative number');
                }
            }
        }
        return bounds;
    }

    // Physics

    activate() {
        console.warn('Entity subclass must implement it\'s own activate method.');
        this.shape.collision_type = NULL;
    }

    deactivate() {
        this.shape.collision_type = NULL;
    }

    isStatic() {
        return this.body.isStatic();
    }

    getBodyPos() {
        return this.body.p;
    }

    getPos() {
        this.pos.x = this.body.p.x;
        this.pos.y = -this.body.p.y;
        this.pos.z = this.z;
        return this.pos;
    }

    setPos(x, y, z) {
        var body = this.body;
        if (z !== undefined) {
            this.z = body.z = z;
        }
        body.activate();
        body.p.x = x;
        body.p.y = -y;

        // if (global.debug > 0) {
        //	console.log(this.type, 'pos', x, y, z, this.mapCollision);
        // }
        // if (this.isStatic()) {
        // 	//space.reindexShapesForBody(body);
        // 	for(var i = 0; i < body.shapeList.length; i++){
        // 		var shape = body.shapeList[i];
        // 		shape.update(body.p, body.rot);
        // 		if (shape.space) {
        // 			shape.space.staticShapes.reindexObject(shape, shape.hashid);
        // 		}
        // 	}
        // }
        return this;
    }

    setAngle(v, w) {
        var body = this.body;
        if (w !== undefined) {
            body.w = w;
        }
        if (v && (v.x || v.y)) {
            //body.setAngle(Math.atan2(-v.y, v.x))
            body.a = Math.atan2(-v.y, v.x);
            body.rot.x = v.x;
            body.rot.y = -v.y;
        } else if (!isNaN(v)) {
            body.a = v;
            body.rot.x = Math.cos(v);
            body.rot.y = -Math.sin(v);
        }
        return this;
    }

    setVelocity(vx, vy, vz) {
        var body = this.body;
        body.vx = vx;
        body.vy = vy;
        if (vz !== undefined) {
            this.velZ = vz;
        }
        return this;
    }

    resetForces() {
        var body = this.body;
        //body.resetForces();
        body.f.x = 0;
        body.f.y = 0;
        body.t = 0;
    }

    getBody(mass, moment) {
        // to create a static body specify a mass of zero
        var body = this.body;
        if (!body) {
            if (mass === 0) {
                // same as world create static body
                body = new cp.Body(Infinity, Infinity);
                body.nodeIdleTime = Infinity;
            } else {
                body = new cp.Body(mass, moment);
            }
        }
        // if (global.debug > 1) {
        //	Object.seal(body);
        // }
        return body;
    }

    assignCircleShape(radius, mass, moment) {
        moment = moment || cp.momentForCircle(mass, 0, radius, v(0, 0));//cp.vzero);
        this.radius = radius;
        this.width = radius * 2;
        this.height = radius * 2;
        const body = this.getBody(mass, moment);
        this.setBody(body);
        this.shape = new cp.CircleShape(body, radius, v(0, 0));
        //this.shape.setLayers(GRABABLE_MASK);
        return this;
    }

    assignBoxShape(width, height, mass, moment) {
        moment = moment || cp.momentForBox(mass, width, height);
        this.width = width;
        this.height = height;
        this.radius = (width + height) / 4;
        const body = this.getBody(mass, moment);
        this.setBody(body);
        this.shape = new cp.BoxShape(body, width, height);
        return this;
    }

    setBody(body) {
        this.body = body;
        body.userData = {
            parent: this
        };
    }

}
