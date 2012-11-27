(function(window) {
	'use strict';

	var cp = window.cp;
	var v = cp.v;
	var abs = Math.abs;

	var RADIUS = 32;
	var direction = v(0,0);

	var Player = window.ec.Player = function() {
		var mass = 1;
		var moment = cp.momentForCircle(mass, 0, RADIUS, v(0, 0));//cp.vzero);
		
		var body =
		this.body = new cp.Body(mass, moment);

		var shape =
		this.shape = new cp.CircleShape(body, RADIUS, v(0, 0));
		
		this.input = function(){};

		shape.setElasticity(0);
		shape.setFriction(0);

		//this.setView({});
		this.setPos(64, 64, 32);

		this.speed = 8;
	};

	Player.prototype.setView = function(view) {
		this.view = this.shape.view = view;
		return this;
	};

	Player.prototype.setPos = function(x, y, z) {
		this.body.activate();
		this.body.p.x = x;
		this.body.p.y = y;
		if (z !== undefined) {
			this.z = this.body.z = z;
		}
		return this;
	};

	Player.prototype.setInput = function(input) {
		this.input = input;
		return this;
	};

	Player.prototype.step = function(time) {
		this.input.poll();
		this.body.resetForces();
		direction.x =  this.input.axes[0];
		direction.y = -this.input.axes[1];
		if (abs(direction.x) > 0.1 || abs(direction.y) > 0.1) {
			if (abs(direction.x) > 0.7 || abs(direction.y) > 0.7) {
				// normalize the vector
				direction.mult(1/v.len(direction));
			}

			// console.log(this.input.axes, direction.x, direction.y);
			// console.log('v', this.body.vx, this.body.vy);

			direction.mult(this.speed/time);
			this.body.activate();
			this.body.vx += direction.x;
			this.body.vy += direction.y;
			this.body.vx *= 0.5;
			this.body.vy *= 0.5;
			//this.body.applyForce(direction, cp.vzero);
			// direction.mult(this.speed);
			// this.body.applyImpulse(direction, cp.vzero);

			this.body.w = 0;
			this.body.a = Math.atan2(direction.y, direction.x);

		} else {
			this.body.vx = 0;
			this.body.vy = 0;
			this.body.w *= 0.99;
			// if(!this.body.isSleeping() && this.body.space) {
			//	this.body.space.deactivateBody(this.body);
			// }
		}
		return this;
	};

})(window);