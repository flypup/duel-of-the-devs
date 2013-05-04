(function(window) {

	var ec = window.ec;
	
	var EmptyHand = ec.EmptyHand = function(radius, mass) {
		this.setBaseProperties();
		
		radius = radius || 24;
		mass = mass || 1;

		this.assignCircleShape(radius, mass);
		
		this.shape.setElasticity(0.5);
		this.shape.setFriction(1);

		this.shape.collision_type = ec.Collisions.PLAYER_HAND;

		this.depth = 64;

		this.time = 0;
		this.startTime = -1;
		this.phase = EmptyHand.PASSIVE;

		this.pushDuration = 1000 * 5/60;
		this.grabDuration = 1000 * 10/60;
		this.punchDuration = this.pushDuration + this.grabDuration/2;

		this.type = 'EmptyHand';

		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	EmptyHand.PASSIVE = 0;
	EmptyHand.PUSHING = 1;
	EmptyHand.GRABBING = 2;
	EmptyHand.PULLING = 3;

	EmptyHand.ready = function() {
		ec.extend(EmptyHand.prototype, ec.Entity.prototype);
	};

	EmptyHand.prototype = {

		postStep: function(delta) {
			return this;
		},

		contact: function(entity, arbiter) {
			//console.log('CONTACT', arbiter.state, arbiter.contacts.length, this.type, entity.type);
			// ignore collision handlers?
			return false;
		},

		entityStep: function(time, world, entity) {
			if (this.phase) {
				this.z = entity.z;
				this.time = time - this.startTime;

				if (this.phase === ec.EmptyHand.PUSHING) {
					if (this.time < this.punchDuration) {
						//punching
						// TODO: check for early hit - GRAB/PUSH

					} else if (entity.passive()) {
						//done punching
						entity.attackEnd(time, world);
						//console.log('punch ended passively');

					} else if (this.time > this.pushDuration) {
						this.phase = ec.EmptyHand.GRABBING;
						//console.log('grabbing');
					}

				} else if (this.phase === ec.EmptyHand.GRABBING) {
					this.body.vx *= 0.9;
					this.body.vy *= 0.9;
					if (entity.passive()) {
						//done punching
						entity.attackEnd(time, world);
						//console.log('grab ended passively');

					} else if (this.time > this.pushDuration + this.grabDuration) {
						// TODO: did we grab anyone?
						var grabbedTarget = false;
						if (!grabbedTarget) {
							//done punching
							entity.attackEnd(time, world);
							//console.log('grab ended empty handed');
						} else {

							// TODO: this.phase = ec.EmptyHand.PULLING;

							// add constraints
							//world.space.addConstraint(new cp.GrooveJoint(entity.body, this.body, v(40, 0), v(80 , 0), v(0,0)));
						}
					}

				} else if (this.phase === ec.EmptyHand.PULLING) {
					// TODO: how long can we keep this up?

					if (entity.passive()) {
						//done punching
						entity.attackEnd(time, world);
						console.log('pull ended passively');
					}

				}
			}
		}
	};

})(window);