(function(window) {
	'use strict';

	var ec = window.ec;

	var Canvas2dWorldView = ec.Canvas2dWorldView = function(world) {
		
		this.world = world;

		this.mapRenderer = new ec.Canvas2dMapView();
		
		// TODO: add instances to graph for entities in world model
		this.entityRenderer = new ec.Canvas2dEntityView();
		this.drawEntityHandler = this.drawEntity();

		this.camera = {};
		this.camera.x = this.camera.y = 16;
		this.camera.zoom = 1;
	};

	var proto = Canvas2dWorldView.prototype;

	proto.setMapData = function(data) {
		// TODO: remember / remove walls
		this.world.addWalls(-data.width/2, -data.height/2, data.width/2, data.height/2);

		// add entities
		var layers = data.layers;
		for (var i=layers.length; i-- > 0;) {
			var layer = layers[i];
			if (layer.entities) {
				for (var j=layer.entities.length; j-- > 0;) {
					this.world.addMapElement(layer.entities[j], -data.width/2, -data.height/2);
				}
			}
		}

		this.mapRenderer.setMapData(data);
	};

	

	proto.draw = function(context) {
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.fillStyle = '#888888';
		context.globalAlpha = 1;
		context.fillRect(0, 0, this.camera.width, this.camera.height);

		context.save();
		
		// translate by default to screen coordinates
		//context.scale(this.camera.scaleX, this.camera.scaleY);
		//context.translate(-this.camera.x, -this.camera.y);
		context.setTransform(this.camera.scaleX, 0, 0, this.camera.scaleY, -this.camera.x*this.camera.scaleX, -this.camera.y*this.camera.scaleY);
		
		this.mapRenderer.draw(context, this.camera);

		// sort and draw entities
		var entities = this.world.entities;
		if (this.world.space.activeShapes.count > 0) {
			entities.sort(sortEntities);
		}
		for (var i = 0, len = entities.length; i < len; i++) {
			this.entityRenderer.drawShadow(context, entities[i]);
			//this.entityRenderer
			this.drawEntityHandler(context, entities[i]);
		}

		context.restore();
	};

	proto.lookAt = function(x, y) {
		this.camera.x = -this.camera.width/this.camera.scaleX/2 + x;
		this.camera.y = -this.camera.height/this.camera.scaleY/2 + y - 64;
	};

	proto.resize = function(width, height) {
		var ratioX = ec.pixelRatio;
		var ratioY = ec.pixelRatioY || ratioX;
		this.camera.width  = width  * ratioX;
		this.camera.height = height * ratioY;
		this.zoom(this.camera.zoom);
	};

	proto.zoom = function(amount) {
		var ratioX = ec.pixelRatio;
		var ratioY = ec.pixelRatioY || ratioX;
		this.camera.zoom = amount;
		amount = amount * ec.height / 640; // TODO: use device screen height for native pixel scale
		this.camera.scaleX = ratioX * amount;
		this.camera.scaleY = ratioY * amount;
		console.log('zoom', this.camera.zoom, 'factor', amount, 'x,y:', this.camera.scaleX, this.camera.scaleY);
	};

	var sortEntities = function(a, b) {
		if ( a.body.p.y > b.body.p.y ) {
			return -1;
		} else if ( b.body.p.y > a.body.p.y ) {
			return 1;
		}
		return 0;
	};

	proto.drawEntity = function() {
		var monkSheet = ec.SpriteSheets.monk;
		var ninjaSheet = ec.SpriteSheets.ninja;
		
		var pi = Math.PI;
		var round = Math.round;

		var spriteSheetFrame = function(entity, spriteSheet) {
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
		var lionSprite = ec.SpriteSheets.lion.getFrame(0);
		var cauldronSprite = ec.SpriteSheets.cauldron.getFrame(0);


		return function(context, entity) {
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
				if (o) {
					rect = o.rect;
					context.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
				}

			} else if (entity instanceof ec.Puff) {
				var animation = ninjaSheet.getAnimation('puff');
				if (animation) {
					var frame = animation.frames[0] + Math.floor(4.9 * (entity.duration-entity.time) / entity.duration);
					o = ninjaSheet.getFrame(frame);
					if (o) {
						rect = o.rect;
						context.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
					}
				} else {
					console.error('no puff');
				}

			} else if (entity instanceof ec.Player) {
				o = spriteSheetFrame(entity, monkSheet);
				if (o) {
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
				if (o) {
					rect = o.rect;
					context.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
				}

			} else if (entity instanceof ec.Circle) {
				context.fillStyle = '#888888';
				o = cauldronSprite || ec.SpriteSheets.cauldron.getFrame(0);
				if (o) {
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
			}
			context.restore();
		};
	};

})(window);
