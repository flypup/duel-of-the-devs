(function(window) {
	'use strict';

	var ec = window.ec;
	var cp = window.cp;
	var v = cp.v;

	var EnemyInput = ec.EnemyInput = function() {
		this.setBaseProperties();

		this.turns = 0;
		this.clones = 0;

		this.formations = new ec.Formations();
		if (ec.debug > 1) {
			Object.seal(this.formations);
		}
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
				this.setAxes1(0, 0);
				this.completeTask();
				return;
			}
			// from me to target
			// TODO: temp vector: tempVectorSubtract(a, b)
			var direction = v.sub(this.targetPos, entity.getPos());
			if (lengthSq(direction) < distance * distance) {
				//reached target
				//console.log('moved to target');
				this.completeTask();
				var angle = this.targetAngle;
				if (angle) {
					entity.body.a = angle;
				} else {
					entity.setAngle(direction, 0);
				}
				this.targetPos = null;
				this.setAxes1(0, 0);
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
			var direction = v.sub(entity.getPos(), this.targetPos);
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
			var direction = v.sub(this.targetPos, entity.getPos());
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
		numberOfClonesToMake = numberOfClonesToMake || maxNumberOfClones;
		var makeClonesJutsu = makeClones(maxNumberOfClones, numberOfClonesToMake);
		return function kageNoBunshinTask(entity) {
			if (entity.getClones().length >= maxNumberOfClones) {
				this.completeTask();
				return;
			}
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
		numberOfClonesToMake = numberOfClonesToMake || numberOfClonesToMake;
		return function makeClonesTask(entity) {
			if (++this.clones > numberOfClonesToMake || entity.getClones().length >= maxNumberOfClones) {
				this.clones = 0;
				this.completeTask();
				//console.log('made all clones');
			} else {
				// TODO: use formation positions when creating clones
				entity.shadowClone();
			}
		};
	}

	function clonesFormLine(spacing, minDistance, maxLength) {
		spacing = spacing || 128;
		minDistance = minDistance || 128;
		maxLength = maxLength || 100;
		return function clonesFormLineTask(entity) {
			var shadowClones = entity.getClones();
			var length = Math.min(maxLength, shadowClones.length);

			var targetPos = this.updateTargetPos();
			var positions = this.formations.lineupPositions(entity.getPos(), targetPos, length, spacing, minDistance);

			var solution = this.formations.updateUnitsHungarian(shadowClones, positions, length);
			assignPositionsUsingSolution(shadowClones, positions, solution, length, targetPos);
			//assignPositions(shadowClones, positions, length, targetPos);

			this.completeTask();
		};
	}

	function clonesFormCircleWithLeader(radius, maxLength) {
		radius = radius || 256;
		maxLength = maxLength || 100;
		return function clonesFormCircleWithLeaderTask(entity) {
			var shadowClones = entity.getClones().slice(0);
			shadowClones.unshift(entity);
			var length = Math.min(maxLength, shadowClones.length);

			var targetPos = this.updateTargetPos();
			var positions = this.formations.circlePositions(entity.getPos(), targetPos, length, radius);

			var solution = this.formations.updateUnitsHungarian(shadowClones, positions, length);
			assignPositionsUsingSolution(shadowClones, positions, solution, length, targetPos);
			//assignPositions(shadowClones, positions, length, targetPos);

			this.completeTask();
		};
	}

	function clonesFormCircle(radius, maxLength) {
		radius = radius || 256;
		maxLength = maxLength || 100;
		return function clonesFormCircleTask(entity) {
			var shadowClones = entity.getClones();
			var length = Math.min(maxLength, shadowClones.length);

			var targetPos = this.updateTargetPos();
			var positions = this.formations.circlePositions(entity.getPos(), targetPos, length, radius);

			var solution = this.formations.updateUnitsHungarian(shadowClones, positions, length);
			assignPositionsUsingSolution(shadowClones, positions, solution, length, targetPos);
			//assignPositions(shadowClones, positions, length, targetPos);

			this.completeTask();
		};
	}

	function assignPositionsUsingSolution(units, positions, solution, length, targetPos) {
		length = length || solution.length;
		var targetX = targetPos ? targetPos.x : 0;
		var targetY = targetPos ? targetPos.y : 0;
		for (var i=0; i<length; i++) {
			var pos       = positions[solution[i][0]];
			var entity    = units[solution[i][1]];
			var unitInput = entity.input;
			var formationPos = unitInput.targetPos || v(0,0);

			formationPos.x = pos.x + targetX;
			formationPos.y = pos.y + targetY;
			if (unitInput.targetPos === null) {
				unitInput.targetPos = formationPos;
			}
			unitInput.targetAngle = pos.angle;

			if (entity.isShadowClone) {
				unitInput.setGoal({
					name: 'move to',
					tasks: [
						moveTo(GOAL_DISTANCE/2)
					]
				});
			}
		}
	}

	function assignPositions(units, positions, length, targetPos) {
		length = length || units.length;
		var targetX = targetPos ? targetPos.x : 0;
		var targetY = targetPos ? targetPos.y : 0;
		for (var i=0; i<length; i++) {
			var pos       = positions[i];
			var entity    = units[i];
			var unitInput = entity.input;
			var formationPos = unitInput.targetPos || v(0,0);

			formationPos.x = pos.x + targetX;
			formationPos.y = pos.y + targetY;
			if (unitInput.targetPos === null) {
				unitInput.targetPos = formationPos;
			}
			unitInput.targetAngle = pos.angle;
			if (entity.isShadowClone) {
				unitInput.setGoal({
					name: 'move to',
					tasks: [
						moveTo(GOAL_DISTANCE/2)
					]
				});
			}
		}
	}

	// TODO: rotate positions: shift assignments so units cycle through positions, # of positons 1-N, 0 (constant)


	function waitForClonesToFinish(timeoutAfter) {
		timeoutAfter = timeoutAfter || 1000;
		return function waitForClonesToFinishTask(entity) {
			if (this.goal.taskTime < timeoutAfter) {
				var shadowClones = entity.getClones();
				for (var i=0; i<shadowClones.length; i++) {
					var input = shadowClones[i].input;
					if (input.goal && !input.goal.met) {
						return;
					}
				}
			}
			this.completeTask();
		};
	}

	function throwStars() {
		return function throwStarsTask(entity) {
			// leader throws stars
			//entity.throwStar(); // setButton()

			//clones throw stars
			var shadowClones = entity.getClones();
			for (var i=0; i<shadowClones.length; i++) {
				var input = shadowClones[i].input;
				if (input.goal && input.goal.met && input.goal.mapCollisions === 0) {
					shadowClones[i].throwStar();
				}
			}
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
	var HIGH_SPEED = 12;

	var goalTree = {
		faceOff: {
			name: 'face off',
			tasks: [
				targetNearestEnemy,
				faceOffTarget(200, HIGH_SPEED),
				idle(250)
			]
		},
		formLine: {
			name: 'formation line',
			tasks: [
				targetNearestEnemy,
				faceOffTarget(350, HIGH_SPEED),
				idle(33),
				kageNoBunshin(8),
				makeClones(8),
				clonesFormLine(80, 200),
				idle(166)
			]
		},
		waitForClones: {
			name: 'wait for clones',
			tasks: [
				waitForClonesToFinish(800)
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
		formCircleWithLeader: {
			name: 'formation circle with leader',
			tasks: [
				targetNearestEnemy,
				kageNoBunshin(8),
				makeClones(8),
				clonesFormCircleWithLeader(360),
				moveTo(GOAL_DISTANCE/2),
				idle(1500)
			]
		},
		formCircle: {
			name: 'formation circle',
			tasks: [
				targetNearestEnemy,
				faceOffTarget(360),
				kageNoBunshin(8),
				makeClones(8),
				clonesFormCircle(200),
				idle(1500)
				
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
		goalTree.formLine,
		goalTree.waitForClones,
		goalTree.throwStars,
		goalTree.formCircleWithLeader,
		//goalTree.circleTarget,
		//goalTree.scatter,
		goalTree.formCircle,
		//goalTree.rush
	];

/** MATH UTILS ***********************************/

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

})(window);