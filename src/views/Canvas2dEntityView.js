import global from '../global';
import { traceTime, traceTimeEnd } from '../logging';
import SpriteSheets from './SpriteSheets';
import Images from '../controllers/Images';
import Entity from '../models/Entity';

const pi = Math.PI;
const floor = Math.floor;
const dotFrames = {};

export default class Canvas2dEntityView {

    constructor() {
        // TODO: create one class-type & instance per entity instance or type with spritesheet(s)
        if (global.debug > 1 && this.constructor === Canvas2dEntityView) {
            Object.seal(this);
        }
    }

    draw(context, entity, viewport, delta) {
        if (entity.hasShadow) {
            this.drawShadow(context, entity, viewport);
        }
        this.drawEntity(context, entity, viewport, delta);
    }

    drawShadow(context, entity, viewport) {
        let o;
        if (entity.radius < 20) {
            o = SpriteSheets.shadowSmall.getFrame(0);
        } else {
            o = SpriteSheets.shadow.getFrame(0);
        }
        if (o) {
            const pos = entity.getPos();
            const x = pos.x;
            const y = pos.y - entity.groundZ;
            const rect = o.rect;
            if (intersects(rect, viewport, x - o.regX, y - o.regY)) {
                if (global.debug === 1) {
                    traceTime('drawImage shadow ' + o.image.src);
                }
                const drawable = Images.getCached(o.image);
                // TODO: draw shadow accoring to entity frame
                context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x - o.regX, y - o.regY, rect.width, rect.height);
                if (global.debug === 1) {
                    traceTimeEnd('drawImage shadow ' + o.image.src);
                }
            }
        }
    }

    drawNinja(context, entity, viewport) {
        // SOUND //
        if (entity.state === 'hit') {
            if (entity.hitTime === entity.hitDuration) {
                global.sound.playSound(global.sound.sounds.hits, '*');
            }
        }

        const frame = entityFrame(entity, SpriteSheets.ninja.body);
        const pos = entity.getPos();

        this.drawBodyAndHead(context, viewport, SpriteSheets.ninja, frame, pos);
        if (global.debug > 1) {
            this.drawEntityDebug(context, entity);
        }
    }

    drawPuff(context, entity, viewport) {
        const animation = SpriteSheets.ninja.body.getAnimation('puff');
        if (animation) {
            const frame = animation.frames[0] + floor(4.9 * (entity.duration - entity.time) / entity.duration);
            const o = SpriteSheets.ninja.body.getFrame(frame);
            const pos = entity.getPos();
            this.drawSprite(context, o, pos.x, pos.y - pos.z, viewport);
        }
        return null;
    }

    drawProjectile(context, entity, viewport, delta) {
        // SOUND //
        if (entity.lifetime === 0) {
            global.sound.playSound(global.sound.sounds.stars, '*');
        }
        entity.lifetime += delta;

        const frames = SpriteSheets.throwingStar.getNumFrames();
        const frame = floor(entity.body.a * frames / pi) % frames;
        const o = SpriteSheets.throwingStar.getFrame(frame);
        const pos = entity.getPos();
        this.drawSprite(context, o, pos.x, pos.y - pos.z, viewport);
    }

    drawPlayer(context, entity, viewport) {
        // SOUND //
        if (entity.state === 'walking') {
            if (entity.walkCount >= entity.nextStep) {
                entity.nextStep += 2;
                global.sound.playSound(global.sound.sounds.steps, '*');
            }
        } else if (entity.state === 'standing') {
            if (entity.nextStep !== 0) {
                entity.nextStep = 0;
                global.sound.playSound(global.sound.sounds.steps, '*');
            }
        } else if (entity.state === 'punching') {
            if (entity.attack.time === 0) {
                // entity.attack.pushDuration;
                global.sound.playSound(global.sound.sounds.strikes, '*');
                entity.nextStep = 1;
            }
        }

        const frame = entityFrame(entity, SpriteSheets.monk.body);
        const pos = entity.getPos();

        if (entity === global.player) {
            this.drawBodyAndHead(context, viewport, SpriteSheets.monk, frame, pos);
        } else {
            this.drawBodyAndHead(context, viewport, SpriteSheets.monk2, frame, pos);
        }

        if (global.debug > 1) {
            this.drawEntityDebug(context, entity);
        }
    }

    drawBodyAndHead(context, viewport, spriteSheet, frame, pos) {
        let headFrame, headData, headIndex = 0;
        if (frame < spriteSheet.framesHead.length) {
            headData = spriteSheet.framesHead[frame];
            if (headData) {
                headFrame = spriteSheet.head.getFrame(headData[3] | 0);
                headIndex = headData[2];
            }
        }

        if (headIndex < 0) {
            this.drawSprite(context, headFrame, headData[0] + pos.x, headData[1] + pos.y - pos.z, viewport);
        }

        const o = spriteSheetFrame(spriteSheet.body, frame);
        this.drawSprite(context, o, pos.x, pos.y - pos.z, viewport);

        if (headIndex > 0) {
            this.drawSprite(context, headFrame, headData[0] + pos.x, headData[1] + pos.y - pos.z, viewport);
        }
    }

    drawLion(context, entity, viewport) {
        const o = SpriteSheets.lion.getFrame(0);
        const pos = entity.getPos();
        this.drawSprite(context, o, pos.x, pos.y - pos.z, viewport);
    }

    drawCauldron(context, entity, viewport) {
        const o = SpriteSheets.cauldron.getFrame(0);
        const pos = entity.getPos();
        this.drawSprite(context, o, pos.x, pos.y - pos.z, viewport);
    }

    drawDot(context, entity, viewport) {
        // dot sprite
        const color = entity.fillStyle || '#ff8000';
        let frame = dotFrames['dot' + color];
        if (!frame) {
            const radius = entity.radius;
            const size = radius * 2;
            const canvas = Images.appendCacheDraw('dot' + color, size, size, function (context) {
                context.fillStyle = color;
                context.beginPath();
                context.arc(radius, radius, radius, 0, 2 * pi, false);
                context.fill();
            });
            canvas.src = 'dot' + color;
            frame = {
                image: canvas,
                rect: new window.createjs.Rectangle(0, 0, size, size),
                regX: radius,
                regY: radius
            };
            dotFrames['dot' + color] = frame;
        }
        frame.alpha = entity.alpha;
        const pos = entity.getPos();
        this.drawSprite(context, frame, pos.x, pos.y - pos.z, viewport, entity.alpha);
    }

    drawGenericEntity(context, entity, viewport/*, delta*/) {
        // 	//throw('entity renderer not defined '+entity);
        // pixel sprite
        let frame = dotFrames[entity.type];
        if (!frame) {
            const width = entity.width || 64;
            const height = entity.height || 64;
            const canvas = Images.appendCacheDraw(entity.type, width, height, function (context) {
                context.fillStyle = '#0008ff';
                context.beginPath();
                context.fillRect(0, 0, width, height);
            });
            canvas.src = entity.type;
            frame = {
                image: canvas,
                rect: new window.createjs.Rectangle(0, 0, width, height),
                regX: width / 2,
                regY: height / 2
            };
            dotFrames[entity.type] = frame;
        }
        const pos = entity.getPos();
        this.drawSprite(context, frame, pos.x, pos.y - pos.z, viewport);
    }

    drawEntity(context, entity, viewport, delta) {
        switch (entity.type) {
        case 'Ninja':
            this.drawNinja(context, entity, viewport, delta);
            break;
        case 'Player':
            this.drawPlayer(context, entity, viewport, delta);
            break;
        case 'Projectile':
            this.drawProjectile(context, entity, viewport, delta);
            break;
        case 'Puff':
            this.drawPuff(context, entity, viewport, delta);
            break;
        case 'Box':
            this.drawLion(context, entity, viewport, delta);
            break;
        case 'Circle':
            this.drawCauldron(context, entity, viewport, delta);
            break;
        case 'Dot':
            this.drawDot(context, entity, viewport);
            break;
        case 'Entity':
            this.drawGenericEntity(context, entity, viewport);
            break;
        // case 'EmptyHand':
        // 	break;
        // default:
        // 	throw 'Unexpected entity type.'
        }
    }

    drawSprite(context, o, x, y, viewport) {
        if (o && intersects(o.rect, viewport, x - o.regX, y - o.regY)) {
            const drawable = Images.getCached(o.image);
            const rect = o.rect;
            if (global.debug === 1) {
                traceTime('drawImage ' + o.image.src);
            }
            if (o.alpha !== null) {
                if (o.alpha === 0) {
                    return false;
                }
                context.save();
                context.globalAlpha = o.alpha;
                context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x - o.regX, y - o.regY, rect.width, rect.height);
                context.restore();
            } else {
                context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x - o.regX, y - o.regY, rect.width, rect.height);
            }
            if (global.debug === 1) {
                traceTimeEnd('drawImage ' + o.image.src);
            }
            return true;
        }
        return false;
    }

    drawEntityDebug(context, entity/*, o*/) {
        const pos = entity.getPos();
        const x = pos.x;
        const y = pos.y - pos.z;
        //draw layer info
        const fieldHeight = 48;
        entity.label = entity.label || Entity.getLabel(context, fieldHeight);
        entity.label.setPos(x - 16, y - (entity.depth | 0) - 20);
        let info = '' + entity.layerNum + ': ' + entity.layerName + ', ' + entity.sortReason;
        if (entity.mapCollision.length) {
            info += '\r' + global.objectToProps(entity.mapCollision, 'name').join(',');
        }
        info += '\rz: ' + pos.z.toFixed(1) + ' x: ' + x.toFixed(1) + ' y: ' + pos.y.toFixed(1);
        if (entity.input) {
            const goal = entity.input.goal;
            if (goal) {
                info += '\r' + goal.name + ' ' + (goal.taskIndex + 1) + '/' + goal.tasks.length + ' ' + (goal.taskTime / 1000).toFixed(1);
            }
        }
        entity.label.setText(info);
    }

}

function entityFrame(entity, spriteSheet) {
    //var numFrames = spriteSheet.getNumFrames();
    const x = entity.body.rot.x * 2 | 0;
    const y = entity.body.rot.y * 5 | 0;//1.43|0;
    let frame;
    // 0 = down, 1-5 clockwise
    if (x) {
        if (y > 0) {
            frame = (x > 0) ? 4 : 2;
        } else {
            frame = (x > 0) ? 5 : 1;
        }
    } else {
        frame = (y > 0) ? 3 : 0;
    }

    let animation;
    let animationFrame;
    let progress;

    if (entity.state === 'walking') {
        animation = spriteSheet.getAnimation('walk_' + frame);
        if (animation) {
            animationFrame = floor(entity.walkCount) % 4;
            frame = animation.frames[0] + animationFrame;
        } else {
            console.error('no walk_' + frame);
        }
    } else if (entity.state === 'punching') {
        animation = spriteSheet.getAnimation('punch_' + frame);
        if (animation) {
            progress = entity.attack.time / entity.attack.pushDuration;
            animationFrame = Math.min(3, floor(progress * 3));
            frame = animation.frames[0] + animationFrame;
        } else {
            console.error('no punch_' + frame);
        }
    } else if (entity.state === 'hit' || entity.state === 'dead') {//entity.hitPoints <= 0) {//entity.state === 'hit') {
        animation = spriteSheet.getAnimation('fall');
        if (animation) {
            if (entity.state === 'dead') {
                animationFrame = 3;
            } else {
                if (entity.isShadowClone) {
                    progress = (entity.hitDuration - entity.hitTime) / entity.hitDuration;
                    animationFrame = Math.min(3, floor(progress * 2));
                } else {
                    progress = (entity.hitDuration - entity.hitTime) / entity.hitDuration;
                    if (progress < 0.33) {
                        animationFrame = -1;
                    } else {
                        progress = (progress - 0.33) * 3 / 2;
                        animationFrame = Math.min(3, floor(progress * 3));
                    }
                }
            }
            frame = (animationFrame === -1) ? frame : animation.frames[0] + animationFrame;
        } else {
            console.error('no fall');
        }
    }

    return frame;
}

function spriteSheetFrame(spriteSheet, frame) {
    const frameData = spriteSheet.getFrame(frame);
    if (frameData === null) {
        if (spriteSheet.complete) {
            console.error('SpriteSheet null frame. Complete:', spriteSheet.complete, frame, '/', spriteSheet.getNumFrames(), spriteSheet.getAnimations());
        }
        return null;
    }
    return frameData;
}

function intersects(rect, viewport, x, y) {
    return (x <= viewport.r && viewport.l <= x + rect.width &&
    y <= viewport.b && viewport.t <= y + rect.height);
}

/*function intersectsArc(arc, viewport, x, y) {
 var radius = arc.radius;
 return (x - radius <= viewport.r && viewport.l <= x + radius &&
 y - radius <= viewport.b && viewport.t <= y + radius);
 }*/
