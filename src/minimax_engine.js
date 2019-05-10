import {opponentOf, checkForWin, takeMove, winningRows, positions} from "./nonplayer_board";
import _ from "lodash/core";


function minimaxGridScore(grid, active) {
    // TODO optimize
    // Potentially over-scores two rows with 2 markers each if the empty marker is shared
    const opponent = opponentOf(active);
    let score = 0;

    for (let row of winningRows) {
        let playerCount = 0;
        let oppoCount = 0;

        for (let pos of row) {
            if (grid[pos] === active) {
                playerCount++;
            } else if (grid[pos] === opponent) {
                oppoCount++;
            }
        }

        if (playerCount === 3) {
            // Assume only player can win because this is done after evaluating their move.
            return Infinity;
        }

        if ((playerCount && !oppoCount) || (!playerCount && oppoCount)) {
            const rowScore = oppoCount + playerCount > 1 ? 10 : 1;
            score += rowScore * (playerCount ? 1 : -1);
        }
    }

    return score;
}


function minimaxGameScore(board, active) {
    if (checkForWin(active, board)) {
        return Infinity;
    }

    if (!board['weights']) {
        board['weights'] = {};
        for (let pos of positions) {
            if (_.isObject(board[pos])) {
                let boardCopy = Object.assign({}, board);
                boardCopy[pos] = active;

                let activeValue = minimaxGridScore(boardCopy, active);
                boardCopy[pos] = opponentOf(active);
                let oppoValue = minimaxGridScore(boardCopy, active);
                let scoreDelta = activeValue - oppoValue;

                board['weights'][pos] = isFinite(scoreDelta) ? scoreDelta : 1000 * Math.sign(scoreDelta);
            }
        }
    }

    let score = 0;
    for (let pos of Object.keys(board['weights'])) {
        if (board['weights'][pos]) {
            if (!board[pos]['score']) {
                board[pos]['score'] = minimaxGridScore(board[pos], active);
            }
            score += board['weights'][pos] * board[pos]['score'];
        }
    }

    return score;
}


export function minimax(board, player, depth=1) {
    if (depth === 0) {
        return {
            score: minimaxGameScore(board, player)
        }
    }

    if (checkForWin(player, board)) {
        return {
            score: Infinity
        }
    }

    if (!board['next']) {
        board['next'] = positions;
    }

    const opponent = opponentOf(player);
    let bestPos = null;
    let highestScore = null;

    let boardCopy = Object.assign({}, board);
    for (let square of board['next']) {
        let squareScore = board[square]['score'];

        for (let pos of positions) {
            if (!board[square][pos]) {

                // Step 1:  Prep the board by making the move and setting up for next moves
                let squareCopy = board[square];
                let squareWin = takeMove(boardCopy, player, square, pos);
                board[square]['score'] = null;  // Ensure we calculate the score for this board

                let boardWeights;
                if (squareWin) {
                    boardWeights = boardCopy['weights'];
                    boardCopy['weights'] = null;
                }

                // Step 2:  Get the score
                let {score} = minimax(boardCopy, opponent, depth - 1);
                score = -score;

                // Step 3:  Record the score an move if it is the lowest score
                if (highestScore === null || highestScore < score) {
                    highestScore = score;
                    bestPos = [square, pos];
                }

                // Step 4:  Reset
                // Potentially the grid got swapped out so reset the whole grid then reset the move space.
                boardCopy[square] = squareCopy;
                boardCopy[square][pos] = null;
                if (boardWeights) {
                    boardCopy['weights'] = boardWeights;
                }
            }
        }

        board[square]['score'] = squareScore;
    }

    return {
        move: bestPos,
        score: highestScore
    }
}
