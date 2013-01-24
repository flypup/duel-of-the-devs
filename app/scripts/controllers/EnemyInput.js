(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;

	var EnemyInput = ec.EnemyInput = function() {
		this.axes = [];
		for (var i = 0; i < 4; i++) {
			this.axes[i] = 0;
		}
		this.goal = null;
		this.goalIndex = -1;
	};

	var proto = EnemyInput.prototype;
	EnemyInput.ready = function() {
		ec.extend(proto, ec.GoalBasedInput.prototype);
	};

	//cycle through private 'goals' array
	proto.selectGoal = function() {
		var goal, index;
		index = this.goalIndex + 1;
		if (index >= goals.length) {
			index = 0;
		}
		goal = goals[index];
		this.goalIndex = index;
		return goal;
	};

/** UTILS ***********************************/

	function lengthSq (vect) {
		return vect.x * vect.x + vect.y * vect.y;
	}

	function vnormalize (vect, update) {
		if (!update) {
			vect = ec.copy({}, vect);
		}
		var length = Math.sqrt(lengthSq(vect));
		vect.x = vect.x / length;
		vect.y = vect.y / length;
		return vect;
	}

	function vmultiply (vect, value, update) {
		if (!update) {
			vect = ec.copy({}, vect);
		}
		vect.x = vect.x * value;
		vect.y = vect.y * value;
		return vect;
	}

	function vperp (vect, update) {
		if (!update) {
			vect = ec.copy({}, vect);
		}
		var x = vect.x;
		vect.x = -vect.y;
		vect.y = x;
		return vect;
	}

	function vsub (v1, v2, update) {
		if (!update) {
			v1 = ec.copy({}, v1);
		}
		v1.x = v1.x - v2.x;
		v1.y = v1.y - v2.y;
		return v1;
	}

	function vadd (v1, v2, update) {
		if (!update) {
			v1 = ec.copy({}, v1);
		}
		v1.x = v1.x + v2.x;
		v1.y = v1.y + v2.y;
		return v1;
	}

/** TASKS ***********************************/

	// TARGETING ----------------------
	var targetNearestEnemy = function() {
		// TODO: raycast or query line-of-sight to make this more difficult
		// TODO: search task

		this.targetEntity = ec.player;
		//console.log('found nearest');

		this.completeTask();
	};

	var targetNearestEnemyPos = function() {
		this.targetEntity = ec.player;
		this.updateTargetPos();
		this.completeTask();
	};

	function scramble() {
		return function scrambleTask(entity) {
			//console.log('scramble');
			this.targetPos = v(Math.random() * 1000, Math.random() * 1000 + 1000);
			entity.speed = 6;
			this.completeTask();
		};
	}

	// MOVING  ----------------------
	function moveTo(distance, speed) {
		distance = distance || GOAL_DISTANCE;
		speed = speed || 6;
		return function moveToTask(entity) {
			//console.log('moveTo', this.targetPos, this);
			if (!this.targetPos) {
				//nowhere to go
				this.completeTask();
				return;
			}
			// from me to target
			var direction = vsub(this.targetPos, entity.getPos());
			if (lengthSq(direction) < distance * distance) {
				//reached target
				//console.log('moved to target');
				this.completeTask();
				this.targetPos = null;
				this.setAxes1(0, 0);
				entity.setAngle(direction, 0);
				return;
			}
			vnormalize(direction, true);
			this.setAxes1(direction.x, direction.y);
		};
	}

	function moveAway(distance, speed) {
		distance = distance || AVOID_DISTANCE;
		speed = speed || 6;
		return function moveAwayTask(entity) {
			if (!this.targetPos) {
				//nothing to run from
				this.completeTask();
				return;
			}
			var direction = vsub(entity.getPos(), this.targetPos);
			if (lengthSq(direction) > distance * distance) {
				//evaded target
				//console.log('evaded target');
				this.completeTask();
				this.targetPos = null;
				this.setAxes1(0, 0);
				entity.setAngle(direction, 0);
				return;
			}
			vnormalize(direction, true);
			this.setAxes1(direction.x, direction.y);
		};
	}

	function moveToDistance(distance, speed) {
		distance = distance || AVOID_DISTANCE;
		speed = speed || 6;
		return function moveToDistanceTask(entity) {
			if (!this.targetPos) {
				//nowhere to go
				this.completeTask();
				return;
			}
			// from me to target
			var direction = vsub(this.targetPos, entity.getPos());
			if (lengthSq(direction) > distance * distance + GOAL_DISTANCE * GOAL_DISTANCE) {
				// far from target
				vnormalize(direction, true);
				this.setAxes1(direction.x, direction.y);
				return;
			} else if (lengthSq(direction) < distance * distance) {
				// too close to target
				vnormalize(direction, true);
				this.setAxes1(-direction.x, -direction.y);
				return;
			}
			// within range of target
			this.completeTask();
			this.targetPos = null;
			this.setAxes1(0, 0);
			entity.setAngle(direction, 0);
		};
	}

	// STALK / FACE / AVOID  ----------------------
	function approachTarget(distance, speed) {
		distance = distance || GOAL_DISTANCE;
		speed = speed || 6;
		var move = moveTo(distance);
		return function approachTargetTask(entity) {
			entity.speed = speed;
			this.updateTargetPos();
			move.apply(this, arguments);
		};
	}

	function faceOffTarget(distance, speed) {
		distance = distance || GOAL_DISTANCE;
		speed = speed || 6;
		var move = moveToDistance(distance);
		return function faceOffTargetTask(entity) {
			entity.speed = speed;
			this.updateTargetPos();
			move.apply(this, arguments);
		};
	}

	function evadeTarget(distance, speed) {
		distance = distance || GOAL_DISTANCE;
		speed = speed || 6;
		var move = moveToDistance(distance);
		return function evadeTargetTask(entity) {
			entity.speed = speed;
			this.updateTargetPos();
			move.apply(this, arguments);
		};
	}

	function shuv() {
		var move = moveTo(0, 8);
		return function shuvTask(entity) {
			//console.log('shuv');
			targetNearestEnemy.apply(this, arguments);
			move.apply(this, arguments);
		};
	}

	function kageNoBunshin(maxNumberOfClones, numberOfClonesToMake)  {
		maxNumberOfClones = maxNumberOfClones || 7;
		numberOfClonesToMake = numberOfClonesToMake || 2;
		var makeClonesJutsu = makeClones(maxNumberOfClones, numberOfClonesToMake);
		return function kageNoBunshinTask(entity) {
			if (entity.getClones().length >= maxNumberOfClones) {
				this.completeTask();
				return;
			}
			this.turns = this.turns || 0;
			this.turns += 0.5;
			entity.body.a += 0.5;
			if (this.turns > 11) {
				this.turns = 0;
				//console.log('kage No Bunshin!!!');
				//this.completeTask();
				this.goal.task = makeClonesJutsu;
				this.goal.taskTime = 0;
			}
		};
	}

	function makeClones(maxNumberOfClones, numberOfClonesToMake) {
		maxNumberOfClones = maxNumberOfClones || 7;
		numberOfClonesToMake = numberOfClonesToMake || 2;
		return function makeClonesTask(entity) {
			this.clones = this.clones || 0;
			if (++this.clones > numberOfClonesToMake || entity.getClones().length >= maxNumberOfClones) {
				this.clones = 0;
				this.completeTask();
				//console.log('made all clones');
			} else {
				entity.shadowClone();
			}
		};
	}

	function clonesFormLineA(distance) {
		distance = distance || 192;
		return function clonesFormLineATask(entity) {
			var shadowClones = entity.getClones();
			var numberOfClones = shadowClones.length;
			this.updateTargetPos();
			
			// TODO: Define line between target and myself
			var direction = vsub(this.targetPos, entity.getPos());
			vmultiply(direction, 0.5, true);
			var middle = vsub(this.targetPos, direction);
			//line spacing
			direction = vmultiply(vnormalize(vperp(direction, true), true), 128, true);
			// TODO: Define points on line for numberOfClones
			//middle = vadd(middle, vmultiply(direction, numberOfClones/2), true);

			// TODO: tell clones to form line
			for (var i = numberOfClones; i-- > 0;) {
				var cloneInput = shadowClones[i].input;
				cloneInput.targetPos = middle = vsub(middle, direction, true);
				cloneInput.setGoal(goalTree.moveToPosition);
			}
			this.completeTask();
		};
	}

	function throwStars() {
		return function throwStarsTask(entity) {
			// TODO: tell clones to fire starts at target
			this.completeTask();
		};
	}

	function idle(duration) {
		duration = duration || 120;
		return function idleTask() {//entity, delta
			if (this.goal.taskTime >= duration) {
				this.completeTask();
			}
		};
	}

/** BEHAVIOR ***********************************/
	// goals:
	// 1. face off with player
	// 1a. wait
	// 1b. circle
	// 2. kage no bunshin
	// 3. attack (ninja stars)
	// 4. avoid attack (real ninja)
	// 5. rush in groups (1+5 clones)

	var GOAL_DISTANCE = 64;
	var AVOID_DISTANCE = 512;

	var goalTree = {
		faceOff: {
			name: 'face off',
			tasks: [
				targetNearestEnemy,
				faceOffTarget(160, 10),
				idle(250)
			]
		},
		formLineA: {
			name: 'formation line a',
			tasks: [
				targetNearestEnemy,
				faceOffTarget(320, 10),
				idle(250),
				kageNoBunshin(8),
				makeClones(8, 5),
				clonesFormLineA(160),
				idle(400)
			]
		},
		formCircleA: {
			name: 'formation circle a',
			tasks: [
				kageNoBunshin(11),
				makeClones(11, 5),
				idle(1)
				// TODO: tell clones to form circle with me
			]
		},
		formCircleB: {
			name: 'formation circle b',
			tasks: [
				kageNoBunshin(5),
				makeClones(5, 5),
				idle(1)
				// TODO: tell clones to form circle w/o me
			]
		},
		throwStars: {
			name: 'throw stars',
			tasks: [
				targetNearestEnemy,
				throwStars(),
				idle(600)
			]
		},
		circleTarget: {
			name: 'circle target',
			tasks: [
				idle(1)
				// TODO: tell clones run around target with me
			]
		},
		rush: {
			name: 'rush',
			tasks: [
				targetNearestEnemyPos,
				moveTo(100),
				shuv()
			]
		},
		scatter: {
			name: 'scatter',
			tasks: [
				// targetNearestEnemyPos,
				// evadeTarget(600)
				scramble(),
				moveTo()
			]
		},
		avoid: {
			name: 'avoid',
			tasks: [
				targetNearestEnemyPos,
				moveAway(600),
				idle(300)
			]
		},
		moveToPosition: {
			name: 'move to',
			tasks: [
				moveTo(GOAL_DISTANCE/2)
			]
		},
	};

	var goals = [
		goalTree.formLineA,
		goalTree.throwStars,
		goalTree.formCircleA,
		goalTree.circleTarget,
		goalTree.scatter,
		goalTree.faceOff,
		goalTree.formCircleB,
		goalTree.rush
	];


})(window);