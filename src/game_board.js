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

        this.nextBigBoard = null;
        this.atBat = firstPlayer;
    }

    place(player, bigPos, smallPos) {
        if (!this.isAllowed(bigPos, smallPos)) {
            throw new Error(`GameBoard.place - position not allowed: ${bigPos},${smallPos}`);
        }

        if (player !== this.atBat) {
            throw new Error(`GameBoard.place - ${player} is not current player`);
        }

        this.grid[bigPos][smallPos] = player;
        this.atBat = playerMarkers[1 - playerMarkers.indexOf(player)];

        // TODO evaluate outcome of move, next valid board, and outcome of game
    }

    isAllowed(bigPos, smallPos) {
        // Is this board fair game for placement?
        if (this.nextBigBoard && this.nextBigBoard !== bigPos) {
            return false;
        }

        // Has this board already been resolved?
        if (!ruleCanPlaceInResolved && this.outcomes[bigPos]) {
            return false;
        }

        // Is the space free?
        return !this.grid[bigPos][smallPos];
    }

}
