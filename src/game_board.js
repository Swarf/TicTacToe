import 'lodash';

export const playerMarkers = ['X', 'O'];

export const positions = [
    'TL', 'TC', 'TR',
    'CL', 'CC', 'CR',
    'BL', 'BC', 'BR',
];

const winningRows = [
    ['TL', 'TC', 'TR'],
    ['CL', 'CC', 'CR'],
    ['BL', 'BC', 'BR'],
    ['TL', 'CL', 'BL'],
    ['TC', 'CC', 'BC'],
    ['TR', 'CR', 'BR'],
    ['TL', 'CC', 'BR'],
    ['BL', 'CC', 'TR'],
];


export class GameBoard {
    constructor(ruleCanPlaceInResolved) {
        this.ruleCanPlaceInResolved = ruleCanPlaceInResolved;

        // Map of positions -> maps of position -> undef.
        //  I guess this is the closest I'll ever get to a dict comprehension in js.
        //  Also, this is the only reason I can't use lodash/core.
        this.grid = _.mapValues(_.keyBy(positions), () => _.mapValues(_.keyBy(positions), false));

        this.bigBoard = {};
        _.each(positions, pos => this.bigBoard[pos] = null);
    }

    get(big, small) {
        return this.grid[big][small];
    }

    set(big, small, player) {
        this.grid[big][small] = player;
        let winPositions = null;

        if (!this.bigBoard[big] && player) {
            winPositions = checkForWin(player, this.grid[big], small);
            if (winPositions) {
                this.bigBoard[big] = player;
            }
        }

        return winPositions;
    }

    isFull(big) {
        return positions.every(pos => this.grid[big][pos]);
    }

    nextMoveBoards(move) {
        // Normally, allow only the board of the move position
        let nextTurnBoards = [move];

        // If the move was to a position with a full or resolved board, allow all boards with open space
        if (this.bigBoard[move] || this.isFull(move)) {
            // List boards with remaining spaces by filtering out big boards with number of filled spaces equal to size
            nextTurnBoards = positions.filter(pos => _.size(_.pickBy(this.grid[pos])) !== positions.length);
        }

        if (!this.ruleCanPlaceInResolved) {
            nextTurnBoards = nextTurnBoards.filter((board) => !this.bigBoard[board]);
        }

        return nextTurnBoards;
    }

    checkBigBoardWin(player) {
        checkForWin(player, this.bigBoard)
    }

    boardsNotWon() {
        return _.keys(_.pickBy(this.bigBoard, _.negate(_.identity)))
    }

    getBig(pos) {
        return this.bigBoard[pos];
    }
}

export function checkForWin(player, grid, usingPosition) {
    let possibleWins = usingPosition ? winningRows.filter((row) => row.includes(usingPosition)) : winningRows;
    return possibleWins.find((row) => row.every((pos) => pos === usingPosition || grid[pos] === player));
}