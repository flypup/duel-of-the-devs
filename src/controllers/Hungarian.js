/* Implementation of the Hungarian Algorithm to determine
 * 'best' squad.	This is a 'reverse' implementation.
 * http://twofourone.blogspot.com/2009/01/hungarian-algorithm-in-javascript.html
 * References:
 * http://en.wikipedia.org/wiki/Hungarian_algorithm
 * http://www.ams.jhu.edu/~castello/362/Handouts/hungarian.pdf (Example #2)
 * http://www.public.iastate.edu/~ddoty/HungarianAlgorithm.html // Non-square
 */

/* 2 dimension arrays */
// let skillMatrix = null;
let matrix = null;
let stars = null;
/* Single arrays */
let rCov = [];
let cCov = [];
let rows = 0;
let cols = 0;
let dim = 0;
let solutions = 0; // 'k'
// let FORBIDDEN_VALUE = -999999;


/* Rows MUST BE the Formation (Jobs)
 * Columns MUST BE the Squad (Workers)
 * Therefore, the Rows MUST BE PADDED
 */
export function hungarianAlgortithm(formation, squad) {
    init(formation, squad);
    // Step 1
    matrix = subtractRowMins(matrix);
    // Step 2
    findZeros(matrix);
    var done = false;
    while (!done) {
        // Step 3
        var covCols = coverColumns(matrix);
        if (covCols > solutions - 1) {
            done = true;
        }
        if (!done) {
            // Step 4 (calls Step 5)
            done = coverZeros(matrix);
            while (done) {
                // Step 6
                var smallest = findSmallestUncoveredVal(matrix);
                matrix = uncoverSmallest(smallest, matrix);
                done = coverZeros(matrix);
            }
        }
    }
    return getSolution(formation, squad);
}

function init(formation, squad) {
    cols = squad.length;
    rows = formation.length;
    dim = Math.max(rows, cols);
    solutions = dim;
    // skillMatrix = initMatrix(rows, cols);
    matrix = initMatrix(dim, dim);
    stars = initMatrix(dim, dim);
    matrix = loadMatrix(squad, formation, matrix, false);
    // skillMatrix = loadMatrix(squad, formation, skillMatrix, false);

    rCov = new Array(dim);
    cCov = new Array(dim);
    initArray(cCov, 0); // Zero it out
    initArray(rCov, 0);
}

function initMatrix(sizeX, sizeY) {
    var matrix = new Array(sizeX);
    for (var i = 0; i < sizeX; i++) {
        matrix[i] = new Array(sizeY);
        initArray(matrix[i], 0);
    }
    return matrix;
}

// Takes an array of positions as a formation.
// Takes a squad which contains an array of players
function loadMatrix(squad, formation, matrix, reverse) {

    // I've removed my implementation here. Far too much stuff
    matrix = loadYourMatrix(squad, formation, matrix);

    if (reverse) {
        // This reverses the matrix. We need to to create a cost based solution.
        matrix = reverseMatrix(findMaxValue(matrix), matrix);
    }
    return matrix;
}

function loadYourMatrix(squad, formation, matrix) {
    for (var i = 0; i < matrix.length; i++) {
        var pos = formation[i];
        for (var j = 0; j < matrix[i].length; j++) {
            // TODO: we should just pass two lists of vects
            var entity = squad[j];
            if (entity) {
                var unitPos = squad[j].getPos();
                var x = unitPos.x - pos.x;
                var y = unitPos.y - pos.y;
                matrix[i][j] = x * x + y * y;
            } else {
                matrix[i][j] = 0;
                console.error('entity missing from squad: ' + j + ' ' + squad);
            }

        }
    }
    return matrix;
}

function findMaxValue(matrix) {
    var max = 0.0;
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] > max) {
                max = matrix[i][j];
            }
        }
    }
    return Number(max);
}

function reverseMatrix(max, matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            matrix[i][j] = (Number(max) - Number(matrix[i][j])).toFixed(0);
        }
    }
    return matrix;
}

function subtractRowMins(matrix) {
    for (let i = 0; i < matrix.length; i++) {
        let min = Number.MAX_VALUE;
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] < min) {
                min = Number(matrix[i][j]);
            }
        }
        for (let k = 0; k < matrix[i].length; k++) {
            matrix[i][k] = matrix[i][k] - min;
        }
    }
    return matrix;
}

/*
function subtractColMins(matrix) {
    for (let j = 0; j < matrix[0].length; j++) {
        let min = Number.MAX_VALUE;
        for (let i = 0; i < matrix.length; i++) {
            if (matrix[i][j] < min) {
                min = Number(matrix[i][j]);
            }
        }
        for (let k = 0; k < matrix[0].length; k++) {
            matrix[k][j] = matrix[k][j] - min;
        }
    }
    return matrix;
}
*/

function findZeros(matrix) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] === 0) {
                if (rCov[i] === 0 && cCov[j] === 0) {
                    stars[i][j] = 1;
                    cCov[j] = 1;
                    rCov[i] = 1;
                }
            }
        }
    }
    // Clear Covers
    initArray(cCov, 0);
    initArray(rCov, 0);
}

function initArray(theArray, initVal) {
    for (let i = 0; i < theArray.length; i++) {
        theArray[i] = Number(initVal);
    }
}

function coverColumns(matrix) {
    let count = 0;
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (stars[i][j] === 1) {
                cCov[j] = 1;
            }
        }
    }
    for (let k = 0; k < cCov.length; k++) {
        count = Number(cCov[k]) + Number(count);
    }
    return count;
}

/**
 * step 4
 * Cover all the uncovered zeros one by one until no more
 * cover the row and uncover the column
 */

function coverZeros(matrix) {
    let retVal = true;
    let zero = findUncoveredZero(matrix); // Returns a Coords object..

    while (zero.row > -1 && retVal === true) {
        stars[zero.row][zero.col] = 2; //Prime it
        const starCol = foundStarInRow(zero.row, matrix);
        if (starCol > -1) {
            rCov[zero.row] = 1;
            cCov[starCol] = 0;
        } else {
            starZeroInRow(zero); // Step 5
            retVal = false;
        }
        if (retVal === true) {
            zero = findUncoveredZero(matrix);
        }
    }
    return retVal;
}

function findUncoveredZero(matrix) {
    const coords = new HgCoords();
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] === 0 && rCov[i] === 0 && cCov[j] === 0) {
                coords.row = i;
                coords.col = j;
                j = matrix[i].length;
                i = matrix.length - 1;
            }
        }

    }
    return coords;
}

function foundStarInRow(zeroRow, matrix) {
    let retVal = -1;
    for (let j = 0; j < matrix[zeroRow].length; j++) {
        if (stars[zeroRow][j] === 1) {
            retVal = j;
            j = matrix[zeroRow].length;
        }
    }
    return retVal;
}

/**
 * step 5
 * augmenting path algorithm
 * go back to step 3
 */

function starZeroInRow(zero) { // Takes a Coords Object
    //console.log('Step 5: Uncovered Zero:' + zero.row + ',' + zero.col);
    const path = initMatrix(dim * 2, 2);

    let done = false;
    let count = 0;

    path[count][0] = zero.row;
    path[count][1] = zero.col;
    while (!done) {
        const row = findStarInCol(path[count][1]);
        if (row > -1) {
            count++;
            path[count][0] = row;
            path[count][1] = path[count - 1][1];
        } else {
            done = true;

        }
        if (!done) {
            const col = findPrimeInRow(path[count][0]);
            count++;
            path[count][0] = path[count - 1][0];
            path[count][1] = col;
        }
    }
    convertPath(path, count);

    // Clear Covers
    initArray(cCov, 0);
    initArray(rCov, 0);
    erasePrimes();
}

function findStarInCol(col) {
    let retVal = -1;
    for (let i = 0; i < stars.length; i++) {
        if (stars[i][col] === 1) {
            retVal = i;
            i = stars.length;
        }
    }
    return retVal;
}

function findPrimeInRow(row) {
    let retVal = -1;
    for (let j = 0; j < stars[row].length; j++) {
        if (stars[row][j] === 2) {
            retVal = j;
            j = stars[row].length;
        }
    }
    return retVal;
}

/* Should convert all primes to stars and reset all stars.
 * Count is needed to be sure we look at all items in the path
 */

function convertPath(path, count) {
    //console.log(path, 'Step 5: Converting Path.	Count = ' + count);
    for (let i = 0; i < count + 1; i++) {
        const x = path[i][0];
        const y = path[i][1];
        if (stars[x][y] === 1) {
            stars[x][y] = 0;
        } else if (stars[x][y] === 2) {
            stars[x][y] = 1;
        }
    }
}

function erasePrimes() {
    for (let i = 0; i < stars.length; i++) {
        for (let j = 0; j < stars[i].length; j++) {
            if (stars[i][j] === 2) {
                stars[i][j] = 0;
            }
        }
    }
}

function findSmallestUncoveredVal(matrix) {
    let min = Number.MAX_VALUE;
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (rCov[i] === 0 && cCov[j] === 0) {
                if (min > matrix[i][j]) {
                    min = matrix[i][j];
                }
            }
        }
    }
    return min;
}

/**
 * step 6
 * modify the matrix
 * if the row is covered, add the smallest value
 * if the column is not covered, subtract the smallest value
 */

function uncoverSmallest(smallest, matrix) {
    //console.log('Uncover Smallest: ' + smallest);
    //console.log(matrix, 'B4 Smallest uncovered');

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (rCov[i] === 1) {
                matrix[i][j] += smallest;
            }
            if (cCov[j] === 0) {
                matrix[i][j] -= smallest;
            }
        }
    }
    //console.log(matrix, 'Smallest uncovered');
    return matrix;
}

function getSolution(/* formation, squad */) {
    const positions = [];
    // Changed from length of stars, since we must ignore some rows due to padding.
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (stars[i][j] === 1) {
                /* the player (worker) at index j is the best player
                 * for position (job) at index i in your initial arrays.
                 */
                positions.push([i, j]);
            }
        }
    }
    return positions;
}

function HgCoords() {
    this.row = -1;
    this.col = -1;
}
