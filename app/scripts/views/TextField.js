var ec = ec || {};
var cp = cp;
(function() {
	'use strict';

	var TextField = ec.TextField = function(context, x, y, width) {
		this.ctx = context;
		this.text = '';
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 100;
		this.height = 16;
		var ratio = this.ratio = ec.pixelRatio || 1;
		
		var canvas = this.canvas = document.createElement('canvas');
		canvas.width  = this.width * ratio;
		canvas.height = this.height * ratio;
		this.context = canvas.getContext('2d');
		this.context.textAlign = 'start';
		this.context.textBaseline = 'top';
		this.context.fillStyle = 'black';
		this.context.font = '12px sans-serif';
		this.context.scale(ratio, ratio);
	};

	TextField.prototype.setText = function(value) {
		if (this.text !== value) {
			this.text = value;
			this.redraw();
		}
		this.draw();
	};

	TextField.prototype.setPos = function(x, y) {
		this.x = x;
		this.y = y;
		//this.draw();
	};

	TextField.prototype.redraw = function() {
		this.context.clearRect(0, 0, this.width, this.height);
		this.context.fillText(this.text, 0, 0, this.width);
	};

	TextField.prototype.draw = function() {
		this.ctx.drawImage(this.canvas, this.x, this.y, this.width, this.height);
	};

})();