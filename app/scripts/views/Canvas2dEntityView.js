(function(window) {
	'use strict';

	var ec = window.ec;

	var Canvas2dEntityView = ec.Canvas2dEntityView = function() {
		this.shadow = ec.SpriteSheets.shadow.getFrame(0);
	};

	var proto = Canvas2dEntityView.prototype;

	proto.draw = function(context, entity) {
		
	};
	
	proto.drawShadow = function(context, entity) {
		var o = this.shadow || ec.SpriteSheets.shadow.getFrame(0);
		if (o) {
			var x =  entity.body.p.x;
			var y = -entity.body.p.y -entity.z;
			var rect = o.rect;
			
			context.save();

			if (entity instanceof ec.Ninja || entity instanceof ec.Player) {
				context.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, x-o.regX, y-o.regY, rect.width, rect.height);
			}
			context.restore();
		}

	};

})(window);