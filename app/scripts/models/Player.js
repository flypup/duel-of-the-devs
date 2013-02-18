(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;
	var abs = Math.abs;

	var direction = v(0,0);
	var pushpull = v(0,0);

	ec.playerInteractions = -1;
	
	var Player = ec.Player = function() {
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
		this.speed = 8;
		this.attack = new ec.EmptyHand(radius-4, 1);
		this.depth = 64;
		this.type = 'Player';

		if (ec.debug > 1) {
			Object.seal(this);
		}
		
		ec.core.trackCustom(1, 'Player Interacted', 'No', 2);
	};

	var proto = Player.prototype;
	Player.ready = function() {
		ec.extend(proto, ec.Entity.prototype);
	};

	proto.term = function() {
		ec.Entity.prototype.term.apply(this);
		this.attack = null;
	};

	proto.punch = function(time, world, delta) {
		if (this.passive()) {
			return;
		}
		var attack = this.attack;
		if (attack.shape.group === 0) {
			attack.shape.group = this.groupId;
			this.attack = attack;
			//world.space.addConstraint(new cp.GrooveJoint(this.body, attack.body, v(40, 0), v(80 , 0), v(0,0)));
		}
		if (attack.phase > ec.EmptyHand.PASSIVE) {
			//console.log('punch in progress', attack.time, 'now', time, 'dur', punchDuration);
			return;
		}
		// restart attack
		if (world.contains(attack)) {
			world.remove(attack);
		}
		attack.time = 0;
		attack.startTime = time;
		attack.phase = ec.EmptyHand.PUSHING;
		var pos = this.getPos();
		attack.setPos(pos.x, pos.y, pos.z);

		// face direction of punch
		// TODO: tween angular motion
		this.setAngle(pushpull, 0);
		attack.setAngle(pushpull, 0);

		// slow down while punching
		var movementFriction = 0.75;
		this.body.vx *= movementFriction;
		this.body.vy *= movementFriction;
		
		// apply impulse to attack
		
		attack.resetForces();

		attack.body.activate();
		var force = v.mult(pushpull, this.speed*1000/delta);
		attack.body.vx =  force.x + direction.x * movementFriction;
		attack.body.vy = -force.y - direction.y * movementFriction;

		//attack.body.applyImpulse(attack.force, cp.vzero);

		world.add(attack);

		//console.log('punching');
	};

	proto.attackEnd = function(time, world) {
		var attack = this.attack;
		attack.time = 0;
		attack.startTime = -1;
		attack.phase = ec.EmptyHand.PASSIVE;
		if (world.contains(attack)) {
			world.remove(attack);
		}
		// TODO: short cool down
		if (ec.playerInteractions === 2) {
			ec.playerInteractions = 3;
			ec.core.userPlaying();
		}
	};

	proto.passive = function() {
		return pushpull.x === 0 && pushpull.y === 0;
	};

	proto.step = function(delta) {
		this.input.poll(this, delta);

		this.resetForces();

		this.attack.entityStep(ec.world.time, ec.world, this);

		if (ec.playerInteractions === -1) {
			ec.playerInteractions = 0;
			ec.core.userStarted();
		}

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
		pushpull.x = this.input.axes[2];
		pushpull.y = this.input.axes[3];
		if (this.input.buttons[0] > 0) {
			//v.forangle(this.body.a);
			pushpull.x = Math.cos(this.body.a);
			pushpull.y = -Math.sin(this.body.a);
		}
		if (abs(pushpull.x) > 0.1 || abs(pushpull.y) > 0.1) {
			//if (abs(pushpull.x) > 0.7 || abs(pushpull.y) > 0.7) {
			// normalize the vector
			pushpull.mult(1/v.len(pushpull));
			//}

			this.punch(ec.world.time, ec.world, delta);
			this.state = 'punching';

		} else {
			pushpull.x = 0;
			pushpull.y = 0;
		}

		return this;
	};

})(window);