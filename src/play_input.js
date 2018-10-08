import 'pixi.js';
import 'lodash/core';


export class PlayInput {
    constructor(gameBoard, viewPort) {

        this.playArea = gameBoard;
        this.viewPort = viewPort;
        this.currentGridPos = null;

        viewPort.interactive = true;
        viewPort.on("mousemove", (event) => {this.checkMousePosition(event)});
    }

    checkMousePosition(event) {
        let gridPos = this.playArea.squareForCoords(event.data.getLocalPosition(this.viewPort));
        if (!_.isEqual(gridPos, this.currentGridPos)) {
            this.currentGridPos = gridPos;
            console.log(gridPos);
        }
    }
}