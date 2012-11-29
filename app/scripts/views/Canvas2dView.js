(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;

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
				context.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height);
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
		this.updateShapeView = this.updateShape();
	};

	var proto = Canvas2dView.prototype;

	proto.spriteSheet = new window.createjs.SpriteSheet({
		images: ['img/sprite/minimonk_64.png'],
		frames: [[0,152,96,143,0,47.5,131.4],[96,0,62,141,0,33.5,124.4],[96,0,62,141,0,33.5,124.4],[0,295,69,139,0,35.5,124.4],[0,0,96,152,0,47.5,140.4],[69,295,69,139,0,32.5,124.4],[96,141,62,141,0,27.5,124.4],[96,141,62,141,0,27.5,124.4]],
		animations: {'standing': 0}
		//animations: {'standing': [first, last, next, frequency]}
		//animations: {'standing': {next: '', frequency: 1, frames: NumberOrArray}
	});

	proto.updateShape = function() {
		//var scene = this.scene;
		var context = this.context;
		var spriteSheet = this.spriteSheet;
		var numFrames = spriteSheet.getNumFrames();

		return function(shape) {
			// if (shape.view) {
			//	shape.view.update(shape, scene);
			// }
			var x = shape.body.p.x + 640;
			var y = -shape.body.p.y + 640;

			var pi = Math.PI;
			var round = Math.round;

			if (shape instanceof cp.PolyShape) {
				context.fillStyle = '#888888';

				//context.arc(in float x, in float y, in float radius, in float startAngle, in float endAngle, in boolean anticlockwise Optional);
				context.fillRect(x-32, y-32, 64, 64);
			} else if (shape instanceof cp.CircleShape) {
				context.fillStyle = '#880000';
				//context.fillRect(x, y, 64, 64);

				var radians = shape.body.a;
				var frame = (6 - round(radians * 4 / pi)) % 8;
				//console.log(radians / pi, (6 - round(radians * 4 / pi)), frame);
				while (frame < 0) {
					frame += numFrames;
				}
				var o = spriteSheet.getFrame(frame);
				if (o === null) {
					if (spriteSheet.complete) {
						console.error('SpriteSheet null frame. Complete:', spriteSheet.complete, frame, '/', spriteSheet.getNumFrames(), spriteSheet.getAnimations());
					}
					return;
				}
				var rect = o.rect;
				context.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
		
			} else if (shape instanceof cp.SegmentShape) {
				//context.moveTo();
				//context.lineTo();

			} else {
				context.fillStyle = '#000088';
				context.fillRect(x-32, y-32, 64, 64);
			}
			
		};
	};

	proto.lookAt = function(x, y) {
		this.x = x;
		this.y = y+288;
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
	
	proto.draw = function(world) {
		var context = this.context;
		// save the current context
		context.save();

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.fillStyle = '#888888';
		context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// translate by default to screen coordinates
		context.translate(-this.x * this.scaleX, -this.y * this.scaleY);
		context.scale(this.scaleX, this.scaleY);

		this.map.draw(context);

		if (world.space.activeShapes.count > 0) {// || redraw
			world.space.eachShape(this.updateShapeView);
			//redraw = false;
		}

		context.restore();

		if (this.input) {
			this.input.draw(context, this.canvas.width, this.canvas.height);
        }

		// restore initial context
		context.restore();
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
			}
		]);
	};

})(window);