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
				context.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.width);
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
				mapContext.fillText(i+'', x, y+9, 64);
			}
		};
		this.map.tile.src = 'img/tile/floor_8888_64.png';
	};

	Canvas2dView.prototype.updateShape = function() {
		//var scene = this.scene;
		return function(shape) {
			if (shape.view) {
				//shape.view.update(shape, scene);
			}
		};
	};

	Canvas2dView.prototype.lookAt = function(x, y) {
		this.x = x;
		this.y = y;
	};

	Canvas2dView.prototype.zoom = function(scale) {
		var ratioX = ec.pixelRatio;
		var ratioY = ec.pixelRatioY || ratioX;
		this.scale = scale;
		scale = scale * ec.height / 640;
		this.scaleX = ratioX * scale;
		this.scaleY = ratioY * scale;
		this.context.scale(this.scaleX, this.scaleY);
	};

	Canvas2dView.prototype.draw = function() {
		var context = this.context;
		// save the current context
		context.save();
		
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.fillStyle = '#888888';
		context.fillRect(0, 0, ec.width, ec.width);

		// translate by default to screen coordinates
		context.translate(-this.x * this.scaleX, -this.y * this.scaleY);
		context.scale(this.scaleX, this.scaleY);

		this.map.draw(context);

		// restore initial context
		context.restore();
	};

	Canvas2dView.prototype.pause = function() {

	};

	Canvas2dView.prototype.resume = function() {

	};

	Canvas2dView.prototype.getDom = function() {
		return this.canvas;
	};

	Canvas2dView.prototype.resize = function() {
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
	};

	Canvas2dView.prototype.debugGui = function(debugView) {
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