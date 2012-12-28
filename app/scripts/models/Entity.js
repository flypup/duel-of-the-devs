(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;

	var Entity = ec.Entity = function Entity() {
		console.log('new Entity', this);
	};

	Entity.groupId = 1;

	var proto = Entity.prototype;
	proto.z = 0;
	proto.depth = 32;
	proto.groupId = cp.NO_GROUP;
	proto.isEntity = true;

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

	proto.postStep = function(delta) {
		// TODO: update z
		return this;
	};

	proto.addMapCollision  = function(mapElement) {
		if (this.mapCollision.indexOf(mapElement) < 0) {
			this.mapCollision.push(mapElement);
		}
	};

	proto.removeMapCollision  = function(mapElement) {
		var index = this.mapCollision.indexOf(mapElement);
		if (index > -1) {
			this.mapCollision.splice(index, 1);
		}
	};
	
	proto.hit = function(arbiter) {
		console.log('HIT', this);
		return this;
	};

	proto.getSortBounds = function() {
		this.sortBounds = this.sortBounds || {top:0, front:0};
		this.sortBounds.top = this.z + this.depth;
		this.sortBounds.front = -this.body.p.y; // - height/2;
		return this.sortBounds;
	};

	// Physics

	proto.getPos = function() {
		this.pos = this.pos || {x:0, y:0, z:0};
		this.pos.x =  this.body.p.x;
		this.pos.y = -this.body.p.y;
		this.pos.z =  this.z;
		return this.pos;
	};

	proto.setPos = function(x, y, z) {
		this.body.activate();
		this.body.p.x =  x;
		this.body.p.y = -y;
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
		this.mapCollision = this.mapCollision || [];
		moment = moment || cp.momentForCircle(mass, 0, radius, v(0, 0));//cp.vzero);
		this.radius = radius;
		this.body = getBody(mass, moment);
		this.shape = new cp.CircleShape(this.body, radius, v(0, 0));
		return this;
	};

	proto.assignBoxShape = function(width, height, mass, moment) {
		this.mapCollision = this.mapCollision || [];
		moment = moment || cp.momentForBox(mass, width, height);
		this.width = width;
		this.height = height;
		this.body = getBody(mass, moment);
		this.shape = new cp.BoxShape(this.body, width, height);
		return this;
	};

})(window);