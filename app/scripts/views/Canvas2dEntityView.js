(function(window) {
	'use strict';

	var ec = window.ec;

	var Canvas2dEntityView = ec.Canvas2dEntityView = function() {
		this.shadow = ec.SpriteSheets.shadow.getFrame(0);

		this.drawEntityHandler = this.drawEntity();
	};

	var proto = Canvas2dEntityView.prototype;

	proto.draw = function(context, entity, viewport, delta) {
		this.drawShadow(context, entity, viewport);
		this.drawEntityHandler(context, entity, viewport, delta);
	};
	
	proto.drawShadow = function(context, entity, viewport) {
		var o = this.shadow || ec.SpriteSheets.shadow.getFrame(0);
		if (o) {
			var x =  entity.body.p.x;
			var y = -entity.body.p.y -entity.groundZ;
			var rect = o.rect;
			if (intersects(rect, viewport, x-o.regX, y-o.regY)) {
				context.save();

				var drawable;
				if (entity instanceof ec.Ninja || entity instanceof ec.Player) {
					if (ec.debug === 1) {ec.core.traceTime('drawImage shadow '+o.image.src);}
					drawable = ec.getCached(o.image, 'shadow');
					context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
					if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage shadow '+o.image.src);}
				} else if (entity instanceof ec.Projectile) {
					if (ec.debug === 1) {ec.core.traceTime('drawImage shadow  2 '+o.image.src);}
					drawable = ec.getCached(o.image, 'shadow');
					context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
					if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage shadow 2 '+o.image.src);}
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

		var spriteSheetFrame = function spriteSheetFrame(entity, spriteSheet, delta) {
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

		return function drawEntityFn(context, entity, viewport, delta) {
			// if (entity.view) {
			//	entity.view.update(entity, scene);
			// }
			var x =  entity.body.p.x;
			var y = -entity.body.p.y -entity.z;
			var o;
			var rect;
			var drawable;

			context.save();
			if (entity instanceof ec.Ninja) {
				o = spriteSheetFrame(entity, ninjaSheet, delta);
				if (o && intersects(o.rect, viewport, x-o.regX, y-o.regY)) {
					rect = o.rect;
					if (ec.debug === 1) {ec.core.traceTime('drawImage ninja '+o.image.src);}
					drawable = ec.getCached(o.image, 'ninja');
					context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
					if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage ninja '+o.image.src);}
				}

			} else if (entity instanceof ec.Puff) {
				var animation = ninjaSheet.getAnimation('puff');
				if (animation) {
					var frame = animation.frames[0] + Math.floor(4.9 * (entity.duration-entity.time) / entity.duration);
					o = ninjaSheet.getFrame(frame);
					if (o && intersects(o.rect, viewport, x-o.regX, y-o.regY)) {
						rect = o.rect;
						if (ec.debug === 1) {ec.core.traceTime('drawImage puff '+o.image.src);}
						drawable = ec.getCached(o.image, 'ninja');
						context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
						if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage puff '+o.image.src);}
					}
				} else {
					console.error('no puff');
				}

			} else if (entity instanceof ec.Player) {
				o = spriteSheetFrame(entity, monkSheet, delta);
				if (o && intersects(o.rect, viewport, x-o.regX, y-o.regY)) {
					rect = o.rect;
					if (ec.debug === 1) {ec.core.traceTime('drawImage monk '+o.image.src);}
					drawable = ec.getCached(o.image, 'monk');
					context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
					if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage monk '+o.image.src);}
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
					if (ec.debug === 1) {ec.core.traceTime('drawImage lion '+o.image.src);}
					drawable = ec.getCached(o.image, 'lion');
					context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
					if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage lion '+o.image.src);}
				}

			} else if (entity instanceof ec.Circle) {
				context.fillStyle = '#888888';
				o = cauldronSprite || ec.SpriteSheets.cauldron.getFrame(0);
				if (o && intersects(o.rect, viewport, x-o.regX, y-o.regY)) {
					rect = o.rect;
					if (ec.debug === 1) {ec.core.traceTime('drawImage cauldron '+o.image.src);}
					drawable = ec.getCached(o.image, 'cauldron');
					context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
					if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage cauldron '+o.image.src);}
				}

			} else {
				if (ec.debug === 1) {ec.core.traceTime('draw entity');}
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
				if (ec.debug === 1) {ec.core.traceTimeEnd('draw entity');}
				//throw('elements did not get placed in a layer '+entity);
			}
			if (ec.debug > 1) {
				//draw layer info
				var fieldHeight = 48;
				entity.label = entity.label || ec.Entity.getLabel(context, fieldHeight);
				entity.label.setPos(x-16, y-((o&&o.regY+fieldHeight)||0));
				var info = ''+ entity.layerNum +': '+ entity.layerName;
				if (entity.mapCollision.length) {
					info += '\r' + ec.objectToProps(entity.mapCollision, 'name').join(',');
				}
				if (entity.input) {
					var goal = entity.input.goal;
					if (goal) {
						info += '\r' + goal.name +' '+ (goal.taskIndex+1) +'/'+ goal.tasks.length +' '+ (goal.taskTime/1000).toFixed(1);
					}
				}
				entity.label.setText(info);
			}
			context.restore();
		};
	};

	var intersects = function intersects(rect, viewport, x, y) {
		return (x <= viewport.r && viewport.l <= (x + rect.width) &&
				y <= viewport.b && viewport.t <= (y + rect.height));
	};

})(window);