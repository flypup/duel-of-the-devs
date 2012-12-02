(function(window) {
	'use strict';

	var ec = window.ec;

	var Canvas2dView = ec.Canvas2dView = function() {
		this.x = this.y = -16;
		this.scale = 1;
		var canvas =
		this.canvas = window.document.createElement( 'canvas' );
		canvas.style.position = 'absolute';
		this.context = canvas.getContext('2d');
		this.resize();
		window.document.body.appendChild( canvas );

		//floor view
		this.map = {
			draw: function(context) {
				context.drawImage(this.canvas, -640, -640, this.canvas.width, this.canvas.height);
			},
			canvas: window.document.createElement('canvas'),
			tile: new Image()
		};
		this.map.canvas.width  = 1280;
		this.map.canvas.height = 1280;
		var mapContext = this.map.context = this.map.canvas.getContext('2d');
		this.map.tile.onload = function() {
			console.log('loaded', this.width, this.height);
			for (var i=0;i<400; i++) {
				var x = (i % 20)*64;
				var y = Math.floor(i/20)*64;
				mapContext.drawImage(this, x, y, this.width, this.height);
				//mapContext.fillText(i+'', x, y+9, 64);
			}
		};
		this.map.tile.src = 'img/tile/floor_8888_64.png';
		this.drawEntities = this.drawEntity();
	};

	var proto = Canvas2dView.prototype;

	proto.drawEntity = function() {
		//var scene = this.scene;
		var context = this.context;
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
						progress = (entity.hitDuration - entity.hitTime) / entity.hitDuration;
						animationFrame = Math.min(3, Math.floor(progress * 2));
						// context.translate( x-o.regX, y-o.regY+2);
					    // context.rotate( (Math.PI/2) * progress);
					   // context.translate( -(x-o.regX), -(y-o.regY+2) );
					}
					frame = animation.frames[0] + animationFrame;
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

		return function(entity) {
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

	proto.drawShadow = function(entity) {
		var o = ec.SpriteSheets.shadow.getFrame(0);
		if (o) {
			var x =  entity.body.p.x;
			var y = -entity.body.p.y -entity.z;
			var rect = o.rect;
				
			var context = this.context;
			context.save();

			if (entity instanceof ec.Ninja || entity instanceof ec.Player) {
				context.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
			}
			context.restore();
		}

	};

	proto.lookAt = function(x, y) {
		this.x = -this.canvas.width/this.scaleX/2 + x;
		this.y = -this.canvas.height/this.scaleY/2 + y - 64;
	};

	proto.zoom = function(scale) {
		var ratioX = ec.pixelRatio;
		var ratioY = ec.pixelRatioY || ratioX;
		this.scale = scale;
		scale = scale * ec.height / 640;
		this.scaleX = ratioX * scale;
		this.scaleY = ratioY * scale;
		this.context.scale(this.scaleX, this.scaleY);
		//this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	};

	proto.setInput = function(input) {
		this.input = input;
		input.resize(this.width, this.height);
		return this;
	};

	var sortEntities = function(a, b) {
		if ( a.body.p.y > b.body.p.y ) {
			return -1;
		} else if ( b.body.p.y > a.body.p.y ) {
			return 1;
		}
		return 0;
	};

	proto.draw = function(world) {
		var context = this.context;
		// save the current context
		context.save();

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.fillStyle = '#888888';
		context.globalAlpha = 1;
		context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		context.save();

		// translate by default to screen coordinates
		context.scale(this.scaleX, this.scaleY);
		context.translate(-this.x, -this.y);
		//context.setTransform(this.scaleX, 0, 0, this.scaleY, -this.x*this.scaleX, -this.y*this.scaleY);
		
		this.map.draw(context);

		var entities = world.entities;
		if (world.space.activeShapes.count > 0) {
			entities.sort(sortEntities);
		}
		//draw each entity
		var i = 0;
		var len = entities.length;
		while (i < len) {
			this.drawShadow(entities[i]);
			this.drawEntities(entities[i]);
			i++;
		}

		context.restore();

		if (this.input) {
			this.input.draw(context, this.canvas.width, this.canvas.height);
        }

        if (ec.core.paused()) {
			context.fillStyle = '#000000';
			context.globalAlpha = 0.33;
			context.fillRect(0, 0, this.canvas.width, this.canvas.height);
			context.fillStyle = '#ffffff';
			context.globalAlpha = 0.8;
			context.beginPath();
			context.moveTo(this.canvas.width -15, 35);
			context.lineTo(this.canvas.width -50, 15);
			context.lineTo(this.canvas.width -50, 55);
			context.fill();
        } else if (ec.touch) {
			context.fillStyle = '#ffffff';
			context.globalAlpha = 0.8;
			context.fillRect(this.canvas.width-43, 15, 10, 40);
			context.fillRect(this.canvas.width-25, 15, 10, 40);
        }

        var overlay = ec.core.getOverlay();
        if (overlay) {
			var scale = this.canvas.height / overlay.height;
			var x = this.canvas.width - overlay.width * scale;
			var y = this.canvas.height - overlay.height * scale;
			context.globalAlpha = 1;
			context.drawImage(overlay, x/2, y/2, overlay.width * scale, overlay.height * scale);
        }

		// restore initial context
		context.restore();
	};

	proto.initCredits = function() {
		var context = this.context;
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.fillStyle = '#000';
		context.globalAlpha = 0.1;
		this.creditsTime = 0;
	};

	proto.drawCredits = function(delta) {
		var context = this.context;

		context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		context.globalAlpha = Math.min(1, context.globalAlpha + 0.1);

		this.creditsTime += delta;
		var scrollPx = Math.floor(this.creditsTime * 24 / 1000) * 4;

		var overlay = ec.core.getOverlay();
		var scale = this.canvas.height / overlay.height;

		var x = this.canvas.width - overlay.width * scale;
		//var y = this.canvas.height - overlay.height * scale;
		var y = Math.max(-258 * scale, this.canvas.height - scrollPx);

		context.drawImage(overlay, x/2, y, overlay.width * scale, overlay.height * scale);
	};

	proto.pause = function() {

	};

	proto.resume = function() {

	};

	proto.getDom = function() {
		return this.canvas;
	};

	proto.resize = function() {
		var ratioX = ec.pixelRatio;
		var ratioY = ec.pixelRatioY || ratioX;
		var canvas = this.canvas;
		this.width = ec.width;
		this.height = ec.height;
		canvas.width  = this.width  * ratioX;
		canvas.height = this.height * ratioY;
		canvas.style.width  = this.width  + 'px';
		canvas.style.height = this.height + 'px';
		this.zoom(this.scale);
		if (this.input) {
			this.input.resize(this.width, this.height);
        }
	};

	proto.debugGui = function(debugView) {
		var view = this;
		var resize = function() {
			var pixelRatioX = ec.pixelRatio;
			var pixelRatioY = ec.pixelRatioY;
			ec.resizeDisplay();
			ec.pixelRatio = pixelRatioX;
			ec.pixelRatioY = pixelRatioY;
			view.resize();
		};
		debugView.addGui([
			{
				name: 'view',
				remember: true,
				target: view,
				props: [
					{name: 'x', params:{min: -480, max: 1600}},
					{name: 'y', params:{min: -320, max: 1600}},
					{name: 'scale', onChange: function(value){view.zoom(value);}, params:{step: 0.01, min: 0.25, max: 4}}
				]
			},
			{
				name: 'pixelRatio',
				target: ec,
				props: [
					{name: 'pixelRatio',  params:{min: 1, max: 2, step: 0.5}, onChange: resize},
					{name: 'pixelRatioY', params:{min: 1, max: 2, step: 0.5}, onChange: resize}
				]
			}
		]);
	};

})(window);