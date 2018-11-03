import 'lodash';
import {GameBoard, positions, playerMarkers, checkForWin} from "./game_board";

const firstPlayer = playerMarkers[0];
const ruleCanPlaceInResolved = false;


export default class GameModel {
    constructor() {
        this.board = new GameBoard();
        this.nextTurnBoards = positions;
        this.atBat = firstPlayer;
    }

    place(player, bigPos, smallPos) {
        let boardWin = false;

        if (!this.isAllowed(bigPos, smallPos)) {
            throw new Error(`GameModel.place - position not allowed: ${bigPos},${smallPos}`);
        }

        if (player !== this.atBat) {
            throw new Error(`GameModel.place - ${player} is not current player`);
        }

        let smallWin = this.board.set(bigPos, smallPos, player);

        // List boards with remaining spaces by filtering out big boards with number of filled spaces equal to size
        let boardsWithSpace = this.board.boardsWithSpace();

        // Evaluate whether this action won the square
        if (smallWin) {
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

        this.atBat = playerMarkers[1 - playerMarkers.indexOf(player)];

        if (this.board.getBig(smallPos) || !boardsWithSpace.includes(smallPos)) {
            this.nextTurnBoards = boardsWithSpace;
        } else {
            this.nextTurnBoards = [smallPos];
        }

        if (!ruleCanPlaceInResolved) {
            this.nextTurnBoards = this.nextTurnBoards.filter((board) => !this.board.getBig(board));
        }

        //  Evaluate whether the this action has ended the game
        //      Must be after evaluating individual board outcome
        let gameOutcome = null;
        let gameWin = checkForWin(player, this.board.bigBoard);
        if (gameWin) {
            gameOutcome = {
                squares: gameWin,
                player: player
            };
        } else if (_.isEmpty(this.nextTurnBoards)) {
            gameOutcome = {
                player: false
            };
        }

        if (gameOutcome) {
            this.nextTurnBoards = null;
            this.atBat = null;
        }

        return {
            game: gameOutcome,
            board: boardWin,
            nextPlayer: this.atBat,
            nextBoards: this.nextTurnBoards,
        }
    }

    isAllowed(bigPos, smallPos) {
        // Is this board fair game for placement?
        if (this.nextTurnBoards && !this.nextTurnBoards.includes(bigPos)) {
            return false;
        }

        // Is the space free?
        return !this.board.get(bigPos, smallPos);
    }

    unresolvedGrids() {
        return this.board.boardsNotWon();
    }

    checkForWin(player, grid, usingPosition) {
        if (_.isString(grid)) {
            grid = this.board.grid[grid];
        }
        return checkForWin(player, grid, usingPosition);
    }
}
