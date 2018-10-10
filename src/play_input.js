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
        let gridPos = this.playArea.squareForCoords(event.data.getLocalPosition(this.viewPort));
        if (!_.isEqual(gridPos, this.currentGridPos)) {
            this.currentGridPos = gridPos;
            console.log(gridPos);
        }
    }
}