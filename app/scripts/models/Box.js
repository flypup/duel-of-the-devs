var ec = ec || {};
var cp = cp;
(function() {
	'use strict';

	var v = cp.v;

	var BOX_WIDTH = 64;
	var BOX_HEIGHT = 64;

	ec.Box = function(body) {
		this.z = 0;

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
		this.setPos(-64, 0, 32);
	};

	ec.Box.prototype.setView = function(view) {
		this.view = this.shape.view = view;
		this.body.z = this.z;
		return this;
	};

	ec.Box.prototype.setPos = function(x, y, z) {
		this.body.setPos(v(x, y));
		this.z = this.body.z = z;
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