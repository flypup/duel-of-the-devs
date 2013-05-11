(function(window) {

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;
	var abs = Math.abs;

	var defaults = {
		speed: 28,
		hitPoints: 100
	};

	ec.playerInteractions = -2;
	
	var Player = ec.Player = function(settings) {
		this.setBaseProperties();
		this.groupId = ec.Entity.groupId++;

		var radius = 32;
		var mass = 5;
		this.assignCircleShape(radius, mass);
		
		this.shape.setElasticity(0);
		this.shape.setFriction(0);

		this.shape.collision_type = ec.Collisions.PLAYER;

		// TODO: better states!
		this.shape.group = this.groupId;
		this.state = 'standing';
		this.walkCount = 0;
		this.nextStep = 2-0.05;
		this.attack = new ec.EmptyHand(radius-4, 1);
		this.type = 'Player';
		this.depth = 118;
		this.hasShadow = true;
		
		this.direction = v(0,0);
		this.pushpull = v(0,0);

		ec.copy(this, defaults);
		if (settings) {
			ec.copy(this, settings);
		}

		if (ec.debug > 1) {
			Object.seal(this);
		}
		
		ec.core.trackCustom(1, 'Player Interacted', 'No', 2);
	};

	Player.ready = function() {
		ec.extend(Player.prototype, ec.Entity.prototype);
	};

	Player.prototype = {

		term: function() {
			ec.Entity.prototype.term.apply(this);
			this.attack = null;
		},

		punch: function() {
			if (this.passive()) {
				return;
			}
			//console.log('punch');
			this.state = 'punching';
			var attack = this.attack;
			if (attack.shape.group === 0) {
				attack.shape.group = this.groupId;
				//ec.world.space.addConstraint(new cp.GrooveJoint(this.body, attack.body, v(40, 0), v(80 , 0), v(0,0)));
			}
			if (attack.phase > ec.EmptyHand.PASSIVE) {
				//console.log('punch in progress', attack.time, 'now', time, 'dur', punchDuration);
				return;
			}
			// restart attack
			if (ec.world.contains(attack)) {
				ec.world.remove(attack);
			}
			attack.time = 0;
			attack.phase = ec.EmptyHand.PUSHING;
			var pos = this.getPos();
			attack.setPos(pos.x, pos.y, pos.z);

			// face direction of punch
			// TODO: tween angular motion
			var pushpull = this.pushpull;
			this.setAngle(pushpull, 0);
			attack.setAngle(pushpull, 0);

			// slow down while punching
			var movementFriction = 0.75;
			this.body.vx *= movementFriction;
			this.body.vy *= movementFriction;
			
			// apply impulse to attack

			attack.resetForces();
			attack.body.activate();
			//attack.body.applyImpulse(attack.force, cp.vzero);
			ec.world.add(attack);

			//console.log('punching');
		},

		attackEnd: function() {
			var attack = this.attack;
			attack.time = 0;
			attack.phase = ec.EmptyHand.PASSIVE;
			if (ec.world.contains(attack)) {
				ec.world.remove(attack);
			}
			// TODO: short cool down
			if (ec.playerInteractions === 2) {
				ec.playerInteractions = 3;
				ec.core.userPlaying();
			}
		},

		passive: function() {
			return this.pushpull.x === 0 && this.pushpull.y === 0;
		},

		contact: function(entity, arbiter) {
			console.log('CONTACT', arbiter.state, arbiter.contacts.length, this.type, entity.type);
			//(arbiter.state === 'first coll')
			
			// ignore if already hit
			if (this.hitTime) {
				return true;
			}

			this.hit(arbiter);

			// ignore collision handlers?
			return false;
		},

		hit: function(arbiter) {
			var energy = (arbiter && arbiter.totalKE()) || 1000;
			//console.log('HIT', this, 'KE', energy);
			if (energy > 0 && this.state !== 'hit' && this.state !== 'dead') {
				this.state = 'hit';
				var damage = 10;
				damage = damage || 10;
				this.hitPoints -= damage;
				this.hitTime = 600;
				this.hitDuration = this.hitTime;
				// apply impulse
				//this.body.w = energy/10000;
				this.body.vx *= 2;
				this.body.vy *= 2;
				if (this.attack.time) {
					this.attack.time += this.attack.punchDuration;
				}
				console.log('PLAYER HIT. Energy:', energy, 'damage:', damage, 'HP:', this.hitPoints, this);
				return true;
			}
			console.log('PLAYER HIT PASS THROUGH. Energy:', energy);
			return false;
		},

		getHeartRate: function(delta) {
			var rate = 1.0;
			if (this.state === 'hit') {
				rate = Math.min(3.0, rate * 1.2);

			} else if (this.state === 'standing') {
				rate = Math.max(0.8, rate - 0.01);

			} else if (this.state === 'punching') {
				rate = Math.min(2.0, rate + 0.05);

			} else if (this.state === 'dead') {
				rate = 0;
			}
			return rate;
		},

		step: function(delta) {
			if (this.state === 'hit') {
				this.hitTime -= delta;
				//hit animation
				if (this.hitTime <= 0) {
					this.hitTime = 0;
					if (this.hitPoints <= 0) {
						this.state = 'dead';
					} else {
						this.state = 'standing'; //getting up
					}
				}
				//this.updateFx();
				return this;

			} else if (this.state === 'dead') {
				this.body.vx *= 0.5;
				this.body.vy *= 0.5;
				this.body.w *= 0.5;
				// //this.updateFx();
				return this;
			}

			this.input.poll(this, delta);
			var pushpull = this.pushpull;
			pushpull.x = this.input.axes[2];
			pushpull.y = this.input.axes[3];
			if (this.input.buttons[0] > 0) {
				//v.forangle(this.body.a);
				pushpull.x =  Math.cos(this.body.a);
				pushpull.y = -Math.sin(this.body.a);
			}
			if (abs(pushpull.x) > 0.1 || abs(pushpull.y) > 0.1) {
				//if (abs(pushpull.x) > 0.7 || abs(pushpull.y) > 0.7) {
				// normalize the vector
				pushpull.mult(1/v.len(pushpull));
				//}
				if (this.state !== 'punching') {
					this.punch();
				}

			} else {
				pushpull.x = 0;
				pushpull.y = 0;
			}

			this.attack.entityStep(delta, this);

			this.resetForces();

			if (ec.playerInteractions < 0) {
				ec.playerInteractions++;
				if (ec.playerInteractions === 0) {
					ec.core.userStarted();
				}
			}

			if (this.attack.phase === ec.EmptyHand.PASSIVE || this.attack.phase === ec.EmptyHand.PULLING) {
				var direction = this.direction;
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

					direction.mult(this.speed*delta);
					this.body.activate();
					this.body.vx += direction.x;
					this.body.vy -= direction.y;
					this.body.vx *= 0.5;
					this.body.vy *= 0.5;

					//this.body.applyForce(direction, cp.vzero);
					// direction.mult(this.speed);
					// this.body.applyImpulse(direction, cp.vzero);

					if (delta) {
						var velocity = Math.sqrt(this.body.vx * this.body.vx + this.body.vy * this.body.vy) * delta / 36000;
						this.walkCount += Math.max(0.15, velocity);
					}

					// TODO: tween angular motion
					this.setAngle(direction, 0);

					if (ec.playerInteractions === 0) {
						ec.playerInteractions = 1;
						ec.core.trackCustom(1, 'Player Interacted', 'Yes', 2);
					}

				} else {
					this.state = 'standing';
					this.walkCount = 0;
					this.body.vx = 0;
					this.body.vy = 0;
					this.body.w *= 0.99;
					// if(!this.body.isSleeping() && this.body.space) {
					//	this.body.space.deactivateBody(this.body);
					// }

					if (ec.playerInteractions === 1) {
						ec.playerInteractions = 2;
						ec.core.userReady();
					}
				}
			}

			return this;
		}
	};
	

})(window);