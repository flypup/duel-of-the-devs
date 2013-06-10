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
					context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
					if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage shadow '+o.image.src);}
				}
			}
		},

		spriteFrameCalls: {
			Ninja: function(entity, delta) {
				// SOUND //
				if (entity.state === 'hit') {
					if (entity.hitTime === entity.hitDuration) {
						ec.sound.playSound(ec.sound.sounds.hits, '*');
					}
				}

				return spriteSheetFrame(entity, spriteSheets.ninja, delta);
			},

			Puff: function(entity) {
				var animation = spriteSheets.ninja.getAnimation('puff');
				if (animation) {
					var frame = animation.frames[0] + floor(4.9 * (entity.duration-entity.time) / entity.duration);
					return spriteSheets.ninja.getFrame(frame);
				}
				return null;
			},

			Projectile: function(entity, delta) {
				// SOUND //
				if (entity.lifetime === 0) {
					ec.sound.playSound(ec.sound.sounds.stars, '*');
				}
				entity.lifetime += delta;

				var frames = spriteSheets.throwingStar.getNumFrames();
				var frame = floor(entity.body.a * frames / pi) % frames;
				return spriteSheets.throwingStar.getFrame(frame);
			},

			Player: function(entity, delta) {
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

				return spriteSheetFrame(entity, spriteSheets.monk, delta);

			},

			Box: function(entity) {
				return spriteSheets.lion.getFrame(0);
			},

			Circle: function(entity) {
				return spriteSheets.cauldron.getFrame(0);
			},

			EmptyHand: function(entity) {
				// context.fillStyle = (entity.phase === ec.EmptyHand.PUSHING) ? '#ffff00' : '#ff8800' ;
				// context.beginPath();
				// context.arc(x, y-40, entity.radius, 0, 2*pi, false);
				// context.fill();
				return null;
			},

			Dot: function(entity) {
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
				return frame;
			},

			Entity: function(entity) {
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
				return frame;
			}

		},

		drawEntity: function(context, entity, viewport, delta) {
			//var o = this.spriteFrameCalls.Entity(entity, delta);
			var o = this.spriteFrameCalls[entity.type](entity, delta);
			var pos = entity.getPos();
			var x = pos.x;
			var y = pos.y - pos.z;

			if (o && intersects(o.rect, viewport, x-o.regX, y-o.regY)) {
				var drawable = ec.getCached(o.image);
				var rect = o.rect;
				if (ec.debug === 1) {ec.core.traceTime('drawImage '+o.image.src);}
				if (o.alpha !== null) {
					context.save();
					context.globalAlpha = o.alpha;
					context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
					context.restore();
				} else {
					context.drawImage(drawable, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
				}
				if (ec.debug === 1) {ec.core.traceTimeEnd('drawImage '+o.image.src);}

				if (ec.debug > 1 && !(entity instanceof ec.Dot)) {
					//draw layer info
					var fieldHeight = 48;
					entity.label = entity.label || ec.Entity.getLabel(context, fieldHeight);
					entity.label.setPos(x-16, y-((o&&o.regY+fieldHeight)||0));
					var info = ''+ entity.layerNum +': '+ entity.layerName +', '+ entity.sortReason;
					if (entity.mapCollision.length) {
						info += '\r' + ec.objectToProps(entity.mapCollision, 'name').join(',');
					}
					info += '\rz: '+ pos.z.toFixed(1) + ' x: '+ pos.x.toFixed(1) + ' y: '+ pos.y.toFixed(1);
					if (entity.input) {
						var goal = entity.input.goal;
						if (goal) {
							info += '\r' + goal.name +' '+ (goal.taskIndex+1) +'/'+ goal.tasks.length +' '+ (goal.taskTime/1000).toFixed(1);
						}
					}
					entity.label.setText(info);
				}
			}

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
		return (x <= viewport.r && viewport.l <= x + rect.width &&
				y <= viewport.b && viewport.t <= y + rect.height);
	}

	function intersectsArc(arc, viewport, x, y) {
		var radius = arc.radius;
		return (x - radius <= viewport.r && viewport.l <= x + radius &&
				y - radius <= viewport.b && viewport.t <= y + radius);
	}

})(window);