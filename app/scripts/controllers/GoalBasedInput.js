(function(window) {

	var ec = window.ec;
	var cp = window.cp;

	var GoalBasedInput = ec.GoalBasedInput = function() {
		this.setBaseProperties();
		if (ec.debug > 1) {
			Object.seal(this);
		}
	};

	// Descision Loop:
	//   goal set?
	// -  No: set goal
	// - Yes: goal met?
	//      - Yes: set next goal
	//      -  No: goal sub-steps (tasks)

	GoalBasedInput.prototype = {
		getBaseProperties: function() {
			return {
				axes: [0, 0, 0, 0],
				buttons: [0, 0, 0, 0], //this is silly
				goal: null,
				goalIndex: -1,
				targetPos: null,
				targetAngle: null,
				targetEntity: null,
				frequencyPos: 0
			};
		},

		setBaseProperties: function() {
			ec.extend(this, this.getBaseProperties());
		},

		poll: function(entity, delta) {
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
		},

		mapCollision: function(entity) {
			//this.setAxes1(0, 0);
			this.completeTask();
			if (this.goal) {
				this.goal.mapCollisions++;
				if (this.goal.task) {
					this.goal.task.mapCollisions++;
				}
			}
		},

		setAxes1: function(x, y) {
			this.axes[0] = x;
			this.axes[1] = y;
		},

		setAxes2: function(x, y) {
			this.axes[2] = x;
			this.axes[3] = y;
		},

		selectGoal: function() {
			return null;
		},

		setGoal: function(goal) {
			goal.met = false;
			goal.task = null;
			goal.taskIndex = -1;
			goal.taskTime = 0;
			goal.mapCollisions = 0;
			this.goal = goal;
		},

		selectTask: function(goal, entity) {
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
		},

		completeTask: function() {
			if (this.goal && this.goal.task) {
				this.goal.task.complete = true;
			}
			this.frequencyPos = 0;
		},

		updateTargetPos: function() {
			var targetPos = this.targetPos || cp.v(0,0);
			if (!this.targetEntity) {
				console.error('update target: targetEntity not set');
				this.completeTask();
				return targetPos;
			}
			var pos = this.targetEntity.getPos();
			targetPos.x = pos.x;
			targetPos.y = pos.y;
			this.setTargetPos(targetPos, this.targetEntity.z, 'rgba(0, 200, 0, 1.0)');
			return targetPos;
		},

		setTargetPos: function(pos, z, debugColor) {
			this.targetPos = pos;
			// See target points in world
			if (ec.debug > 1) {
				var dot = ec.Dot.create(5000, debugColor || 'rgba(0, 0, 255, 1.0)');
				z = pos.z || z || 0;
				dot.setPos(pos.x, pos.y, z);
				ec.world.add(dot);
			}
		}

	};

})(window);