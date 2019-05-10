
const playerMarkers = ['X', 'O'];

export const positions = [
    'TL', 'TC', 'TR',
    'CL', 'CC', 'CR',
    'BL', 'BC', 'BR',
];

export const winningRows = [
    ['TL', 'TC', 'TR'],
    ['CL', 'CC', 'CR'],
    ['BL', 'BC', 'BR'],
    ['TL', 'CL', 'BL'],
    ['TC', 'CC', 'BC'],
    ['TR', 'CR', 'BR'],
    ['TL', 'CC', 'BR'],
    ['BL', 'CC', 'TR'],
];

export function checkForWin(player, grid, usingPosition) {
    let possibleWins = usingPosition ? winningRows.filter((row) => row.includes(usingPosition)) : winningRows;
    return possibleWins.find((row) => row.every((pos) => pos === usingPosition || grid[pos] === player));
}

export function opponentOf(player) {
    // TODO validity check?
    return playerMarkers[1 - playerMarkers.indexOf(player)]
}

export function nextMovesAllowed(board, move) {
    // This is optimized to assume that the grid contains both the small boards as well as the board outcomes
    // Also, boards which are full should be swapped out for null
    // Eg. {TL: {...}, TC: 'X', TR: null, ...}

    // Normally, allow only the board of the move position
    let nextTurnGrids = [move];

    // If the move was to a position with a full or resolved board, allow all boards with open space
    if (typeof board[move] === 'string' || board[move] === null) {
        // List boards with remaining spaces by filtering out big boards with number of filled spaces equal to size
        nextTurnGrids = positions.filter(pos => typeof board[pos] !== 'string' && board[pos] !== null);
    }

    return nextTurnGrids;
}

export function takeMove(board, player, big, small) {
    board[big][small] = player;
    let win = null;

    if (checkForWin(player, board[big], small)) {
        board[big] = player;
        win = player;
    } else if (positions.every(pos => board[big][pos])) {
        board[big] = null;
    }

    board['next'] = nextMovesAllowed(board, small);
    return win;
}
