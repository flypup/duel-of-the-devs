var ec = ec || {};
var cp = cp;
(function() {
	'use strict';

	var v = cp.v;

	var BOX_WIDTH = 200;
	var BOX_HEIGHT = 200;

	ec.Box = function(body) {
		if (body) {
			this.body = body;
		} else {
			var mass = 1;
			var moment = cp.momentForBox(mass, BOX_WIDTH, BOX_HEIGHT);
			body =
			this.body = new cp.Body(mass, moment);
		}
		
		var shape =
		this.shape = new cp.BoxShape(body, BOX_WIDTH, BOX_HEIGHT);

		shape.setElasticity(0);
		shape.setFriction(0.6);
		
		this.setView(function(){});
		this.setPos(0, 500);
	};

	ec.Box.prototype.setView = function(view) {
		this.view = this.shape.view = view;
		return this;
	};

	ec.Box.prototype.setPos = function(x, y) {
		this.body.setPos(v(x, y));
		if (this.body.isStatic()) {
			//space.reindexShapesForBody(this.body);
			for(var i = 0; i < this.body.shapeList.length; i++){
				var shape = this.body.shapeList[i];
				shape.update(this.body.p, this.body.rot);
				if (shape.space) {
					shape.space.staticShapes.reindexObject(shape, shape.hashid);
				}
			}
		}
		return this;
	};

})();