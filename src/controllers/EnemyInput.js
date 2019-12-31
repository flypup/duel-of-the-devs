import global from '../global';
import GoalBasedInput from './GoalBasedInput';
import Formations from './Formations';
import Dot from '../models/Dot';

const cp = window.cp;
const v = cp.v;

export default class EnemyInput extends GoalBasedInput {

    selectGoal() {
        let index = this.goalIndex + 1;
        if (index >= this.goals.length) {
            index = 0;
        }
        const goal = this.goals[index];
        this.goalIndex = index;
        return goal;
    }

    constructor() {
        super();
        // this.setBaseProperties();

        this.turns = 0;
        this.clones = 0;

        this.formations = new Formations();

        /** TASKS ***********************************/

        // TARGETING ----------------------
        const targetNearestEnemy = function () {
            // TODO: raycast or query line-of-sight to make this more difficult
            // TODO: search task

            this.targetEntity = global.player;
            //console.log('found nearest');

            this.completeTask();
        };

        const targetNearestEnemyPos = function () {
            this.targetEntity = global.player;
            this.updateTargetPos();
            this.completeTask();
        };

        function scramble() {
            return function scrambleTask(entity) {
                //console.log('scramble');

                this.setTargetPos(global.world.getRandomMapPosition());

                entity.speed = 22;
                this.completeTask();
            };
        }

        // MOVING  ----------------------
        function moveTo(distance = GOAL_DISTANCE) {
            return function moveToTask(entity) {
                //console.log('moveTo', this.targetPos, this);
                if (!this.targetPos) {
                    //nowhere to go
                    this.setAxes1(0, 0);
                    this.completeTask();
                    return;
                }
                // from me to target
                const pos = entity.getPos();
                const direction = v.sub(this.targetPos, pos);
                // See direction in world
                // if (global.debug > 1) {
                // 	var targetPos = v.lerpconst(pos, direction, distance);
                // 	global.world.add( Dot.create(500, 'rgba(200, 0, 200, 1.0)').setPos(targetPos.x, targetPos.y, pos.z) );
                // }
                if (lengthSq(direction) < distance * distance) {
                    //reached target
                    //console.log('moved to target');
                    this.completeTask();
                    const angle = this.targetAngle;
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

        function moveAway(distance = AVOID_DISTANCE) {
            return function moveAwayTask(entity) {
                if (!this.targetPos) {
                    //nothing to run from
                    this.completeTask();
                    return;
                }
                const pos = entity.getPos();
                const direction = v.sub(pos, this.targetPos);

                // TODO: validate ideal position / line query for obstacles
                const targetPos = v.add(this.targetPos, v.clamp(direction, -distance));
                // See direction in world
                if (global.debug > 1) {
                    global.world.add(Dot.create(5000, 'rgba(0, 0, 0, 1.0)').setPos(targetPos.x, targetPos.y, pos.z));
                }
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

        function findObstacles(targetPos, entity) {
            const obstacles = global.world.queryStatic(targetPos, entity.radius);
            if (obstacles.length) {
                for (let i = obstacles.length; i--;) {
                    const obj = obstacles[i];
                    // if top of obstacle is climable, next
                    if (!obj.isEntity && obj.z + obj.depth <= entity.z + entity.climbHeight) {
                        obstacles.splice(i, 1);
                    }
                }
            } else {
                obstacles.push('out of bounds');
            }
            return obstacles;
        }

        function moveToDistance(distance = AVOID_DISTANCE) {
            return function moveToDistanceTask(entity) {
                if (!this.targetPos) {
                    //nowhere to go
                    this.completeTask();
                    return;
                }
                // from me to target
                const pos = entity.getPos();
                const direction = v.sub(this.targetPos, pos);
                let targetPos, obstacles;

                if (lengthSq(direction) > distance * distance + GOAL_DISTANCE * GOAL_DISTANCE) {
                    // far from target

                    targetPos = v.add(this.targetPos, v.clamp(direction, -distance));
                    // validate target postion
                    obstacles = findObstacles(targetPos, entity);
                    if (obstacles.length === 0) {
                        // See direction in world
                        if (global.debug > 1) {
                            global.world.add(Dot.create(5000, 'rgba(255, 255, 255, 1.0)').setPos(targetPos.x, targetPos.y, pos.z).setAngle(direction));
                        }

                        vnormalize(direction, true);
                        this.setAxes1(direction.x, direction.y);
                        return;
                    } else {
                        //console.log('obstacles closing in', obstacles);
                        if (global.debug > 1) {
                            global.world.add(Dot.create(7500, 'rgba(255, 200, 200, 1.0)').setPos(targetPos.x, targetPos.y, pos.z).setAngle(direction));
                        }
                        // TODO: select next best location based on formation (arc around target / obstacle)
                    }

                } else if (lengthSq(direction) < distance * distance) {
                    // too close to target
                    direction.neg();

                    targetPos = v.add(this.targetPos, v.clamp(direction, -distance));
                    // validate target postion
                    obstacles = findObstacles(targetPos, entity);
                    if (obstacles.length === 0) {
                        // See direction in world
                        if (global.debug > 1) {
                            global.world.add(Dot.create(5000, 'rgba(0, 0, 0, 1.0)').setPos(targetPos.x, targetPos.y, pos.z).setAngle(direction));
                        }

                        vnormalize(direction, true);
                        this.setAxes1(direction.x, direction.y);
                        return;
                    } else {
                        //console.log('obstacles evading', obstacles);
                        if (global.debug > 1) {
                            global.world.add(Dot.create(7500, 'rgba(155, 100, 100, 1.0)').setPos(targetPos.x, targetPos.y, pos.z).setAngle(direction));
                        }
                    }
                    // TODO: select next best location based on formation (arc around target / obstacle)

                }
                // within range of target
                this.completeTask();
                this.targetPos = null;
                this.setAxes1(0, 0);
                entity.setAngle(direction, 0);
            };
        }

        // STALK / FACE / AVOID  ----------------------
        // function approachTarget(distance = GOAL_DISTANCE, speed = 22) {
        //     var move = moveTo(distance);
        //     return function approachTargetTask(entity) {
        //         entity.speed = speed;
        //         this.updateTargetPos();
        //         move.apply(this, arguments);
        //     };
        // }

        function faceOffTarget(distance = GOAL_DISTANCE, speed = 22, frequency) {
            const move = moveToDistance(distance);
            return function faceOffTargetTask(entity, delta) {
                entity.speed = speed;
                if (frequency) {
                    if (this.frequencyPos >= frequency) {
                        this.frequencyPos -= frequency;
                        this.updateTargetPos();
                    } else {
                        this.frequencyPos += delta;
                    }
                }
                move.apply(this, arguments);
            };
        }

        // function evadeTarget(distance = GOAL_DISTANCE, speed = 22) {
        //     var move = moveToDistance(distance);
        //     return function evadeTargetTask(entity) {
        //         entity.speed = speed;
        //         this.updateTargetPos();
        //         move.apply(this, arguments);
        //     };
        // }

        function shuv() {
            const move = moveTo(0, 29);
            return function shuvTask() {
                //console.log('shuv');
                targetNearestEnemy.apply(this, arguments);
                move.apply(this, arguments);
            };
        }

        function kageNoBunshin(maxNumberOfClones, numberOfClonesToMake) {
            maxNumberOfClones = maxNumberOfClones || 7;
            numberOfClonesToMake = numberOfClonesToMake || maxNumberOfClones;
            const makeClonesJutsu = makeClones(maxNumberOfClones, numberOfClonesToMake);
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
                const shadowClones = entity.getClones();
                const length = Math.min(maxLength, shadowClones.length);

                const targetPos = this.updateTargetPos();
                const leaderPos = entity.getPos();
                const formation = this.formations.lineupPositions(leaderPos, targetPos, length, spacing, minDistance);

                //validate formation positions
                const positions = formation.positions;
                let obstacles;
                const targetX = targetPos ? targetPos.x : 0;
                const targetY = targetPos ? targetPos.y : 0;
                for (let i = positions.length; i--;) {
                    const pos = positions[i];
                    const formationPos = v(pos.x + targetX, pos.y + targetY);
                    // validate formation postion
                    obstacles = findObstacles(formationPos, entity);
                    if (obstacles.length) {
                        // TODO: better fallback positions for formations
                        //positions.splice(i, 1);
                        positions[i] = global.world.getRandomMapPosition();//leaderPos;//
                        //console.log('clonesFormLineTask', obstacles, positions.length, pos);
                        if (global.debug > 1) {
                            global.world.add(Dot.create(4000, 'rgba(255, 200, 100, 1.0)').setPos(formationPos.x, formationPos.y, entity.z));
                        }
                    }
                }

                const solution = this.formations.updateUnitsHungarian(shadowClones, formation.positions, length);
                assignPositionsUsingSolution(shadowClones, formation, solution, length, targetPos);
                //assignPositions(shadowClones, formation, length, targetPos);

                this.completeTask();
            };
        }

        function clonesFormCircleWithLeader(radius, maxLength) {
            radius = radius || 256;
            maxLength = maxLength || 100;
            return function clonesFormCircleWithLeaderTask(entity) {
                const shadowClones = entity.getClones().slice(0);
                shadowClones.unshift(entity);
                const length = Math.min(maxLength, shadowClones.length);

                const targetPos = this.updateTargetPos();
                const leaderPos = entity.getPos();
                const formation = this.formations.circlePositions(leaderPos, targetPos, length, radius);

                //validate formation positions
                const positions = formation.positions;
                let obstacles;
                const targetX = targetPos ? targetPos.x : 0;
                const targetY = targetPos ? targetPos.y : 0;
                for (let i = positions.length; i--;) {
                    const pos = positions[i];
                    const formationPos = v(pos.x + targetX, pos.y + targetY);
                    // validate formation postion
                    obstacles = findObstacles(formationPos, entity);
                    if (obstacles.length) {
                        // TODO: better fallback positions for formations
                        //positions.splice(i, 1);
                        positions[i] = global.world.getRandomMapPosition();//leaderPos;//
                        //console.log('clonesFormCircleWithLeaderTask', obstacles, positions.length, pos);
                        if (global.debug > 1) {
                            global.world.add(Dot.create(4000, 'rgba(255, 200, 100, 1.0)').setPos(formationPos.x, formationPos.y, entity.z));
                        }
                    }
                }

                const solution = this.formations.updateUnitsHungarian(shadowClones, formation.positions, length);
                assignPositionsUsingSolution(shadowClones, formation, solution, length, targetPos);
                //assignPositions(shadowClones, formation, length, targetPos);

                this.completeTask();
            };
        }

        function clonesFormCircle(radius, maxLength) {
            radius = radius || 256;
            maxLength = maxLength || 100;
            return function clonesFormCircleTask(entity) {
                const shadowClones = entity.getClones();
                const length = Math.min(maxLength, shadowClones.length);

                const targetPos = this.updateTargetPos();
                const leaderPos = entity.getPos();
                const formation = this.formations.circlePositions(leaderPos, targetPos, length, radius);

                //validate formation positions
                const positions = formation.positions;
                let obstacles;
                const targetX = targetPos ? targetPos.x : 0;
                const targetY = targetPos ? targetPos.y : 0;
                for (let i = positions.length; i--;) {
                    const pos = positions[i];
                    const formationPos = v(pos.x + targetX, pos.y + targetY);
                    // validate formation postion
                    obstacles = findObstacles(formationPos, entity);
                    if (obstacles.length) {
                        // TODO: better fallback positions for formations
                        //positions.splice(i, 1);
                        positions[i] = global.world.getRandomMapPosition();//leaderPos;//
                        //console.log('clonesFormCircleTask', obstacles, positions.length, pos);
                        if (global.debug > 1) {
                            global.world.add(Dot.create(4000, 'rgba(255, 200, 100, 1.0)').setPos(formationPos.x, formationPos.y, entity.z));
                        }
                    }
                }

                const solution = this.formations.updateUnitsHungarian(shadowClones, formation.positions, length);
                assignPositionsUsingSolution(shadowClones, formation, solution, length, targetPos);
                //assignPositions(shadowClones, formation, length, targetPos);

                this.completeTask();
            };
        }

        function assignPositionsUsingSolution(units, formation, solution, length, targetPos) {
            length = length || solution.length;
            const targetX = targetPos ? targetPos.x : 0;
            const targetY = targetPos ? targetPos.y : 0;
            const positions = formation.positions;
            const angles = formation.angles;
            let obstacles;
            for (let i = 0; i < length; i++) {
                const pos = positions[solution[i][0]];
                const angle = angles[solution[i][0]];
                const entity = units[solution[i][1]];
                const unitInput = entity.input;
                const formationPos = unitInput.targetPos || v(0, 0);

                formationPos.x = pos.x + targetX;
                formationPos.y = pos.y + targetY;
                if (unitInput.targetPos === null) {
                    // validate formation postion
                    obstacles = findObstacles(formationPos, entity);
                    if (obstacles.length === 0) {
                        unitInput.setTargetPos(formationPos);
                    } else {
                        //console.log('formation obstacles', obstacles, formationPos);
                        if (global.debug > 1) {
                            global.world.add(Dot.create(4000, 'rgba(255, 100, 200, 1.0)').setPos(formationPos.x, formationPos.y, entity.z));
                        }
                        unitInput.completeTask();
                        continue;
                    }
                }
                unitInput.targetAngle = angle;

                if (entity.isShadowClone) {
                    unitInput.setGoal({
                        name: 'move to',
                        tasks: [
                            moveTo(GOAL_DISTANCE / 2)
                        ]
                    });
                }
            }
        }

        // function assignPositions(units, formation, length, targetPos) {
        //     length = length || units.length;
        //     var targetX = targetPos ? targetPos.x : 0;
        //     var targetY = targetPos ? targetPos.y : 0;
        //     var positions = formation.positions;
        //     var angles = formation.angles;
        //     for (var i = 0; i < length; i++) {
        //         var pos = positions[i];
        //         var angle = angles[i];
        //         var entity = units[i];
        //         var unitInput = entity.input;
        //         var formationPos = unitInput.targetPos || v(0, 0);
        //
        //         formationPos.x = pos.x + targetX;
        //         formationPos.y = pos.y + targetY;
        //         if (unitInput.targetPos === null) {
        //             unitInput.setTargetPos(formationPos);
        //         }
        //         unitInput.targetAngle = angle;
        //         if (entity.isShadowClone) {
        //             unitInput.setGoal({
        //                 name: 'move to',
        //                 tasks: [
        //                     moveTo(GOAL_DISTANCE / 2)
        //                 ]
        //             });
        //         }
        //     }
        // }

        // TODO: rotate positions: shift assignments so units cycle through positions, # of positons 1-N, 0 (constant)


        function waitForClonesToFinish(timeoutAfter) {
            timeoutAfter = timeoutAfter || 1000;
            return function waitForClonesToFinishTask(entity) {
                if (this.goal.taskTime < timeoutAfter) {
                    const shadowClones = entity.getClones();
                    for (let i = 0; i < shadowClones.length; i++) {
                        const input = shadowClones[i].input;
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
                const shadowClones = entity.getClones();
                for (let i = 0; i < shadowClones.length; i++) {
                    const input = shadowClones[i].input;
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
        const HIGH_SPEED = 43;
        const UPDATE_FREQUENCY = 1000 / 10;

        const goalTree = {
            faceOff: {
                name: 'face off',
                tasks: [
                    targetNearestEnemy,
                    faceOffTarget(200, HIGH_SPEED, UPDATE_FREQUENCY),
                    idle(250)
                ]
            },
            formLine: {
                name: 'formation line',
                tasks: [
                    targetNearestEnemy,
                    faceOffTarget(350, HIGH_SPEED, UPDATE_FREQUENCY),
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
                    moveTo(GOAL_DISTANCE / 2),
                    idle(1500)
                ]
            },
            formCircle: {
                name: 'formation circle',
                tasks: [
                    targetNearestEnemy,
                    faceOffTarget(360, null, UPDATE_FREQUENCY),
                    kageNoBunshin(8),
                    //makeClones(8),
                    clonesFormCircle(200),
                    idle(1500)

                ]
            },
            circleTarget: {
                name: 'circle target',
                tasks: [
                    idle(1),
                    targetNearestEnemy,
                    throwStars()
                    // TODO: tell clones run around target with me
                ]
            },
            rush: {
                name: 'rush',
                tasks: [
                    targetNearestEnemyPos,
                    moveTo(100),
                    shuv(),
                    kageNoBunshin(18)
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
                    moveTo(GOAL_DISTANCE / 2)
                ]
            },
        };

        this.goals = [
            //goalTree.faceOff,
            goalTree.formLine,
            goalTree.waitForClones,
            goalTree.throwStars,
            goalTree.formCircleWithLeader,
            goalTree.circleTarget,
            //goalTree.scatter,
            goalTree.formCircle,
            goalTree.rush
            //goalTree.attack // TODO: hand-to-hand combat
            //goalTree.avoid
        ];

        if (global.debug > 1 && this.constructor === EnemyInput) {
            Object.seal(this);
        }

        /** MATH UTILS ***********************************/

        function lengthSq(vect) {
            return vect.x * vect.x + vect.y * vect.y;
        }

        function vnormalize(vect, update) {
            if (!update) {
                vect = global.copy({}, vect);
            }
            const length = Math.sqrt(lengthSq(vect));
            vect.x = vect.x / length;
            vect.y = vect.y / length;
            return vect;
        }

    }
}

global.inputs.EnemyInput = EnemyInput;
