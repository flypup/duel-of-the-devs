import global from '../global';

const direction = { x: 0, y: 0 };

export default class Animation {

    constructor(track, actors, fps) {
        global.extend(this, track);

        this.actor = actors[this.element.name];
        this.sensor = false;

        this.fps = fps;

        this.complete = false;
        this.index = -1;
        this.tween = null;
        this.update = this.nextTween;

        if (global.debug > 1 && this.constructor === Animation) {
            Object.seal(this);
        }
    }

    idle() {}

    nextTween(time) {
        const keyframes = this.keyframes;

        // last keyframe
        const kindex = ++this.index;
        if (kindex >= keyframes.length) {
            if (this.tween && !this.tween.complete) {
                this.updateTween(this.tween.endTime);
            }
            this.update = this.idle;
            this.complete = true;
            return;
        }

        // get new tween
        const tween = this.tween = {};
        const fromFrame = keyframes[kindex];

        tween.index = kindex;
        tween.from = fromFrame;
        tween.startTime = this.calculateTime(fromFrame.start);
        tween.duration = this.calculateTime(fromFrame.duration);
        tween.endTime = this.calculateTime(fromFrame.start + fromFrame.duration);

        if (fromFrame.empty) {
            console.log('empty keyframe', this);
            tween.complete = true;
            this.actor.z = 10000;
            this.checkNext(time);
            return;
        }

        tween.complete = false;
        if (fromFrame.tween) {
            const toFrame = keyframes[kindex + 1];
            tween.to = toFrame;

            if (fromFrame.ease === 'inout') {
                tween.fn = this.easeInOutQuad;

            } else if (fromFrame.ease === 'in') {
                tween.fn = this.easeInQuad;

            } else if (fromFrame.ease === 'out') {
                tween.fn = this.easeOutQuad;

            } else {
                tween.fn = this.linearTween;
            }
        }

        this.updateTween(time);
    }

    updateTween(time) {
        if (this.checkNext(time)) {
            return;
        }

        const tween = this.tween;
        const from = tween.from;

        let x = from.x;
        let y = from.y;
        let z = from.z;

        if (from.tween) {
            const to = tween.to;
            const tweenTime = time - tween.startTime;
            x = tween.fn(tweenTime, x, to.x - x, tween.duration);
            y = tween.fn(tweenTime, y, to.y - y, tween.duration);
            if (tweenTime < 0 || tweenTime > tween.duration) {
                throw('Tween time is out of range of current keyframe');
            }
            if (this.element.type === 'Viewport') {
                // TODO: zoom (and maybe rotation?)
                this.actor.lookAt(x, y);
            } else {
                // TODO: map sorting and z adjustment
                if (z !== undefined) {
                    if (to.z !== undefined) {
                        z = tween.fn(tweenTime, from.z, to.z - from.z, tween.duration);
                    }
                    y += z;
                }
                const pos = this.actor.getPos();
                this.actor.setPos(x, y, z);
                // if (global.debug > 0) {
                //	console.log(this.actor.type, 'pos', x, y, z, this.actor.mapCollision);
                // }
                // entity angle (character rotation)
                direction.x = x - pos.x;
                direction.y = y - pos.y;
                this.actor.setAngle(direction, 0);

                // TODO: entity actions (or spritesheet frames?)
                this.actor.state = 'walking';
                if (direction.x || direction.y) {
                    const velocity = Math.sqrt(direction.x * direction.x + direction.y * direction.y) / 40000;
                    this.actor.walkCount += Math.max(0.15, velocity);
                }
            }
            this.update = this.updateTween;
        } else {
            //single frame, no tween
            if (this.element.type === 'Viewport') {
                this.actor.lookAt(x, y);
            } else {
                if (z !== undefined) {
                    y += z;
                }
                this.actor.setPos(x, y, z);

                // This is a hack to make sure map collisions are triggered
                this.actor.body.vy = 0.001;

                // TODO: custom action
                this.actor.state = 'standing';
                // if (global.debug > 0) {
                //	console.log(this.actor.type, 'pos', x, y, z, this.actor.mapCollision);
                // }
            }
            tween.complete = true;
            this.update = this.checkNext;
        }
    }

    checkNext(time) {
        // wait for next tween
        if (time > this.tween.endTime) {
            this.nextTween(time);
            return true;
        }
        this.update = this.checkNext;
        return false;
    }

    linearTween(t, b, c, d) {
        return c * t / d + b;
    }

    easeInQuad(t, b, c, d) {
        t /= d;
        return c * t * t + b;
    }

    easeOutQuad(t, b, c, d) {
        t /= d;
        return -c * t * (t - 2) + b;
    }

    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    calculateTime(value) {
        if (this.fps !== 1) {
            return value / this.fps;
        }
        return value;
    }

}
