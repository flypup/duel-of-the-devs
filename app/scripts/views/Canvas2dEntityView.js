(function(window) {
	'use strict';

	var ec = window.ec;

	var Canvas2dEntityView = ec.Canvas2dEntityView = function() {
		this.shadow = ec.SpriteSheets.shadow.getFrame(0);

		this.drawEntityHandler = this.drawEntity();
	};

	var proto = Canvas2dEntityView.prototype;

	proto.draw = function(context, entity, viewport) {
		this.drawShadow(context, entity, viewport);
		this.drawEntityHandler(context, entity, viewport);
	};
	
	proto.drawShadow = function(context, entity, viewport) {
		var o = this.shadow || ec.SpriteSheets.shadow.getFrame(0);
		if (o) {
			var x =  entity.body.p.x;
			var y = -entity.body.p.y -entity.z;
			var rect = o.rect;
			if (intersects(rect, viewport, x-o.regX, y-o.regY)) {
				context.save();

				if (entity instanceof ec.Ninja || entity instanceof ec.Player) {
					context.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
				}
				context.restore();
			}
		}
	};

	proto.drawEntity = function() {
		var monkSheet = ec.SpriteSheets.monk;
		var ninjaSheet = ec.SpriteSheets.ninja;
		var lionSprite = ec.SpriteSheets.lion.getFrame(0);
		var cauldronSprite = ec.SpriteSheets.cauldron.getFrame(0);
		
		var pi = Math.PI;
		var round = Math.round;

		var spriteSheetFrame = function spriteSheetFrame(entity, spriteSheet) {
			//var numFrames = spriteSheet.getNumFrames();
			var a = entity.body.a;
			var degrees = 6;
			var radians = a + pi/6;
			var animation;
			var animationFrame;
			var progress;
			if (a === 0) {
				radians -= 0.1;
			}
			var frame = (5 - round(radians * 3 / pi)) % 6;
			// 0 = down, 1-5 clockwise

			//console.log(radians / pi, (6 - round(radians * 4 / pi)), frame);
			while (frame < 0) {
				frame += degrees;
			}
			if (entity.state === 'walking') {
				var velocity = Math.sqrt(entity.body.vx * entity.body.vx + entity.body.vy * entity.body.vy);
				//console.log(velocity);
				entity.walkCount += Math.max(0.15, velocity/2500);
				animation = spriteSheet.getAnimation('walk_'+ frame);
				if (animation) {
					animationFrame = Math.floor(entity.walkCount) % 4;
					frame = animation.frames[0] + animationFrame;
				} else {
					console.error('no walk_'+ frame);
				}
			} else if (entity.state === 'punching') {
				animation = spriteSheet.getAnimation('punch_'+ frame);
				if (animation) {
					progress = entity.attack.time / entity.attack.pushDuration;
					animationFrame = Math.min(3, Math.floor(progress * 3));
					frame = animation.frames[0] + animationFrame;
				} else {
					console.error('no walk_'+ frame);
				}
			} else if (entity.state === 'hit' || entity.state === 'dead') {//entity.hitPoints <= 0) {//entity.state === 'hit') {
				animation = spriteSheet.getAnimation('fall');
				if (animation) {
					if (entity.state === 'dead') {
						animationFrame = 3;
					} else {
						if (entity.isShadowClone) {
							progress = (entity.hitDuration - entity.hitTime) / entity.hitDuration;
							animationFrame = Math.min(3, Math.floor(progress * 2));
						} else {
							progress = (entity.hitDuration - entity.hitTime) / entity.hitDuration;
							if (progress < 0.33) {
								animationFrame = -1;
							} else {
								progress = (progress - 0.33) * 3 /2;
								animationFrame = Math.min(3, Math.floor(progress * 3));
							}
						}
					}
					frame = (animationFrame === -1) ? frame : animation.frames[0] + animationFrame;
				} else {
					console.error('no fall');
				}
			}

			var frameData = spriteSheet.getFrame(frame);
			if (frameData === null) {
				if (spriteSheet.complete) {
					console.error('SpriteSheet null frame. Complete:', spriteSheet.complete, frame, '/', spriteSheet.getNumFrames(), spriteSheet.getAnimations());
				}
				return null;
			}
			return frameData;
		};

		return function(context, entity, viewport) {
			// if (entity.view) {
			//	entity.view.update(entity, scene);
			// }
			var x =  entity.body.p.x;
			var y = -entity.body.p.y -entity.z;
			var o;
			var rect;

			context.save();
			if (entity instanceof ec.Ninja) {
				o = spriteSheetFrame(entity, ninjaSheet);
				if (o && intersects(o.rect, viewport, x-o.regX, y-o.regY)) {
					rect = o.rect;
					context.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
				}

			} else if (entity instanceof ec.Puff) {
				var animation = ninjaSheet.getAnimation('puff');
				if (animation) {
					var frame = animation.frames[0] + Math.floor(4.9 * (entity.duration-entity.time) / entity.duration);
					o = ninjaSheet.getFrame(frame);
					if (o && intersects(o.rect, viewport, x-o.regX, y-o.regY)) {
						rect = o.rect;
						context.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
					}
				} else {
					console.error('no puff');
				}

			} else if (entity instanceof ec.Player) {
				o = spriteSheetFrame(entity, monkSheet);
				if (o && intersects(o.rect, viewport, x-o.regX, y-o.regY)) {
					rect = o.rect;
					context.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
				}

			} else if (entity instanceof ec.EmptyHand) {
				// context.fillStyle = (entity.phase === ec.EmptyHand.PUSHING) ? '#ffff00' : '#ff8800' ;
				// context.beginPath();
				// context.arc(x, y-40, entity.radius, 0, 2*pi, false);
				// context.fill();

			} else if (entity instanceof ec.Box) {
				context.fillStyle = '#888888';
				o = lionSprite || ec.SpriteSheets.lion.getFrame(0);
				if (o && intersects(o.rect, viewport, x-o.regX, y-o.regY)) {
					rect = o.rect;
					context.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
				}

			} else if (entity instanceof ec.Circle) {
				context.fillStyle = '#888888';
				o = cauldronSprite || ec.SpriteSheets.cauldron.getFrame(0);
				if (o && intersects(o.rect, viewport, x-o.regX, y-o.regY)) {
					rect = o.rect;
					context.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
				}

			} else {
				if (entity.radius) {
					context.fillStyle = '#ff8000';
					context.beginPath();
					context.arc(x, y, entity.radius, 0, 2*pi, false);
					context.fill();
				} else if (entity.width && entity.height) {
					context.fillStyle = '#0008ff';
					context.beginPath();
					context.fillRect(x-entity.width/2, y-entity.height/2, entity.width, entity.height);
				} else {
					context.fillStyle = '#000088';
					context.beginPath();
					context.fillRect(x-32, y-32, 64, 64);
				}
				throw('elements did not get placed in a layer '+entity);
			}
			context.restore();
		};
	};

	var intersects = function intersects(rect, viewport, x, y) {
		return (x <= viewport.r && viewport.l <= (x + rect.width) &&
				y <= viewport.b && viewport.t <= (y + rect.height));
	};

})(window);