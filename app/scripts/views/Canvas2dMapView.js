(function(window) {
	'use strict';

	var ec = window.ec;

	var Canvas2dMapView = ec.Canvas2dMapView = function() {
		
		this.canvas =  window.document.createElement('canvas');

		// TODO: limit map canvases to blocks of 1024^2, or view size, or 2048^2
		this.canvas.width  = 1280;
		this.canvas.height = 1280;
		
		var mapContext =
		this.context = this.canvas.getContext('2d');
		
		this.tile = new Image();
		this.tile.onload = function() {
			console.log('loaded', this.width, this.height);
			for (var i=0;i<400; i++) {
				var x = (i % 20)*64;
				var y = Math.floor(i/20)*64;
				mapContext.drawImage(this, x, y, this.width, this.height);
				//mapContext.fillText(i+'', x, y+9, 64);
			}
		};
		this.tile.src = 'img/tile/floor_8888_64.png';
	};

	var proto = Canvas2dMapView.prototype;

	proto.draw = function(context) {
		context.drawImage(this.canvas, -640, -640, this.canvas.width, this.canvas.height);
	};

})(window);
