(function(window) {

	var ec = window.ec;

	var Canvas2dCreditsView = ec.Canvas2dCreditsView = function() {
		ec.extend(this, {
			width: 0,
			height: 0,
			creditsTime: -1,
			skipAfter: 3500,
			overlay: ec.getImage('img/ui/credits.png')
		});

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	// TODO: Extend 2d Overlay/Layer View
	Canvas2dCreditsView.prototype = {
		init: function(context) {
			this.creditsTime = 0;

			context.setTransform(1, 0, 0, 1, 0, 0);
			context.fillStyle = '#000';
			context.globalAlpha = 0.1;
		},

		draw: function(context, delta) {
			context.fillRect(0, 0, this.width, this.height);
			context.globalAlpha = Math.min(1, context.globalAlpha + 0.1);

			this.creditsTime += delta;
			var scrollPx = Math.floor(this.creditsTime * 24 / 1000) * 4;

			var overlay = this.overlay;
			if (overlay.height) {
				var scale = this.height / overlay.height;

				var x = this.width - overlay.width * scale;
				//var y = this.height - overlay.height * scale;
				var y = Math.max(-258 * scale, this.height - scrollPx);

				context.drawImage(overlay, x/2, y, overlay.width * scale, overlay.height * scale);
			}
		},

		resize: function(width, height, ratio) {
			this.width  = width  * ratio;
			this.height = height * ratio;
		}
	};
	
})(window);