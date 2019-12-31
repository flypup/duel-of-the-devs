import global from '../global';
import { hungarianAlgortithm } from './Hungarian';

const cp = window.cp;
const v = cp.v;

export default class Formations {

    constructor() {
        this.positions = [];
        //this.radialMove = 0;
        if (global.debug > 1 && this.constructor === Formations) {
            Object.seal(this);
        }
    }

    // FORMATIONS

    lineupPositions(headPos, targetPos, length, spacing = 96, minDistance = 128) {
        let vector = v.sub(headPos, targetPos);
        const distance = v.len(vector);
        if (distance === 0) {
            vector.x = 0;
            vector.y = minDistance;
        } else if (distance < minDistance) {
            vector = v.normalize(vector).mult(minDistance);
        }

        const pos = v.mult(vector, 0.5);
        const perp = v.normalize(v.perp(vector)).mult(spacing);
        pos.sub(v.mult(perp, (length - 1) / 2));

        const angle = Math.atan2(-vector.y, vector.x) + Math.PI;

        const positions = this.getFormationVectors(length);
        const angles = [];
        for (let i = 0; i < length; i++) {
            positions[i].x = pos.x;
            positions[i].y = pos.y;
            angles[i] = angle;

            pos.add(perp);
        }
        return {
            positions: positions,
            angles: angles
        };
    }

    circlePositions(headPos, targetPos, length, radius) {
        //radius = Math.max(v.len(v.sub(headPos, targetPos)), radius);
        const pi = Math.PI;
        const pi2 = 2 * pi;
        //var circumference = pi2 * radius;
        //this.radialMove += 20 / circumference;

        const positions = this.getFormationVectors(length);
        const angles = [];
        for (let i = 0; i < length; i++) {
            const radian = pi2 * i / length;
            //radian += this.radialMove;
            const pos = v.forangle(radian).mult(radius);
            positions[i].x = pos.x;
            positions[i].y = pos.y;
            angles[i] = Math.atan2(-pos.y, pos.x) + pi;
        }
        return {
            positions: positions,
            angles: angles
        };
    }

    // UNIT FORMATION ASSIGNMENT

    updateUnitsHungarian(entities, positions, length) {
        // TODO: all we need here is the positions of the entities
        // TODO: if we passed 'length' arg, we can avoid slicing these arrays
        length = length || positions.length;
        positions = positions.slice(0, length);
        entities = entities.slice(0, length);
        return hungarianAlgortithm(positions, entities);
    }

    // FORMATION UTILS

    getFormationVectors(length) {
        for (let i = 0; i < length; i++) {
            this.positions[i] = this.positions[i] || v(0, 0);
        }
        return this.positions;
    }

    newFormationVectors() {
        this.positions = [];
    }

}
