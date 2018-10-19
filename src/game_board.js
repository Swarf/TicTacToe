import 'lodash';

const positions = [
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

const playerMarkers = ['X', 'O'];
const firstPlayer = playerMarkers[0];
const ruleCanPlaceInResolved = false;


export class GameBoard {
    constructor() {
        // Map of positions -> maps of position -> undef.
        //  I guess this is the closest I'll ever get to a dict comprehension in js.
        //  Also, this is the only reason I can't use lodash/core.
        this.grid = _.mapValues(_.keyBy(positions), () => _.mapValues(_.keyBy(positions), false));

        this.outcomes = {};
        _.each(positions, pos => this.outcomes[pos] = null);

        this.nextTurnBoards = positions;
        this.atBat = firstPlayer;
    }

    place(player, bigPos, smallPos) {
        let boardWin = false;

        if (!this.isAllowed(bigPos, smallPos)) {
            throw new Error(`GameBoard.place - position not allowed: ${bigPos},${smallPos}`);
        }

        if (player !== this.atBat) {
            throw new Error(`GameBoard.place - ${player} is not current player`);
        }

        this.grid[bigPos][smallPos] = player;
        this.atBat = playerMarkers[1 - playerMarkers.indexOf(player)];

        // List boards with remaining spaces by filtering out big boards with number of filled spaces equal to size
        let boardsWithSpace = positions.filter(pos => _.size(_.pickBy(this.grid[pos])) !== _.size(this.grid[pos]));

        // Evaluate whether this action won the square
        if (!this.outcomes[bigPos]) {
            let smallWin = this.checkForWin(player, this.grid[bigPos], smallPos);
            if (smallWin) {
                this.outcomes[bigPos] = player;
                boardWin = {
                    position: bigPos,
                    squares: smallWin,
                    player: player
                };
            } else if (!boardsWithSpace.includes(bigPos)) {
                // Board wasn't won but it is full
                boardWin = {
                    position: bigPos,
                    player: false
                }
            }
        }

        if (this.outcomes[smallPos] || !boardsWithSpace.includes(smallPos)) {
            this.nextTurnBoards = boardsWithSpace;
        } else {
            this.nextTurnBoards = [smallPos];
        }

        if (!ruleCanPlaceInResolved) {
            this.nextTurnBoards = this.nextTurnBoards.filter((board) => !this.outcomes[board]);
        }

        // TODO check for tie game

        // Evaluate whether the this action has won the game

        return {
            game: this.checkForWin(player, this.outcomes),
            board: boardWin,
            nextPlayer: this.atBat,
            nextBoards: this.nextTurnBoards
        }
    }

    isAllowed(bigPos, smallPos) {
        // Is this board fair game for placement?
        if (this.nextTurnBoards && !this.nextTurnBoards.includes(bigPos)) {
            return false;
        }

        // Is the space free?
        return !this.grid[bigPos][smallPos];
    }

    checkForWin(player, grid, usingPosition) {
        if (_.isString(grid)) {
            grid = this.grid[grid];
        }
        let possibleWins = usingPosition ? winningRows.filter((row) => row.includes(usingPosition)) : winningRows;
        return possibleWins.find((row) => row.every((pos) => pos === usingPosition || grid[pos] === player));
    }
}
