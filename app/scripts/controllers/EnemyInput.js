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
		var goal = this.goal;
		if (!goal || goal.met) {
			goal = this.selectGoal(goal);
		}
		this.goal = goal;
		var task = goal.task;
		if (!task || task.complete) {
			task = this.selectTask(goal);
		}
		if (task) {
			task.apply(this, arguments);
		}
	};

	proto.setAxes1 = function(x, y) {
		this.axes[0] = x;
		this.axes[1] = y;
	};

	proto.selectGoal = function(currentGoal) {
		var goal;
		if (currentGoal === goalTree.surround) {
			goal = goalTree.shadowClone;

		} else if (currentGoal === goalTree.shadowClone) {
			goal = goalTree.throwStars;
			
		} else if (currentGoal === goalTree.throwStars) {
			if (Math.random() > 0.8) { // in Danger - real ninja / hurt
				goal = goalTree.avoid;
			} else {
				goal = goalTree.rush;
			}
		} else {
			goal = goalTree.surround;
		}
		goal.met = false;
		goal.task = null;
		console.log('Enemy goal: ', goal.name);
		return goal;
	};

	proto.selectTask = function(goal) {
		var task, i;
		i = goal.tasks.indexOf(goal.task) +1;
		if (i >= goal.tasks.length) {
			goal.met = true;
			return null;
		}
		task = goal.tasks[i];
		task.complete = false;
		goal.task = task;
		//console.log('Enemy task: ', i);
		return task;
	};

	// goals:
	// 1. surround player
	// 1a. wait
	// 1b. circle
	// 2. kage no bunshin
	// 3. attack (ninja stars)
	// 4. avoid attack (real ninja)
	// 5. rush in groups (1-5 clones)


	var SURROUND_DISTANCE = 250;
	var GOAL_DISTANCE_SQ = 16*16;
	var lengthSq = function(vect) {
		return vect.x * vect.x + vect.y * vect.y;
	};

	proto.targetNearestEnemy = function targetNearestEnemy(entity) {
		this.targetEntity = ec.player;
		this.targetPos = this.targetEntity.body.p;
		// TODO: raycast or query line-of-sight to make this more difficult
		// TODO: search task
		console.log('found nearest');
		this.goal.task.complete = true;
	};

	proto.targetNearestEnemyBorder = function targetNearestEnemyBorder(entity) {
		this.targetNearestEnemy(entity);
		// from player to me
		var vect = v.sub(entity.body.p, this.targetPos);
		// from player to surround border
		var inner = v.mult(vect, SURROUND_DISTANCE/v.len(vect));
		// from me to surround border
		var direction = v.sub(cp.vzero, vect.sub(inner));
		
		this.targetPos = v.add(entity.body.p, direction);
		entity.speed = 4;

		this.goal.task.complete = true;
	};

	proto.moveTo = function moveTo(entity) {
		//console.log('moveTo', this.targetPos, this);
		if (!this.targetPos) {
			//nowhere to go
			this.goal.task.complete = true;
			return;
		}
		// from me to target
		var direction = v.sub(this.targetPos, entity.body.p);
		if (lengthSq(direction) < GOAL_DISTANCE_SQ) {
			//reached target
			console.log('moved to target');
			this.goal.task.complete = true;
			this.targetPos = null;
			this.setAxes1(0, 0);
			return;
		}
		direction = v.mult(direction, 1/v.len(direction));
		this.setAxes1(direction.x, -direction.y);
	};

	proto.moveAway = function moveAway(entity) {

		//this.goal.task.complete = true;
	};

	proto.scramble = function scramble(entity) {

		//this.goal.task.complete = true;
	};

	proto.kageNoBunshin = function kageNoBunshin(entity) {
		this.turns = this.turns || 0;
		this.turns += 0.5;
		entity.body.a += 0.5;
		if (this.turns > 11) {
			this.turns = 0;
			this.goal.task.complete = true;
		}
	};

	proto.makeClones = function makeClones(entity) {
		this.clones = this.clones || 0;
		this.clones++;
		entity.shadowClone();
		if (this.clones > 15) {
			this.clones = 0;
			this.goal.task.complete = true;
		}
	};

	proto.throwStar = function throwStar(entity) {

		//this.goal.task.complete = true;
	};

	var goalTree = {
		surround: {
			name: 'surround',
			tasks: [
				proto.targetNearestEnemyBorder,
				proto.moveTo
			]
		},
		shadowClone: {
			name: 'shadow clone',
			tasks: [
				proto.kageNoBunshin,
				proto.makeClones,
				proto.scramble
			]
		},
		throwStars: {
			name: 'throw stars',
			tasks: [
				proto.targetNearestEnemy,
				proto.throwStar
			]
		},
		avoid: {
			name: 'avoid',
			tasks: [
				proto.targetNearestEnemy,
				proto.moveAway
			]
		},
		rush: {
			name: 'rush',
			tasks: [
				proto.targetNearestEnemy,
				proto.moveTo
			]
		}
	};


})(window);