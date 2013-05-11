(function(window) {

	var ec = window.ec;
	
	var EmptyHand = ec.EmptyHand = function(radius, mass) {
		this.setBaseProperties();
		
		radius = radius || 24;
		mass = mass || 1;

		this.assignCircleShape(radius, mass);
		
		this.shape.setElasticity(0.5);
		this.shape.setFriction(1);

		this.depth = 64;

		this.time = 0;
		this.phase = EmptyHand.PASSIVE;

		this.pushDuration = 1000 * 5/60;
		this.grabDuration = 1000 * 10/60;
		this.punchDuration = this.pushDuration + this.grabDuration/2;

		this.force = cp.v(0, 0);

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

		entityStep: function(delta, entity) {
			if (this.phase) {
				this.z = entity.z;
				this.time += delta;

				if (this.phase === ec.EmptyHand.PUSHING) {
					if (this.time < this.punchDuration) {
						//punching
						// TODO: check for early hit - GRAB/PUSH

						this.force.x =  entity.pushpull.x * entity.speed * delta;
						this.force.y = -entity.pushpull.y * entity.speed * delta;

						this.body.vx = entity.body.vx + this.force.x;
						this.body.vy = entity.body.vy + this.force.y;

					} else if (entity.passive()) {
						//done punching
						entity.attackEnd();
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
						entity.attackEnd();
						//console.log('grab ended passively');

					} else if (this.time > this.pushDuration + this.grabDuration) {
						// TODO: did we grab anyone?
						var grabbedTarget = false;
						if (!grabbedTarget) {
							//done punching
							entity.attackEnd();
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
						entity.attackEnd();
						console.log('pull ended passively');
					}

				}
			}
		},

		activate: function() {
			this.shape.collision_type = ec.Collisions.PLAYER_HAND;
		}
	};

})(window);