(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;

	var Entity = ec.Entity = function Entity() {
		console.log('new Entity', this);
	};

	Entity.groupId = 1;

	Entity.labelPool = [];
	Entity.getLabel = function(context, fieldHeight) {
		var label = this.labelPool.pop();
		if (!label) {
			label = new ec.TextField(context, 0, 0);
		} else {
			label.setContext(context);
		}
		return label.setSize(160, fieldHeight).setStyle('#0ff');
	};

	var proto = Entity.prototype;
	proto.z = 0;
	proto.groundZ = 0;
	proto.velZ = 0;
	proto.climbHeight = 128;
	proto.maxCollisionTopZ = 0;
	proto.depth = 32;
	proto.groupId = cp.NO_GROUP;
	proto.isEntity = true;
	proto.layerNum = 0;
	proto.layerName = '';
	proto.type = 'Entity';

	proto.term = function() {
		delete this.shape;
		delete this.body;
		delete this.pos;
		delete this.sortBounds;
		//
		delete this.input;
		delete this.mapCollision;
		if (this.label) {
			Entity.labelPool.push(this.label);
			delete this.label;
		}
		//
		delete this.attack;
		delete this.shadowClones;
		delete this.fx;
	};

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
		this.groundZ = this.z;

		// TODO: some things regarding entity z movement need to be worked out
		var distance;
		var gravity = -10;
		var damping = 1;
		var friction = 0;
		var thisEntitylimbSpeed = 5;
		
		// get floor. target z = floor z
		// no floor? target z = 0
		var targetZ = this.getTargetZ(this.climbHeight);

		distance = targetZ - this.z;
		if (distance > 0) {
			// TODO: update state and modify velX,velY when climbing or falling
			// climbing
			if (distance <= this.climbHeight) {
				this.groundZ = this.z; // TODO: get next lowest floor
				//this.z = targetZ; // TODO: climb animation
				//this.velZ = 5;
				this.velZ = this.velZ * damping + (thisEntitylimbSpeed + friction * this.body.m_inv) * delta / 100;
				if (this.velZ < 0) {
					this.velZ = 0;
				}
				this.z = Math.min(targetZ, this.z + this.velZ);
			}
		} else if (distance < 0) {
			// falling
			this.velZ = this.velZ * damping + (gravity + friction * this.body.m_inv) * delta / 100;
			this.z = Math.max(targetZ, this.z + this.velZ);
			this.groundZ = targetZ;
		} else {
			this.velZ = 0;
		}
		
		// check if movement is being restricted
		if (this.mapCollision.length > 0) {
			if (this.maxCollisionTopZ > targetZ) {
				this.hitMapWall();
			}
		}

		return this;
	};

	proto.hitMapWall = function() {
		if (this.input) {
			this.input.mapCollision(this);
		}
	};

	proto.postStepScene = function(delta) {
		this.groundZ = this.z;

		var distance;
		var thisEntityCanClimb = 32;

		// get floor. target z = floor z
		// no floor? target z = 0
		var targetZ = this.getTargetZ(thisEntityCanClimb);

		distance = targetZ - this.z;
		if (distance >= thisEntityCanClimb) {
			// climbing
			if (distance <= 0) {
				this.groundZ = targetZ;//this.z; // TODO: get next lowest floor
			}
		} else if (distance < 0) {
			// falling
			this.groundZ = targetZ;
		}
		
		return this;
	};

	proto.getTargetZ = function(climbHeight) {
		climbHeight = climbHeight || this.climbHeight;
		var targetZ = 0;
		this.maxCollisionTopZ = 0;
		for (var i=0, len=this.mapCollision.length; i<len; i++) {
			var element = this.mapCollision[i];
			var top = element.getTop(this.body.p.x, -this.body.p.y);
			if (top > targetZ && (top - this.z) <= climbHeight) {
				targetZ = top;
			}
			this.maxCollisionTopZ = Math.max(this.maxCollisionTopZ, top);
		}
		return targetZ;
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
		var body = this.body;
		if (z !== undefined) {
			this.z = body.z = z;
		}
		body.activate();
		body.p.x =  x;
		body.p.y = -y;
		
		// if (ec.debug > 0) {
		//	console.log(this.type, 'pos', x, y, z, this.mapCollision);
		// }
		if (body.isStatic()) {
			//space.reindexShapesForBody(body);
			for(var i = 0; i < body.shapeList.length; i++){
				var shape = body.shapeList[i];
				shape.update(body.p, body.rot);
				if (shape.space) {
					shape.space.staticShapes.reindexObject(shape, shape.hashid);
				}
			}
		}
		return this;
	};
	
	proto.setAngle = function(v, w) {
		var body = this.body;
		if (w !== undefined) {
			body.w = w;
		}
		if (v && (v.x || v.y)) {
			//body.setAngle(Math.atan2(-v.y, v.x))
			body.a = Math.atan2(-v.y, v.x);
			body.rot.x = v.x;
			body.rot.y = -v.y;
		} else if (!isNaN(v)) {
			body.a = v;
			body.rot.x = Math.cos(v);
			body.rot.y = -Math.sin(v);
		}
		return this;
	};

	proto.setVelocity = function(vx, vy, vz) {
		var body = this.body;
		body.vx = vx;
		body.vy = vy;
		if (vz !== undefined) {
			this.velZ = vz;
		}
		return this;
	};

	proto.resetForces = function() {
		var body = this.body;
		//body.resetForces();
		body.f.x = 0;
		body.f.y = 0;
		body.t = 0;
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