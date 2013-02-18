(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;

	var GoalBasedInput = ec.GoalBasedInput = function() {
		this.setBaseProperties();
	};

	var proto = GoalBasedInput.prototype;

	// Descision Loop:
	//   goal set?
	// -  No: set goal
	// - Yes: goal met?
	//      - Yes: set next goal
	//      -  No: goal sub-steps (tasks)

	proto.getBaseProperties = function() {
		return {
			axes: [0, 0, 0, 0],
			goal: null,
			goalIndex: -1,
			targetPos: null,
			targetAngle: null,
			targetEntity: null
		};
	};

	proto.setBaseProperties = function() {
		ec.extend(this, this.getBaseProperties());
	};

	proto.poll = function(entity, delta) {
		if (this.state === 'dead') {
			return;
		}
		var goal = this.goal;
		if (!goal || goal.met) {
			goal = this.selectGoal();
			if (goal === null) {
				return;
			}
			this.setGoal(goal);
		}
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
		//this.setAxes1(0, 0);
		this.completeTask();
		if (this.goal) {
			this.goal.mapCollisions++;
			if (this.goal.task) {
				this.goal.task.mapCollisions++;
			}
		}
	};

	proto.setAxes1 = function(x, y) {
		this.axes[0] = x;
		this.axes[1] = y;
	};

	proto.setAxes2 = function(x, y) {
		this.axes[2] = x;
		this.axes[3] = y;
	};

	proto.selectGoal = function() {
		return null;
	};

	proto.setGoal = function(goal) {
		goal.met = false;
		goal.task = null;
		goal.taskIndex = -1;
		goal.taskTime = 0;
		goal.mapCollisions = 0;
		this.goal = goal;
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
		task.mapCollisions = 0;
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
		var targetPos = this.targetPos || cp.v(0,0);
		if (!this.targetEntity) {
			console.error('update target: targetEntity not set');
			this.completeTask();
			return targetPos;
		}
		var pos = this.targetEntity.getPos();
		targetPos.x = pos.x;
		targetPos.y = pos.y;
		this.targetPos = targetPos;
		return targetPos;
	};

})(window);