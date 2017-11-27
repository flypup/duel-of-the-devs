import Entity from './Entity.js';

export default class PhysicsEntity extends Entity {

    constructor() {
        super();
        this.bodyPos = {x: 0, y: 0};
        this.bodyRot = {a: 0, x: 0, y: 0};
    }

    activate() {
    }

    deactivate() {
    }

    isStatic() {
        return true;
    }

    getBodyPos() {
        this.bodyPos.x = this.pos.x;
        this.bodyPos.y = -this.pos.y;
        return this.bodyPos;
    }

    getPos() {
        return this.pos;
    }

    setPos(x, y, z) {
        this.pos.x = x;
        this.pos.y = y;
        this.pos.z = z;
        return this;
    }

    setAngle(v) {
        if (v && (v.x || v.y)) {
            this.bodyRot.a = Math.atan2(-v.y, v.x);
            this.bodyRot.x = v.x;
            this.bodyRot.y = -v.y;
        } else if (!isNaN(v)) {
            this.bodyRot.a = v;
            this.bodyRot.x = Math.cos(v);
            this.bodyRot.y = -Math.sin(v);
        }
        return this;
    }

    getSortBounds() {
        const bounds = this.sortBounds;
        const radius = this.radius;
        bounds.bottom = this.z;
        bounds.top = this.z + this.depth;
        bounds.front = radius / 2 + this.pos.y;
        bounds.back = -radius / 2 + this.pos.y;
        bounds.left = -radius + this.pos.x;
        bounds.right = radius + this.pos.x;
        return bounds;
    }

}
