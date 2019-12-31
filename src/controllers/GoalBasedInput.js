import global from '../global';
import Dot from '../models/Dot';

export default class GoalBasedInput {

    // Descision Loop:
    //   goal set?
    // -  No: set goal
    // - Yes: goal met?
    //      - Yes: set next goal
    //      -  No: goal sub-steps (tasks)

    constructor() {
        this.axes = [0, 0, 0, 0];
        this.buttons = [0, 0, 0, 0]; //this is silly
        this.goal = null;
        this.goalIndex = -1;
        this.targetPos = null;
        this.targetAngle = null;
        this.targetEntity = null;
        this.frequencyPos = 0;
        if (global.debug > 1 && this.constructor === GoalBasedInput) {
            Object.seal(this);
        }
    }

    poll(entity, delta) {
        if (this.state === 'dead') {
            return;
        }
        let goal = this.goal;
        if (!goal || goal.met) {
            goal = this.selectGoal();
            if (goal === null) {
                return;
            }
            this.setGoal(goal);
        }
        let task = goal.task;
        if (!task || task.complete) {
            task = this.selectTask(goal, entity);
        }
        if (task) {
            goal.taskTime += delta;
            task.apply(this, arguments);//[entity]);
        }
    }

    mapCollision(/*entity*/) {
        //this.setAxes1(0, 0);
        this.completeTask();
        if (this.goal) {
            this.goal.mapCollisions++;
            if (this.goal.task) {
                this.goal.task.mapCollisions++;
            }
        }
    }

    setAxes1(x, y) {
        this.axes[0] = x;
        this.axes[1] = y;
    }

    setAxes2(x, y) {
        this.axes[2] = x;
        this.axes[3] = y;
    }

    selectGoal() {
        return null;
    }

    setGoal(goal) {
        goal.met = false;
        goal.task = null;
        goal.taskIndex = -1;
        goal.taskTime = 0;
        goal.mapCollisions = 0;
        this.goal = goal;
    }

    selectTask(goal/*, entity*/) {
        let task, index;
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
        // if (global.debug) {
        //	console.log('Enemy task: ', i);
        // }
        return task;
    }

    completeTask() {
        if (this.goal && this.goal.task) {
            this.goal.task.complete = true;
        }
        this.frequencyPos = 0;
    }

    updateTargetPos() {
        const targetPos = this.targetPos || cp.v(0, 0);
        if (!this.targetEntity) {
            console.error('update target: targetEntity not set');
            this.completeTask();
            return targetPos;
        }
        const pos = this.targetEntity.getPos();
        targetPos.x = pos.x;
        targetPos.y = pos.y;
        this.setTargetPos(targetPos, this.targetEntity.z, 'rgba(0, 200, 0, 1.0)');
        return targetPos;
    }

    setTargetPos(pos, z, debugColor) {
        this.targetPos = pos;
        // See target points in world
        if (global.debug > 1) {
            const dot = Dot.create(5000, debugColor || 'rgba(0, 0, 255, 1.0)');
            z = pos.z || z || 0;
            dot.setPos(pos.x, pos.y, z);
            global.world.add(dot);
        }
    }

}

global.inputs.GoalBasedInput = GoalBasedInput;
