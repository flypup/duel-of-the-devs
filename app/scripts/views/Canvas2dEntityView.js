(function(window) {

	var ec = window.ec;
	var pi = Math.PI;
	var round = Math.round;
	var floor = Math.floor;

	var Canvas2dEntityView = ec.Canvas2dEntityView = function() {
		// TODO: create one class-type & instance per entity instance or type with spritesheet(s)
		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	var proto = Canvas2dEntityView.prototype;

	proto.draw = function(context, entity, viewport, delta) {
		this.drawShadow(context, entity, viewport);
		this.drawEntity(context, entity, viewport, delta);
	};
	
	proto.drawShadow = function(context, entity, viewport) {
		var o;
		if (entity instanceof ec.Ninja || entity instanceof ec.Player) {
			o = ec.SpriteSheets.shadow.getFrame(0);
		} else if (entity instanceof ec.Projectile) {
			o = ec.SpriteSheets.shadowSmall.getFrame(0);
		} else {
			return;
		}

		if (o) {
			var pos = entity.getPos();
			var x = pos.x;
			var y = pos.y - entity.groundZ;
			var rect = o.rect;
			if (intersects(rect, viewport, x-o.regX, y-o.regY)) {
				if (ec.debug === 1) {ec.core.traceTime('drawImage shadow '+o.image.src);}
				var drawable = ec.getCached(o.image);
				context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
				if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage shadow '+o.image.src);}
			}
		}
	};

	proto.drawEntity = function(context, entity, viewport, delta) {
		var pos = entity.getPos();
		var x = pos.x;
		var y = pos.y - pos.z;
		var o;
		var rect;
		var drawable;
		var frame;

		if (entity instanceof ec.Ninja) {
			o = spriteSheetFrame(entity, ec.SpriteSheets.ninja, delta);
			// SOUND //
			if (entity.state === 'hit') {
				if (entity.hitTime === entity.hitDuration) {
					ec.sound.playSound(ec.sound.sounds.hits, '*');
				}
			}

		} else if (entity instanceof ec.Puff) {
			var ninjaSheet = ec.SpriteSheets.ninja;
			var animation = ninjaSheet.getAnimation('puff');
			if (animation) {
				frame = animation.frames[0] + floor(4.9 * (entity.duration-entity.time) / entity.duration);
				o = ninjaSheet.getFrame(frame);
			}

		} else if (entity instanceof ec.Projectile) {
			var spriteSheet = ec.SpriteSheets.throwingStar;
			var frames = spriteSheet.getNumFrames();
			frame = floor(entity.body.a * frames / pi) % frames;
			o = spriteSheet.getFrame(frame);

			// SOUND //
			if (entity.lifetime === 0) {
				ec.sound.playSound(ec.sound.sounds.stars, '*');
			}
			entity.lifetime += delta;
			
		} else if (entity instanceof ec.Player) {
			o = spriteSheetFrame(entity, ec.SpriteSheets.monk, delta);
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

		} else if (entity instanceof ec.Box) {
			o = ec.SpriteSheets.lion.getFrame(0);

		} else if (entity instanceof ec.Circle) {
			o = ec.SpriteSheets.cauldron.getFrame(0);

		} else if (entity instanceof ec.EmptyHand) {
			// context.fillStyle = (entity.phase === ec.EmptyHand.PUSHING) ? '#ffff00' : '#ff8800' ;
			// context.beginPath();
			// context.arc(x, y-40, entity.radius, 0, 2*pi, false);
			// context.fill();
		} else {
			if (ec.debug === 1) {ec.core.traceTime('draw entity');}
			context.save();
			// TODO: ninja star / projectile sprite
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
			context.restore();
			if (ec.debug === 1) {ec.core.traceTimeEnd('draw entity');}
			//throw('elements did not get placed in a layer '+entity);
		}

		if (o && intersects(o.rect, viewport, x-o.regX, y-o.regY)) {
			drawable = ec.getCached(o.image);
			rect = o.rect;
			if (ec.debug === 1) {ec.core.traceTime('drawImage '+o.image.src);}
			context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
			if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage '+o.image.src);}
		}

		if (ec.debug > 1) {
			//draw layer info
			var fieldHeight = 48;
			entity.label = entity.label || ec.Entity.getLabel(context, fieldHeight);
			entity.label.setPos(x-16, y-((o&&o.regY+fieldHeight)||0));
			var info = ''+ entity.layerNum +': '+ entity.layerName +', '+ entity.sortReason;
			if (entity.mapCollision.length) {
				info += '\r' + ec.objectToProps(entity.mapCollision, 'name').join(',');
			}
			info += '\rz: '+ entity.z.toFixed(1);
			if (entity.input) {
				var goal = entity.input.goal;
				if (goal) {
					info += '\r' + goal.name +' '+ (goal.taskIndex+1) +'/'+ goal.tasks.length +' '+ (goal.taskTime/1000).toFixed(1);
				}
			}
			entity.label.setText(info);
		}
	};

	function spriteSheetFrame(entity, spriteSheet, delta) {
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
		return (x <= viewport.r && viewport.l <= (x + rect.width) &&
				y <= viewport.b && viewport.t <= (y + rect.height));
	}

})(window);