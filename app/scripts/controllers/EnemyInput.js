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
	};

	var proto = EnemyInput.prototype;

	// descision loop:
	// goal set?
	// N - set
	// Y - goal met?
	// Y - wait N for next descision
	// N - goal sub-steps

	proto.poll = function(entity) {
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
			task.apply(this, arguments);
		}
	};

	proto.setAxes1 = function(x, y) {
		this.axes[0] = x;
		this.axes[1] = y;
	};

	proto.selectGoal = function(currentGoal, entity) {
		var goal;
		if (currentGoal === goalTree.surround) {
			if (!entity.isShadowClone) {
				goal = goalTree.shadowClone;
			} else {
				if (Math.random() > 0.5) {
					goal = goalTree.throwStars;
				} else {
					goal = goalTree.surround;
				}
			}

		} else if (currentGoal === goalTree.shadowClone) {
			goal = goalTree.throwStars;
			
		} else if (currentGoal === goalTree.throwStars) {
			if (Math.random() > 0.8) { // in Danger - real ninja / hurt
				goal = goalTree.avoid;
				//entity.speed = 6; //depends on distance
			} else {
				goal = goalTree.rush;
			}
		} else {
			goal = goalTree.surround;
		}
		goal.met = false;
		goal.task = null;
		// if (ec.debug && !entity.isShadowClone) {
		//	console.log('Enemy goal: ', goal.name);
		// }
		return goal;
	};

	proto.selectTask = function(goal, entity) {
		var task, i;
		i = goal.tasks.indexOf(goal.task) +1;
		if (i >= goal.tasks.length) {
			goal.met = true;
			return null;
		}
		task = goal.tasks[i];
		task.complete = false;
		goal.task = task;
		// if (ec.debug && !entity.isShadowClone) {
		//	console.log('Enemy task: ', i);
		// }
		return task;
	};

	proto.completeTask = function() {
		if (this.goal && this.goal.task) {
			this.goal.task.complete = true;
		}
	};

	// goals:
	// 1. surround player
	// 1a. wait
	// 1b. circle
	// 2. kage no bunshin
	// 3. attack (ninja stars)
	// 4. avoid attack (real ninja)
	// 5. rush in groups (1-5 clones)

	var NUMBER_OF_CLONES_AT_ONCE = 7;
	var MAX_ENTITIES = 36;//72;
	var SURROUND_DISTANCE = 250;
	var GOAL_DISTANCE_SQ = 64*64;
	var AVOID_DISTANCE_SQ = 512*512;
	var lengthSq = function(vect) {
		return vect.x * vect.x + vect.y * vect.y;
	};

	// TARGETING ----------------------
	proto.targetNearestEnemy = function targetNearestEnemy(entity) {
		this.targetEntity = ec.player;
		this.targetPos = this.targetEntity.body.p;
		// TODO: raycast or query line-of-sight to make this more difficult
		// TODO: search task
		//console.log('found nearest');
		this.completeTask();
	};

	proto.targetNearestEnemyBorder = function targetNearestEnemyBorder(entity) {
		//console.log('...border');
		this.targetNearestEnemy(entity);
		// from player to me
		var vect = v.sub(entity.body.p, this.targetPos);
		var inner;
		if (entity.isShadowClone) {
			//clones surround
			inner = v.rotate(vect, v.forangle(Math.random() * Math.PI * 2));
		}
		// from player to surround border
		inner = v.mult(vect, SURROUND_DISTANCE/v.len(vect));

		// from me to surround border
		var direction = v.sub(cp.vzero, vect.sub(inner));
		
		this.targetPos = v.add(entity.body.p, direction);
		entity.speed = 4;

		this.completeTask();
	};

	proto.scramble = function scramble(entity) {
		//console.log('scramble');
		this.targetPos = v(Math.random() * 1000 - 500, Math.random() * 1000 - 500);
		entity.speed = 6;
		this.completeTask();
	};

	// MOVING  ----------------------
	proto.moveTo = function moveTo(entity) {
		//console.log('moveTo', this.targetPos, this);
		if (!this.targetPos) {
			//nowhere to go
			this.completeTask();
			return;
		}
		// from me to target
		var direction = v.sub(this.targetPos, entity.body.p);
		if (lengthSq(direction) < GOAL_DISTANCE_SQ) {
			//reached target
			//console.log('moved to target');
			this.completeTask();
			this.targetPos = null;
			this.setAxes1(0, 0);
			//main ninja idles less after moving
			if (!entity.isShadowClone) {
				this.idleTick = 220;
			}
			return;
		}
		direction = v.mult(direction, 1/v.len(direction));
		this.setAxes1(direction.x, -direction.y);
	};

	proto.moveAway = function moveAway(entity) {
		if (!this.targetPos) {
			//nothing to run from
			this.completeTask();
			return;
		}
		var direction = v.sub(entity.body.p, this.targetPos);
		if (lengthSq(direction) > AVOID_DISTANCE_SQ) {
			//evaded target
			//console.log('evaded target');
			this.completeTask();
			this.targetPos = null;
			this.setAxes1(0, 0);
			return;
		}
		direction = v.mult(direction, 1/v.len(direction));
		this.setAxes1(direction.x, -direction.y);
	};

	proto.shuv = function shuv(entity) {
		//console.log('shuv');
		entity.speed = 6;
		this.targetNearestEnemy(entity);
		this.moveTo(entity);
	};

	proto.kageNoBunshin = function kageNoBunshin(entity) {
		if (entity.isShadowClone) {
			this.completeTask();
			return;
		} else if (ec.world.entities.length > MAX_ENTITIES) {
			this.completeTask();
			this.goal.met = true;
			return;
		}
		this.turns = this.turns || 0;
		this.turns += 0.5;
		entity.body.a += 0.5;
		if (this.turns > 11) {
			this.turns = 0;
			//console.log('kage No Bunshin!!!');
			this.completeTask();
		}
	};

	proto.makeClones = function makeClones(entity) {
		this.clones = this.clones || 0;
		if (++this.clones > NUMBER_OF_CLONES_AT_ONCE || ec.world.entities.length > MAX_ENTITIES) {
			this.clones = 0;
			this.completeTask();
			//console.log('made all clones');
		} else {
			entity.shadowClone();
		}
	};

	proto.throwStar = function throwStar(entity) {
		this.throwTick = this.throwTick || 0;
		this.throwTick++;
		if (this.throwTick > Math.random() * 300) {
			this.throwTick = 0;
			this.completeTask();
		}
	};

	proto.idle = function idle(entity) {
		this.idleTick = this.idleTick || 0;
		this.idleTick++;
		if (this.idleTick > 40 + 200 * Math.random()) {
			this.idleTick = 0;
			this.completeTask();
		}
	};

	var goalTree = {
		surround: {
			name: 'surround',
			tasks: [
				proto.targetNearestEnemyBorder,
				proto.moveTo,
				proto.idle
			]
		},
		shadowClone: {
			name: 'shadow clone',
			tasks: [
				proto.kageNoBunshin,
				proto.makeClones,
				proto.scramble,
				proto.moveTo
			]
		},
		throwStars: {
			name: 'throw stars',
			tasks: [
				proto.targetNearestEnemy,
				proto.throwStar,
				proto.scramble
			]
		},
		avoid: {
			name: 'avoid',
			tasks: [
				proto.targetNearestEnemy,
				proto.moveAway,
				proto.idle
			]
		},
		rush: {
			name: 'rush',
			tasks: [
				proto.targetNearestEnemy,
				proto.moveTo,
				proto.shuv
			]
		}
	};


})(window);