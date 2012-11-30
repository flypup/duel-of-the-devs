(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;
	var abs = Math.abs;

	var RADIUS = 32;
	var direction = v(0,0);
	var pushpull = v(0,0);

	ec.playerInteracted = false;
	
	var Player = window.ec.Player = function() {
		this.groupId = ec.Entity.groupId++;

		this.assignCircleShape(RADIUS, 1);
		
		this.shape.setElasticity(0);
		this.shape.setFriction(0);

		this.setPos(0, 0, 32);
		this.body.a = -1.57;

		this.shape.collision_type = ec.World.PLAYER_TYPE;

		// TODO: better states!
		this.shape.group = this.groupId;
		this.state = 'standing';
		this.walkCount = 0;
		this.speed = 8;
		this.attack = new ec.EmptyHand(RADIUS-4, 1);

		ec.core.trackCustom(1, 'Player Interacted', 'No', 2);
	};

	var proto = Player.prototype;
	ec.extend(proto, ec.Entity.prototype);

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
		if (world.contains(attack)) {
			world.remove(attack);
		}
		attack.time = time;
		attack.phase = ec.EmptyHand.PUSHING;
		attack.setPos(this.body.p.x, this.body.p.y, this.z);

		// face direction of punch
		// TODO: tween angular motion
		this.body.w = 0;
		this.body.a =
		attack.body.a = Math.atan2(pushpull.y, pushpull.x);

		// slow down while punching
		var movementFriction = 0.75;
		this.body.vx *= movementFriction;
		this.body.vy *= movementFriction;
		
		// apply impulse to attack
		attack.body.resetForces();
		attack.body.activate();
		var force = v.mult(pushpull, this.speed*1000/delta);
		attack.body.vx = force.x + direction.x * movementFriction;
		attack.body.vy = force.y + direction.y * movementFriction;

		//attack.body.applyImpulse(attack.force, cp.vzero);

		world.add(attack);

		//console.log('punching');
	};

	proto.attackEnd = function(time, world) {
		var attack = this.attack;
		attack.time = 0;
		attack.phase = ec.EmptyHand.PASSIVE;
		if (world.contains(attack)) {
			world.remove(attack);
		}
	};

	proto.passive = function() {
		return pushpull.x === 0 && pushpull.y === 0;
	};

	proto.step = function(delta) {
		this.input.poll();
		this.body.resetForces();

		this.attack.entityStep(ec.world.time, ec.world, this);

		if (this.attack.phase === ec.EmptyHand.PASSIVE || this.attack.phase === ec.EmptyHand.PULLING) {
			direction.x =  this.input.axes[0];
			direction.y = -this.input.axes[1];
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
				this.body.vy += direction.y;
				this.body.vx *= 0.5;
				this.body.vy *= 0.5;
				//this.body.applyForce(direction, cp.vzero);
				// direction.mult(this.speed);
				// this.body.applyImpulse(direction, cp.vzero);

				// TODO: tween angular motion
				this.body.w = 0;
				this.body.a = Math.atan2(direction.y, direction.x);

				if (!ec.playerInteracted) {
					ec.playerInteracted = true;
					ec.core.trackCustom(1, 'Player Interacted', 'Yes', 2);
				}

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
		pushpull.x =  this.input.axes[2];
		pushpull.y = -this.input.axes[3];
		if (this.input.buttons[0] > 0) {
			//v.forangle(this.body.a);
			pushpull.x = Math.cos(this.body.a);
			pushpull.y = Math.sin(this.body.a);
		}
		if (abs(pushpull.x) > 0.1 || abs(pushpull.y) > 0.1) {
			//if (abs(pushpull.x) > 0.7 || abs(pushpull.y) > 0.7) {
			// normalize the vector
			pushpull.mult(1/v.len(pushpull));
			//}

			this.punch(ec.world.time, ec.world, delta);
		} else {
			pushpull.x = 0;
			pushpull.y = 0;
		}

		return this;
	};

})(window);