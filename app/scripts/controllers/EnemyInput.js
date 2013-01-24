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

	// Descision Loop:
	//   goal set?
	// -  No: set goal
	// - Yes: goal met?
	//      - Yes: wait N for next descision
	//      -  No: goal sub-steps

	proto.poll = function(entity, delta) {
		if (this.state === 'dead') {
			return;
		}
		var goal = this.goal;
		if (!goal || goal.met) {
			goal = this.selectGoal(goal, entity);
		}
		this.goal = goal;
		var task = goal.task;
		if (!task || task.complete) {
			task = this.selectTask(goal, entity);
		}
		if (task) {
			goal.taskTime += delta;
			task.apply(this, arguments);//[entity]);
		}
	};

	proto.mapCollision = function(entity) {
		this.completeTask();
	};

	proto.setAxes1 = function(x, y) {
		this.axes[0] = x;
		this.axes[1] = y;
	};

	proto.selectGoal = function(currentGoal, entity) {
		var goal, index;
		index = this.goalIndex + 1;
		if (index >= goals.length) {
			index = 0;
		}
		goal = goals[index];
		this.goalIndex = index;
		// if (currentGoal === goalTree.faceOff) {
		//	if (currentGoal && currentGoal.failed) ...
		// }
		goal.met = false;
		goal.task = null;
		goal.taskIndex = -1;
		goal.taskTime = 0;
		// if (ec.debug) {
		//	console.log('Enemy goal: ', goal.name);
		// }
		return goal;
	};

	proto.selectTask = function(goal, entity) {
		var task, index;
		index = goal.taskIndex + 1;
		if (index >= goal.tasks.length) {
			goal.met = true;
			return null;
		}
		task = goal.tasks[index];
		task.complete = false;
		goal.task = task;
		goal.taskIndex = index;
		goal.taskTime = 0;
		// if (ec.debug) {
		//	console.log('Enemy task: ', i);
		// }
		return task;
	};

	proto.completeTask = function() {
		if (this.goal && this.goal.task) {
			this.goal.task.complete = true;
		}
	};

	proto.updateTargetPos = function() {
		if (!this.targetEntity) {
			this.completeTask();
			return;
		}
		this.targetPos = ec.copy(this.targetsPos, this.targetEntity.getPos());
	};

/** UTILS ***********************************/

	function lengthSq (vect) {
		return vect.x * vect.x + vect.y * vect.y;
	}

	function vnormalize (vect) {
		var length = v.len(vect);
		vect.x = vect.x / length;
		vect.y = vect.y / length;
	}

	function vmultiply (vect, value) {
		vect.x = vect.x * value;
		vect.y = vect.y * value;
	}

	function vperp (vect) {
		var x = vect.x;
		vect.x = -vect.y;
		vect.y = x;
	}

	var tempVector = {x: 0, y: 0};

	function vsub (v1, v2) {
		tempVector.x = v1.x - v2.x;
		tempVector.y = v1.y - v2.y;
		return tempVector;
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
			vnormalize(direction);
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
			vnormalize(direction);
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
				vnormalize(direction);
				this.setAxes1(direction.x, direction.y);
				return;
			} else if (lengthSq(direction) < distance * distance) {
				// too close to target
				vnormalize(direction);
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
			
			var direction = ec.copy({}, vsub(this.targetPos, entity.getPos()));
			vmultiply(direction, 0.5);
			var middle = vsub(this.targetPos, direction);
			vperp(direction);



			for (var i = numberOfClones; i-- > 0;) {
				var cloneInput = shadowClones[i].input;
				middle = vsub(middle, direction);
				cloneInput.targetPos = ec.copy({}, middle);
				cloneInput.setGoal(goalTree.moveToPosition);
			}
			this.completeTask();
		};
	}

	function throwStars() {
		return function throwStarsTask(entity) {
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
				moveTo()
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