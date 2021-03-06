(function(window) {

	var ec = window.ec;

	var Projectile = ec.Projectile = function(radius, mass) {
		this.setBaseProperties();
		
		radius = radius || 12;
		mass = mass || 1;

		this.depth = 1;
		this.assignCircleShape(radius, mass);

		this.shape.setElasticity(1);
		this.shape.setFriction(1);

		this.activate();

		this.vx = 0;
		this.vy = 0;
		this.distanceSq = 0;
		this.maxDistanceSq = 8000*8000;
		this.inactive = 0;
		this.lifetime = 0;
		this.climbHeight = 0;

		this.type = 'Projectile';
		this.hasShadow = true;
		
		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	Projectile.ready = function() {
		ec.extend(Projectile.prototype, ec.Entity.prototype);
	};

	Projectile.prototype = {

		setVelocity: function(vx, vy, vz) {
			var body = this.body;
			body.vx = vx;
			body.vy = vy;
			this.vx = vx;
			this.vy = vy;
			if (vz !== undefined) {
				this.velZ = vz;
			}
			return this;
		},

		step: function(delta) {
			this.vx = this.body.vx;
			this.vy = this.body.vy;
			
			return this;
		},

		postStep: function(delta) {
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
				this.stop(delta);
				return;
			}
			this.z = z;

			//map collision or flying?
			if (this.mapCollision.length > 0) {
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
		},

		contact: function(entity, arbiter) {
			// ignore this contact?
			if (this.shape.sensor) { //this.body.t === 0 // TODO: give these some Torque!
				return true;
			}

			var impenetrable = (entity.type === 'Circle'); // material === 'iron'
			if (entity.type === 'Box' || impenetrable) {//Collisions.PROP)
				this.hitObstacle(16, impenetrable);
				return true;
			}

			//console.log('CONTACT', arbiter.state, arbiter.contacts.length, this.type, entity.type, this.body.t, this.shape.sensor);
			this.hit(arbiter);

			return false;
		},

		hit: function(arbiter) {
			var force = 10;
			this.startFall(force);
		},

		hitObstacle: function(delta, impenetrable) {
			//console.log('projectile hit obstacle. w:', this.body.w, 'delta:', delta);
			//stick or bounce down to floor?

			
			if (!impenetrable && (this.distanceSq < 3000*3000 || Math.abs(this.body.w) < 10.0)) {
				//stick in wall
				this.stop(delta);
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
		},

		startFall: function(delta) {
			this.resetForces();
			this.velZ += Math.random() * 32 -16;
			this.body.w = Math.random() * 4 -2;
		},

		stop: function(delta) {
			this.setVelocity(0,0,0);
			this.body.w = 0;
			this.inactive = delta;
			this.shape.sensor = true;
			this.deactivate();
		},

		activate: function() {
			this.shape.collision_type = ec.Collisions.PROJECTILE;
		},

		postStepScene: function(delta) {
			this.groundZ = this.getTargetZ(this.climbHeight);
		}
	};

})(window);