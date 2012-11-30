(function(window) {
	'use strict';

	var cp = window.cp;
	var v = cp.v;

	var Entity = window.ec.Entity = function Entity() {
		console.log('new Entity', this);
	};

	Entity.groupId = 1;

	var proto = Entity.prototype;
	proto.z = 0;
	proto.groupId = cp.NO_GROUP;

	proto.setView = function(view) {
		this.view = view;
		return this;
	};

	proto.setInput = function(input) {
		this.input = input;
		return this;
	};

	proto.step = function(delta) {
		return this;
	};

	proto.hit = function(arbiter) {
		console.log('HIT', this);
		return this;
	};

	// Physics

	proto.setPos = function(x, y, z) {
		this.body.activate();
		this.body.p.x = x;
		this.body.p.y = y;
		if (z !== undefined) {
			this.z = this.body.z = z;
		}
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
	
	var getBody = function(mass, moment) {
		// to create a static body specify a mass of zero
		var body;
		if (mass === 0) {
			// same as world create static body
			body = new cp.Body(Infinity, Infinity);
			body.nodeIdleTime = Infinity;
		} else {
			body = new cp.Body(mass, moment);
		}
		return body;
	};

	proto.assignCircleShape = function(radius, mass, moment) {
		moment = moment || cp.momentForCircle(mass, 0, radius, v(0, 0));//cp.vzero);
		this.radius = radius;
		this.body = getBody(mass, moment);
		this.shape = new cp.CircleShape(this.body, radius, v(0, 0));
		return this;
	};

	proto.assignBoxShape = function(width, height, mass, moment) {
		moment = moment || cp.momentForBox(mass, width, height);
		this.width = width;
		this.height = height;
		this.body = getBody(mass, moment);
		this.shape = new cp.BoxShape(this.body, width, height);
		return this;
	};

})(window);