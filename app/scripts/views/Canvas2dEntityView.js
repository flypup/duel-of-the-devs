(function(window) {

	var ec = window.ec;
	var spriteSheets = ec.SpriteSheets;
	var pi = Math.PI;
	var floor = Math.floor;
	var dotFrames = {};

	var Canvas2dEntityView = ec.Canvas2dEntityView = function() {
		// TODO: create one class-type & instance per entity instance or type with spritesheet(s)
		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	Canvas2dEntityView.prototype = {
		draw: function(context, entity, viewport, delta) {
			if (entity.hasShadow) {
				this.drawShadow(context, entity, viewport);
			}
			this.drawEntity(context, entity, viewport, delta);
		},
		
		drawShadow: function(context, entity, viewport) {
			var o;
			if (entity.radius < 20) {
				o = spriteSheets.shadowSmall.getFrame(0);
			} else {
				o = spriteSheets.shadow.getFrame(0);
			}
			if (o) {
				var pos = entity.getPos();
				var x = pos.x;
				var y = pos.y - entity.groundZ;
				var rect = o.rect;
				if (intersects(rect, viewport, x-o.regX, y-o.regY)) {
					if (ec.debug === 1) {ec.core.traceTime('drawImage shadow '+o.image.src);}
					var drawable = ec.getCached(o.image);
					// TODO: draw shadow accoring to entity frame
					context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
					if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage shadow '+o.image.src);}
				}
			}
		},

		drawNinja: function(context, entity, viewport) {
			// SOUND //
			if (entity.state === 'hit') {
				if (entity.hitTime === entity.hitDuration) {
					ec.sound.playSound(ec.sound.sounds.hits, '*');
				}
			}

			var frame = entityFrame(entity, spriteSheets.ninja.body);
			var pos = entity.getPos();

			this.drawBodyAndHead(context, viewport, spriteSheets.ninja, frame, pos);
			if (ec.debug > 1) {
				this.drawEntityDebug(context, entity);
			}
		},

		drawPuff: function(context, entity, viewport) {
			var animation = spriteSheets.ninja.body.getAnimation('puff');
			if (animation) {
				var frame = animation.frames[0] + floor(4.9 * (entity.duration-entity.time) / entity.duration);
				var o = spriteSheets.ninja.body.getFrame(frame);
				var pos = entity.getPos();
				this.drawSprite(context, o, pos.x, pos.y - pos.z, viewport);
			}
			return null;
		},

		drawProjectile: function(context, entity, viewport, delta) {
			// SOUND //
			if (entity.lifetime === 0) {
				ec.sound.playSound(ec.sound.sounds.stars, '*');
			}
			entity.lifetime += delta;

			var frames = spriteSheets.throwingStar.getNumFrames();
			var frame = floor(entity.body.a * frames / pi) % frames;
			var o = spriteSheets.throwingStar.getFrame(frame);
			var pos = entity.getPos();
			this.drawSprite(context, o, pos.x, pos.y - pos.z, viewport);
		},

		drawPlayer: function(context, entity, viewport) {
			// SOUND //
			if (entity.state === 'walking') {
				if (entity.walkCount >= entity.nextStep) {
					entity.nextStep += 2;
					ec.sound.playSound(ec.sound.sounds.steps, '*');
				}
			} else if (entity.state === 'standing') {
				if (entity.nextStep !== 0) {
					entity.nextStep = 0;
					ec.sound.playSound(ec.sound.sounds.steps, '*');
				}
			} else if (entity.state === 'punching') {
				if (entity.attack.time === 0) {
					// entity.attack.pushDuration;
					ec.sound.playSound(ec.sound.sounds.strikes, '*');
					entity.nextStep = 1;
				}
			}

			var frame = entityFrame(entity, spriteSheets.monk.body);
			var pos = entity.getPos();

			this.drawBodyAndHead(context, viewport, spriteSheets.monk, frame, pos);
			if (ec.debug > 1) {
				this.drawEntityDebug(context, entity);
			}
		},

		drawBodyAndHead: function(context, viewport, spriteSheet, frame, pos) {
			var headFrame, headData, headIndex = 0;
			if (frame < spriteSheet.framesHead.length) {
				var headData = spriteSheet.framesHead[frame];
				if (headData) {
					headFrame = spriteSheet.head.getFrame(headData[3]|0);
					headIndex = headData[2];
				}
			}

			if (headIndex < 0) {
				this.drawSprite(context, headFrame, headData[0] + pos.x, headData[1] + pos.y - pos.z, viewport);
			}

			var o = spriteSheetFrame(spriteSheet.body, frame);
			this.drawSprite(context, o, pos.x, pos.y - pos.z, viewport);

			if (headIndex > 0) {
				this.drawSprite(context, headFrame, headData[0] + pos.x, headData[1] + pos.y - pos.z, viewport);
			}
		},

		drawLion: function(context, entity, viewport) {
			var o = spriteSheets.lion.getFrame(0);
			var pos = entity.getPos();
			this.drawSprite(context, o, pos.x, pos.y - pos.z, viewport);
		},

		drawCauldron: function(context, entity, viewport) {
			var o = spriteSheets.cauldron.getFrame(0);
			var pos = entity.getPos();
			this.drawSprite(context, o, pos.x, pos.y - pos.z, viewport);
		},

		drawDot: function(context, entity, viewport) {
			// dot sprite
			var color = entity.fillStyle || '#ff8000';
			var frame = dotFrames['dot'+color];
			if (!frame) {
				var radius = entity.radius;
				var size = radius*2;
				var canvas = ec.appendCacheDraw('dot'+color, size, size, function(context) {
					context.fillStyle = color;
					context.beginPath();
					context.arc(radius, radius, radius, 0, 2*pi, false);
					context.fill();
				});
				canvas.src = 'dot'+color;
				frame = {image: canvas, rect: new window.createjs.Rectangle(0, 0, size, size), regX: radius, regY: radius};
				dotFrames['dot'+color] = frame;
			}
			frame.alpha = entity.alpha;
			var pos = entity.getPos();
			this.drawSprite(context, frame, pos.x, pos.y - pos.z, viewport, entity.alpha);
		},

		drawGenericEntity: function(context, entity, viewport, delta) {
			// 	//throw('entity renderer not defined '+entity);
			// pixel sprite
			var frame = dotFrames[entity.type];
			if (!frame) {
				var width  = entity.width  || 64;
				var height = entity.height || 64;
				var canvas = ec.appendCacheDraw(entity.type, width, height, function(context) {
					context.fillStyle = '#0008ff';
					context.beginPath();
					context.fillRect(0, 0, width, height);
				});
				canvas.src = entity.type;
				frame = {image: canvas, rect: new window.createjs.Rectangle(0, 0, width, height), regX: width/2, regY: height/2};
				dotFrames[entity.type] = frame;
			}
			var pos = entity.getPos();
			this.drawSprite(context, frame, pos.x, pos.y - pos.z, viewport);
		},

		drawEntity: function(context, entity, viewport, delta) {
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
		},

		drawSprite: function(context, o, x, y, viewport) {
			if (o && intersects(o.rect, viewport, x-o.regX, y-o.regY)) {
				var drawable = ec.getCached(o.image);
				var rect = o.rect;
				if (ec.debug === 1) {ec.core.traceTime('drawImage '+o.image.src);}
				if (o.alpha !== null) {
					if (o.alpha === 0) {
						return false;
					}
					context.save();
					context.globalAlpha = o.alpha;
					context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
					context.restore();
				} else {
					context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
				}
				if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage '+o.image.src);}
				return true;
			}
			return false;
		},

		drawEntityDebug: function(context, entity, o) {
			var pos = entity.getPos();
			var x = pos.x;
			var y = pos.y - pos.z;
			//draw layer info
			var fieldHeight = 48;
			entity.label = entity.label || ec.Entity.getLabel(context, fieldHeight);
			entity.label.setPos(x -16, y -(entity.depth|0) - 20);
			var info = ''+ entity.layerNum +': '+ entity.layerName +', '+ entity.sortReason;
			if (entity.mapCollision.length) {
				info += '\r' + ec.objectToProps(entity.mapCollision, 'name').join(',');
			}
			info += '\rz: '+ pos.z.toFixed(1) + ' x: '+ x.toFixed(1) + ' y: '+ pos.y.toFixed(1);
			if (entity.input) {
				var goal = entity.input.goal;
				if (goal) {
					info += '\r' + goal.name +' '+ (goal.taskIndex+1) +'/'+ goal.tasks.length +' '+ (goal.taskTime/1000).toFixed(1);
				}
			}
			entity.label.setText(info);
		}
	};

	function entityFrame(entity, spriteSheet) {
		//var numFrames = spriteSheet.getNumFrames();
		var x = entity.body.rot.x*2|0;
		var y = entity.body.rot.y*5|0;//1.43|0;
		var frame;
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

		var animation;
		var animationFrame;
		var progress;

		if (entity.state === 'walking') {
			animation = spriteSheet.getAnimation('walk_'+ frame);
			if (animation) {
				animationFrame = floor(entity.walkCount) % 4;
				frame = animation.frames[0] + animationFrame;
			} else {
				console.error('no walk_'+ frame);
			}
		} else if (entity.state === 'punching') {
			animation = spriteSheet.getAnimation('punch_'+ frame);
			if (animation) {
				progress = entity.attack.time / entity.attack.pushDuration;
				animationFrame = Math.min(3, floor(progress * 3));
				frame = animation.frames[0] + animationFrame;
			} else {
				console.error('no punch_'+ frame);
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
							progress = (progress - 0.33) * 3 /2;
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
		var frameData = spriteSheet.getFrame(frame);
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

	function intersectsArc(arc, viewport, x, y) {
		var radius = arc.radius;
		return (x - radius <= viewport.r && viewport.l <= x + radius &&
				y - radius <= viewport.b && viewport.t <= y + radius);
	}

})(window);