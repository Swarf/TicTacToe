import 'pixi.js';
import 'lodash/core';


export class PlayInput {
    constructor(gameBoard) {

        this.playArea = gameBoard;
        this.currentGridPos = null;

        gameBoard.interactive = true;
        gameBoard.on("mousemove", (event) => {this.checkMousePosition(event)});
    }

    checkMousePosition(event) {
        let gridPos = this.playArea.squareForEvent(event);
        if (!_.isEqual(gridPos, this.currentGridPos)) {
            this.currentGridPos = gridPos;
            console.log(gridPos);

            if (gridPos.small) {
                this.playArea.hoverSelection('X', gridPos);
            } else {
                this.playArea.removeHover();
            }
        }
    }
}
