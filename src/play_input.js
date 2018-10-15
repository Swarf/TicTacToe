import 'pixi.js';
import 'lodash/core';


export class PlayInput {
    constructor(playView, gameBoard) {

        this.playView = playView;
        this.gameBoard = gameBoard;
        this.currentGridPos = null;

        playView.interactive = true;
        playView.on("mousemove", (event) => {this.checkMousePosition(event)});
    }

    checkMousePosition(event) {
        let gridPos = this.playView.squareForEvent(event);
        if (!_.isEqual(gridPos, this.currentGridPos)) {
            this.currentGridPos = gridPos;

            let boardPositions = view2board(gridPos);
            if (gridPos.small && this.gameBoard.isAllowed(...boardPositions)) {
                let potentialWins = this.gameBoard.checkForWin(this.gameBoard.atBat, ...boardPositions);
                if (potentialWins) {
                    potentialWins = potentialWins.map(square => (
                        {big: gridPos.big, small: board2viewPoint(square)}
                    ));
                }

                let sprite = this.playView.hoverSelection(this.gameBoard.atBat, gridPos, potentialWins);
                sprite.interactive = true;
                sprite.on("mousedown", () => {this.takeMove(this.gameBoard.atBat, gridPos)});
            } else {
                this.playView.removeHover();
            }
        }
    }

    takeMove(player, gridPos) {
        let outcome = this.gameBoard.place(player, ...view2board(gridPos));
        this.playView.removeHover();
        this.playView.place(player, gridPos);

        if (outcome.board) {
            let gridPos = {big: board2viewPoint(outcome.board.position)};
            let winningSquares = outcome.board.squares.map(square => (
                {big: gridPos.big, small: board2viewPoint(square)}
            ));
            this.playView.markSolved(player, gridPos, winningSquares);
        }
    }
}


// Conversions
const rowMarkers = 'TCB';
const colMarkers = 'LCR';

function board2viewPoint(boardPos) {
    return {x: colMarkers.indexOf(boardPos[1]), y: rowMarkers.indexOf(boardPos[0])};
}

function view2board(gridPos) {
    return [
        view2boardPoint(gridPos.big),
        view2boardPoint(gridPos.small)
    ];
}

function view2boardPoint(gridPoint) {
    return rowMarkers.charAt(gridPoint.y) + colMarkers.charAt(gridPoint.x);
}
