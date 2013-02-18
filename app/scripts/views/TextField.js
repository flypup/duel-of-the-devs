(function(window) {
	'use strict';

	var ec = window.ec;
	
	var TextField = ec.TextField = function(context, x, y, width, height, fillStyle) {
		this.setContext(context);
		this.text = '';
		this.multiline = true;
		this.x = x || 0;
		this.y = y || 0;
		this.width  = 0;
		this.height = 0;
		this.ratio = 1;
		
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.context.textAlign = 'start';
		this.context.textBaseline = 'top';
		this.context.font = '12px sans-serif';
		this.lineHeight = 14; // measure 'M'

		if (width || height) {
			this.setSize(width, height);
		}
		if (fillStyle) {
			this.setStyle(fillStyle);
		}
		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	TextField.prototype.setText = function(value) {
		if (this.text !== value) {
			this.text = value;
			this.redraw();
		}
		this.draw();
		return this;
	};


	TextField.prototype.setContext = function(context) {
		this.ctx = context;
		return this;
	};

	TextField.prototype.setSize = function(width, height) {
		this.width  = width  || 100;
		this.height = height ||  (this.lineHeight+2);
		
		var ratio = this.ratio = ec.pixelRatio || 1;
		this.canvas.width  = this.width * ratio;
		this.canvas.height = this.height * ratio;
		this.context.scale(ratio, ratio);
		return this;
	};

	TextField.prototype.setStyle = function(value) {
		this.context.fillStyle = value || 'black';
		if (this.text) {
			this.redraw();
		}
		return this;
	};

	TextField.prototype.setMultiline = function(value) {
		this.multiline = value;
		if (this.text) {
			this.redraw();
		}
		return this;
	};

	TextField.prototype.setPos = function(x, y) {
		this.x = x;
		this.y = y;
		return this;
	};

	TextField.prototype.redraw = function() {
		this.context.clearRect(0, 0, this.width, this.height);
		if (ec.debug === 1) {ec.core.traceTime('fillText TextField '+this.text.length);}
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
		if (ec.debug === 1) {ec.core.traceTimeEnd('fillText TextField '+this.text.length);}
	};

	TextField.prototype.draw = function() {
		if (ec.debug === 1) {ec.core.traceTime('draw TextField canvas');}
		this.ctx.drawImage(this.canvas, this.x, this.y, this.width, this.height);
		if (ec.debug === 1) {ec.core.traceTimeEnd('draw TextField canvas');}
	};

	

})(window);