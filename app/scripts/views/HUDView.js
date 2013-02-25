(function(window) {
	'use strict';

	var ec = window.ec;

	var HUDView = ec.HUDView = function() {
		this.width  = 0;
		this.height = 0;
		this.pixelRatio = 1.0;

		this.alpha = 1.0;
		this.scale = 1.0;

		this.health = 1.0;
		this.rate = 1.0;
		this.lifetime = 0.0;

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	function easeInElastic (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	}

	HUDView.prototype = {
		draw: function(context, delta) {

			this.lifetime += delta;

			var bgHeart = ec.SpriteSheets.heart.getFrame(1);
			var tpHeart = ec.SpriteSheets.heart.getFrame(0);
			if (bgHeart) {
				var x = 25+bgHeart.regX;
				var y = 20+bgHeart.regY;
				var rect = bgHeart.rect;

				context.save();
				
				var beatMilliseconds = 1000 / this.rate;
				var scale = (this.scale + easeInElastic(0, this.lifetime % beatMilliseconds, 1.0, 0.2, beatMilliseconds))/2;

				context.setTransform(scale, 0, 0, scale, x, y);
				this.scale =  scale;

				if (this.health < 1.0) {
					context.globalAlpha = this.alpha;
					context.drawImage(ec.getCached(bgHeart.image), rect.x, rect.y, rect.width, rect.height, -bgHeart.regX, -bgHeart.regY, rect.width, rect.height);
				}
				
				context.globalAlpha = this.health * this.alpha;
				rect = tpHeart.rect;
				context.drawImage(ec.getCached(tpHeart.image), rect.x, rect.y, rect.width, rect.height, -tpHeart.regX, -tpHeart.regY, rect.width, rect.height);
				
				context.restore();
			}
		},

		resize: function(width, height, ratio) {
			this.width  = width * ratio;
			this.height = height * ratio;
			this.pixelRatio = ratio;
		}
	};

})(window);