import global from '../global';
import Animation from './Animation';

export default class Scene {

    constructor(data) {
        // TODO: clone data?
        this.data = data;
        this.mapName = data.map;
        this.fps = this.data.useFrames ? this.data.fps : 1;
        this.duration = this.calculateTime(data.duration);
        this.time = 0;
        this.complete = false;
        this.animations = null;
        //this.actors = null;

        if (global.debug > 1 && this.constructor === Scene) {
            Object.seal(this);
        }
    }

    init(actors) {
        //this.actors = actors;
        this.time = 0;
        this.complete = false;

        this.animations = [];
        const tracks = this.data.tracks;
        for (let i = 0; i < tracks.length; i++) {
            const animation = new Animation(tracks[i], actors, this.fps);
            this.animations.push(animation);
            //make shapes sensors so they don't collide with obstacles
            if (animation.actor.shape) {
                animation.sensor = animation.actor.shape.sensor;
                animation.actor.shape.sensor = true;
            }
        }
    }

    step(delta) {
        let i;
        let animation;
        delta /= 1000;
        this.time += delta;
        if (this.time > this.duration) {
            this.time = this.duration;
            this.complete = true;
            //reset shapes
            for (i = 0; i < this.animations.length; i++) {
                animation = this.animations[i];
                if (animation.actor.shape) {
                    animation.actor.shape.sensor = animation.sensor;
                    //animation.actor.body.activate();
                }
            }
        }

        for (i = 0; i < this.animations.length; i++) {
            animation = this.animations[i];
            animation.update(this.time);
        }
    }

    skip() {
        this.time = this.duration;
        this.step(0);
    }

    calculateTime(value) {
        if (this.data.useFrames) {
            return value / this.fps;
        }
        return value;
    }

}
