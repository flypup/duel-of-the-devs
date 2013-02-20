(function(window) {
	'use strict';

	var ec = window.ec;

	var Projectile = ec.Projectile = function(radius, mass) {
		this.setBaseProperties();
		
		radius = radius || 12;
		mass = mass || 2;

		this.assignCircleShape(radius, mass);

		this.shape.setElasticity(1);
		this.shape.setFriction(1);

		this.shape.collision_type = ec.Collisions.PROJECTILE;

		this.vx = 0;
		this.vy = 0;
		this.distanceSq = 0;
		this.maxDistanceSq = 8000*8000;
		this.inactive = 0;
		
		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	var proto = Projectile.prototype;
	proto.climbHeight = 0;

	Projectile.ready = function() {
		ec.extend(proto, ec.Entity.prototype);
	};

	proto.setVelocity = function(vx, vy, vz) {
		var body = this.body;
		body.vx = vx;
		body.vy = vy;
		this.vx = vx;
		this.vy = vy;
		if (vz !== undefined) {
			this.velZ = vz;
		}
		return this;
	};

	proto.step = function(delta) {
		this.vx = this.body.vx;
		this.vy = this.body.vy;
		
		return this;
	};

	proto.postStep = function(delta) {
		// get floor
		this.groundZ = this.getTargetZ(this.climbHeight);

		if (this.inactive > 0) {
			// count down to delete
			this.inactive += delta;
			if (this.inactive > 3000) {
				ec.world.remove(this);
				this.term();
			}
			return;
		}

		//linear z motion
		var z = this.z + this.velZ * delta / 100;
		if (z < this.groundZ) {
			// floor collision
			//console.log('projectile hit floor');
			this.z = this.groundZ;
			this.resetForces();
			this.deactivate(delta);
			return;
		}
		this.z = z;

		//map collision or flying?
		if (this.maxDistanceSq && this.mapCollision.length > 0) {
			if (this.maxCollisionTopZ > this.groundZ) {
				this.hitObstacle(delta);
			}

		}
	
		this.distanceSq += this.vx * this.vx + this.vy * this.vy;
		if (this.distanceSq < this.maxDistanceSq) {
			this.body.vx = this.vx;
			this.body.vy = this.vy;
		} else {
			var gravity = -10;
			var damping = 50 / (Math.abs(this.body.w)+50);
			var friction = damping;
			this.velZ = this.velZ * damping + (gravity + friction * this.body.m_inv) * delta / 100;
		}
	};

	proto.hit = function(arbiter, forceDamage) {//pushed
		console.log('Projectile HIT. Force:', forceDamage, 'arbiter:', arbiter);
		this.startFall(forceDamage);
	};

	proto.hitObstacle = function(delta) {
		//console.log('projectile hit wall');
		//stick or bounce down to floor?

		
		if (this.distanceSq < 3000*3000 || Math.random() > 0.8) {
			//stick in wall
			this.deactivate(delta);
		} else {
			this.startFall(delta);
		}

		//loose perpetual motion
		this.maxDistanceSq = 0;

		// this.resetForces();
		// var body = this.body;
		// this.body.nodeIdleTime = 1000;
		// body.vx = 0;
		// body.vy = 0;
		// body.w = 0;
		// ec.world.remove(this);
	};

	proto.startFall = function(delta) {
		this.resetForces();
		this.velZ += Math.random() * 32 -16;
		this.body.w = Math.random() * 4 -2;
	};

	proto.deactivate = function(delta) {
		this.setVelocity(0,0,0);
		this.body.w = 0;
		this.inactive = delta;
		this.shape.sensor = true;
	};

	proto.postStepScene = function(delta) {
		this.groundZ = this.getTargetZ(this.climbHeight);
	};

})(window);