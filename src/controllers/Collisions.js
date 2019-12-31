import global from '../global';
import Dot from '../models/Dot';
import {
    MAP,
    MONSTER,
    PLAYER,
    PLAYER_HAND,
    PROJECTILE,
    PROP
} from '../constants/physics';

// PRIVATE Collision Handlers

// ENTITY-ENTITY

function entityCollision(arbiter/*, space*/) {
    const entityA = arbiter.swappedColl ? arbiter.body_b.userData.parent : arbiter.body_a.userData.parent;
    const entityB = arbiter.swappedColl ? arbiter.body_a.userData.parent : arbiter.body_b.userData.parent;
    // TESTS
    if (!(entityA && entityB)) {
        throw('entityCollision: undefined entity');
    }
    if (!(arbiter.contacts && arbiter.contacts.length)) {
        throw('entityCollision: no contacts');
    }


    // See collision points in world
    if (global.debug > 1) {
        const p = arbiter.contacts[0].p;
        const z = entityA.z + entityA.depth / 2;
        const dot = Dot.create(1000);
        dot.setPos(p.x, -p.y, z);
        //space.addPostStepCallback(function() {
        global.world.add(dot);
        //});
    }

    // if either returns true, contact is ignored
    const ignoreA = entityA.contact(entityB, arbiter);
    return entityB.contact(entityA, arbiter) || ignoreA;
}

// ENTITY-MAP

function mapBegin(arbiter) {
    const entityBody = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
    const mapBody = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
    const entity = entityBody.userData.parent;
    const mapElement = mapBody.userData.parent;
    if (global.debug > 0) {
        //console.log('mapBegin', entity.type, mapElement);
    }
    // Add Map Element to Entity's Checklist
    entity.addMapCollision(mapElement);

    return true;
}

function mapSeparate(arbiter) {
    const entityBody = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
    const mapBody = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
    const entity = entityBody.userData.parent;
    const mapElement = mapBody.userData.parent;
    if (global.debug > 0) {
        //console.log('mapSeparate', entity.type, mapElement);

        // don't separate if we're inside the object
        // TODO: has map element been removed?
        const mapShape = arbiter.swappedColl ? arbiter.a : arbiter.b;
        const info = mapShape.nearestPointQuery(entity.body.p);
        if (info.d < 0) {
            // this usually happens when separate is called after removing a shape from the space
            console.warn('mapSeparate while inside', entity.type, mapElement);
            return;
        }
    }

    // Remove Map Element from Entity's Checklist
    entity.removeMapCollision(mapElement);
}

// ENTITY OR MAP

function depthTest(arbiter) {
    //this one happens on every step and must be very efficient
    const bodyA = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
    const bodyB = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;
    return depthCollision(bodyA.userData.parent, bodyB.userData.parent);
}

function depthCollision(a, b) {
    //determine if entity is outside of collision z

    const aBounds = a.getSortBounds();
    //standing under
    if (aBounds.top < b.z) {
        return false;
    }
    const bBounds = b.getSortBounds();
    //standing over - fall
    if (a.z > bBounds.top) {
        return false;
    }
    //standing on
    //if ( a.z === bBounds.top) {
    if (a.z - bBounds.top > -2) { //with tolerance
        if (a.z < bBounds.top) {
            console.warn('corrected entity z in depth collision test', a.type, b.name);
            a.z = bBounds.top; //correction
        }
        return false;
    }

    if (global.debug > 0) {
        //console.log('depth Collision', a, b);
    }
    //collision
    return true;
}

/*function debugDepthTest(arbiter, space) {
 const bodyA = arbiter.swappedColl ? arbiter.body_b : arbiter.body_a;
 const bodyB = arbiter.swappedColl ? arbiter.body_a : arbiter.body_b;

 if (global.debug > 0) {
 if (bodyB.userData && bodyB.userData.parent && bodyB.userData.parent instanceof Player) {
 console.log('wawawaw', bodyB.userData.parent);
 }
 }

 //return depthCollision(bodyA.userData.parent, bodyB.userData.parent);
 const a = bodyA.userData.parent;
 const b = bodyB.userData.parent;

 const aBounds = a.getSortBounds();
 //standing under
 if ( aBounds.top < b.z ) {
 console.log('standing under', a, b);
 return false;
 }
 const bBounds = b.getSortBounds();
 //standing over - fall
 if ( a.z > bBounds.top) {
 console.log('standing over - fall', a, b);
 return false;
 }
 //standing on
 //if ( a.z === bBounds.top) {
 if ( a.z - bBounds.top > -2) { //with tolerance
 if (a.z < bBounds.top) {
 console.warn('corrected entity z in depth collision test', a.type, b.name);
 a.z = bBounds.top; //correction
 }
 console.log('standing on', a, b);
 return false;
 }

 if (global.debug > 0) {
 console.log('depth Collision', a, b);
 }
 //collision
 return true;
 }*/

export default class Collisions {

    constructor() {
        if (global.debug > 1 && this.constructor === Collisions) {
            Object.seal(this);
        }
    }

    init(space) {
        const _ = null;

        // Player Attacks
        space.addCollisionHandler(PLAYER_HAND, MONSTER, _, depthTest, entityCollision, _);
        space.addCollisionHandler(PLAYER_HAND, PROJECTILE, _, depthTest, entityCollision, _);

        // Entity to Entity
        space.addCollisionHandler(MONSTER, MONSTER, _, depthTest, entityCollision, _);
        //space.addCollisionHandler(MONSTER,	PLAYER,		_,	depthTest,			entityCollision,	_);

        // Projectile to Obstacle / Target
        space.addCollisionHandler(PROJECTILE, PROP, _, depthTest, entityCollision, _);
        space.addCollisionHandler(PROJECTILE, PLAYER, _, depthTest, entityCollision, _);

        // Entity to Map
        space.addCollisionHandler(PLAYER, MAP, mapBegin, depthTest, _, mapSeparate);
        space.addCollisionHandler(MONSTER, MAP, mapBegin, depthTest, _, mapSeparate);
        space.addCollisionHandler(PROJECTILE, MAP, mapBegin, depthTest, _, mapSeparate);

        space.addCollisionHandler(PLAYER_HAND, MAP, _, depthTest, _, _);
        space.addCollisionHandler(PROP, MONSTER, _, depthTest, _, _);
        space.addCollisionHandler(PROP, PLAYER, _, depthTest, _, _);
        space.addCollisionHandler(PROP, PLAYER_HAND, _, depthTest, _, _);
    }

    term() {

    }

}
