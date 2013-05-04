(function(window) {

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;
	var abs = Math.abs;

	var direction = v(0,0);
	var intent = v(0,0);

	var Ninja = ec.Ninja = function() {
		this.setBaseProperties();
		this.groupId = ec.Entity.groupId++;

		var radius = 32;
		var mass = 5;
		this.assignCircleShape(radius, mass);
		
		this.shape.setElasticity(0);
		this.shape.setFriction(0);

		this.shape.collision_type = ec.Collisions.MONSTER;

		// TODO: better states!
		this.shape.group = this.groupId;
		this.state = 'standing';
		this.walkCount = 0;
		this.speed = 8;
		this.attack = new ec.EmptyHand(radius-4, 1);
		this.depth = 118;
		this.type = 'Ninja';
		
		this.isShadowClone = false;
		this.shadowClones = null;
		this.master = null;
		this.fx = null;

		this.hitPoints = 100;

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	Ninja.ready = function() {
		ec.extend(Ninja.prototype, ec.Entity.prototype);
	};

	Ninja.prototype = {

		removed: function() {
			this.mapCollision.length = 0;
			if (this.shadowClones) { //maybe keep these
				this.shadowClones.length = 0;
			}
			if (this.master) {
				// TODO: tell em to remove from shadowClones
			}
		},

		term: function() {
			ec.Entity.prototype.term.apply(this);
			this.attack = null;
			this.shadowClones = null;
			this.master = null;
			this.fx = null;
		},

		shadowClone: function() {
			if (this.isShadowClone) {
				console.error('shadow clone tried to clone itself!');
				return;
			}
			// use ShadowClone class and prototype or something cool to inherit stuff
			var pos = this.getPos();
			var shadowClone = new ec.Ninja().setPos(pos.x, pos.y, pos.z).setInput(new ec.ShadowCloneInput());
			shadowClone.isShadowClone = true;
			shadowClone.master = this;
			if (!this.shadowClones) {
				this.shadowClones = [];
			}
			this.shadowClones.push(shadowClone);
			ec.world.add(shadowClone);
			this.puffSmoke();
			shadowClone.puffSmoke();
		},

		getClones: function() {
		// get number of shadow clones, clear 'dead' clone refs
			var shadowClones = this.shadowClones;
			if (!shadowClones) {
				shadowClones = this.shadowClones = [];
			}
			for (var i = shadowClones.length; i-- > 0;) {
				// TODO: check if they've been removed
				if (shadowClones[i].state === 'dead') {
					shadowClones.splice(i, 1);
				}
			}
			return shadowClones;
		},
		
		puffSmoke: function() {
			var puff = new ec.Puff(this.groupId);
			ec.world.add(puff);
			this.fx = puff;
			this.fx.track(this);
		},

		throwStar: function() {
			if (this.state !== 'hit' && this.state !== 'dead') {
				var pos = this.getPos();
				var angle = this.body.a;
				var velocity = 800;
				var angleVelocity = 20;

				var throwingStar = new ec.Projectile()
								.setPos(pos.x, pos.y, pos.z + 64)
								.setAngle(angle, angleVelocity)
								.setVelocity(Math.cos(angle) * velocity, Math.sin(angle) * velocity, 0);
				throwingStar.shape.group = this.groupId;
				ec.world.add(throwingStar);
				//this.state = 'throwing'; // can be walking or standing
			}
		},

		contact: function(entity, arbiter) {
			//console.log('CONTACT', arbiter.state, arbiter.contacts.length, this.type, entity.type);
			
			// ignore if already hit
			if (this.hitTime) {
				return true;
			}

			// NINJA <-> NINJA
			if (entity.type === this.type || entity.type === 'Player') {//+ ec.Collisions.BODY (PLAYER or MONSTER)
				// TODO: Should this impact push me back?
				if (entity.hitTime && !this.hitTime) {
					return this.hit(arbiter);
				}
				//ignore this collision
				arbiter.ignore();
				return true;
			}

			// HIT
			return this.hit(arbiter);
		},

		hit: function(arbiter) {
			var energy = (arbiter && arbiter.totalKE()) || 1000;
			//console.log('HIT', this, 'KE', energy);
			if (energy > 0 && this.state !== 'hit' && this.state !== 'dead') {
				//ignore this collisions
				arbiter && arbiter.ignore();

				var damage = 10; // TODO: relative damage
			
				this.state = 'hit';
				if (this.isShadowClone) {
					//hit a clone
					this.hitTime = 400;
					this.hitPoints = damage ? 0 : this.hitPoints;
				} else {
					//hit ninja
					this.hitPoints -= damage;
					this.hitTime = 600;
				}
				this.input.completeTask();
				this.hitDuration = this.hitTime;
				// apply impulse
				this.body.w = energy/10000;
				this.body.vx *= 2;
				this.body.vy *= 2;
				return true;
			}
			return false;
		},

		updateFx: function(delta) {
			if (this.fx) {
				if (this.fx.time > 0) {
					this.fx.update(this);
				} else {
					this.fx = null;
				}
			}
		},

		step: function(delta) {
			if (this.hitTime > 0) {
				if (this.isShadowClone && this.hitTime === this.hitDuration && this.hitPoints === 0) {
					this.puffSmoke();
				}
				this.hitTime -= delta;
				//hit animation
				if (this.hitTime <= 0) {
					this.hitTime = 0;
					if (this.hitPoints <= 0) {
						this.state = 'dead';
						if (this.isShadowClone) {
							ec.world.remove(this);
							this.term();
						}
					} else {
						this.state = 'standing'; //getting up
					}
				}
				this.updateFx();
				return this;

			} else if (this.isShadowClone && this.master.hitPoints <= 0) {
				// HP 0 event for master
				this.puffSmoke();
				this.hit(null);

			} else if (this.state === 'dead') {
				this.body.vx = 0;
				this.body.vy = 0;
				this.body.w *= 0.5;
				this.updateFx();
				return this;
			}

			this.input.poll(this, delta);

			this.resetForces();
			
			if (this.attack.phase === ec.EmptyHand.PASSIVE || this.attack.phase === ec.EmptyHand.PULLING) {
				direction.x = this.input.axes[0];
				direction.y = this.input.axes[1];
				if (abs(direction.x) > 0.1 || abs(direction.y) > 0.1) {
					if (abs(direction.x) > 0.7 || abs(direction.y) > 0.7) {
						// normalize the vector
						direction.mult(1/v.len(direction));
					}

					this.state = 'walking';

					// console.log(this.input.axes, direction.x, direction.y);
					// console.log('v', this.body.vx, this.body.vy);

					direction.mult(this.speed*1000/delta);
					this.body.activate();
					this.body.vx += direction.x;
					this.body.vy -= direction.y;
					this.body.vx *= 0.5;
					this.body.vy *= 0.5;
					//this.body.applyForce(direction, cp.vzero);
					// direction.mult(this.speed);
					// this.body.applyImpulse(direction, cp.vzero);

					if (delta) {
						var velocity = Math.sqrt(this.body.vx * this.body.vx + this.body.vy * this.body.vy) * delta / 40000;
						this.walkCount += Math.max(0.15, velocity);
					}
					
					// TODO: tween angular motion
					this.setAngle(direction, 0);

				} else {
					this.state = 'standing';
					
					this.body.vx = 0;
					this.body.vy = 0;
					this.body.w *= 0.99;
					// if(!this.body.isSleeping() && this.body.space) {
					//	this.body.space.deactivateBody(this.body);
					// }
				}
			}
			intent.x =  this.input.axes[2];
			intent.y = -this.input.axes[3];
			if (abs(intent.x) > 0.1 || abs(intent.y) > 0.1) {
				//if (abs(intent.x) > 0.7 || abs(intent.y) > 0.7) {
				// normalize the vector
				intent.mult(1/v.len(intent));
				//}

				//this.punch(ec.world.time, ec.world, delta);
			} else {
				intent.x = 0;
				intent.y = 0;
			}

			this.updateFx();
			return this;
		}
	};

})(window);