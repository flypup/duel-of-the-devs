(function(window) {
	'use strict';

	var ec = window.ec;

	var ShadowCloneInput = ec.ShadowCloneInput = function() {
		this.axes = [];
		for (var i = 0; i < 4; i++) {
			this.axes[i] = 0;
		}
		this.goal = null;
		this.goalIndex = -1;
	};

	var proto = ShadowCloneInput.prototype;

	proto.poll = function(entity, delta) {
		if (this.state === 'dead') {
			return;
		}
		var goal = this.goal;
		if (!goal || goal.met) {
			return;
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

	proto.setGoal = function(goal) {
		goal.met = false;
		goal.task = null;
		goal.taskIndex = -1;
		goal.taskTime = 0;
		this.goal = goal;
	};

	// TODO: these could be 'inherited' from EnemyInput
	proto.mapCollision = function(entity, mapElement) {
		this.completeTask();
	};

	proto.setAxes1 = function(x, y) {
		this.axes[0] = x;
		this.axes[1] = y;
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
		return task;
	};

	proto.completeTask = function() {
		if (this.task) {
			this.task.complete = true;
		}
	};

})(window);