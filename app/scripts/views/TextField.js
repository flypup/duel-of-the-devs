(function(window) {
	'use strict';

	var ec = window.ec;
	
	var TextField = ec.TextField = function(context, x, y, width, height, fillStyle) {
		this.ctx = context;
		this.text = '';
		this.multiline = true;
		this.x = x || 0;
		this.y = y || 0;

		var canvas = this.canvas = document.createElement('canvas');
		this.context = canvas.getContext('2d');
		this.context.textAlign = 'start';
		this.context.textBaseline = 'top';
		this.context.font = '12px sans-serif';
		this.lineHeight = 14; // measure 'M'

		this.width  = width  || 100;
		this.height = height ||  (this.lineHeight+2);
		
		var ratio = this.ratio = ec.pixelRatio || 1;
		canvas.width  = this.width * ratio;
		canvas.height = this.height * ratio;
		this.context.scale(ratio, ratio);

		this.setStyle(fillStyle);
	};

	TextField.prototype.setText = function(value) {
		if (this.text !== value) {
			this.text = value;
			this.redraw();
		}
		this.draw();
	};

	TextField.prototype.setStyle = function(value) {
		this.context.fillStyle = value || 'black';
		if (this.text) {
			this.redraw();
		}
	};

	TextField.prototype.setMultiline = function(value) {
		this.multiline = value;
		if (this.text) {
			this.redraw();
		}
	};

	TextField.prototype.setPos = function(x, y) {
		this.x = x;
		this.y = y;
	};

	TextField.prototype.redraw = function() {
		this.context.clearRect(0, 0, this.width, this.height);
		if (this.multiline) {
			var lines = this.text.split(/[\r\n]/);
			var y = this.lineHeight;
			for (var i=0; i<lines.length; i++) {
				this.context.fillText(lines[i], 0, y, this.width);
				y += this.lineHeight;
			}
		} else {
			this.context.fillText(this.text, 0, 0, this.width);
		}
	};

	TextField.prototype.draw = function() {
		this.ctx.drawImage(this.canvas, this.x, this.y, this.width, this.height);
	};

})(window);