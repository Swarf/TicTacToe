import 'pixi.js';
import {filters} from "pixi.js";

let Graphics = PIXI.Graphics;
let Point = PIXI.Point;


export class BoardDrawing {
    constructor(container) {
        this.container = container;

        this.gridSize = 480;
        this.gridPadding = 50;

        this.smallGridSize = this.gridSize / 4;  // One third of bigger grid is space for small grid, use 3/4ths of that
        this.smallGridPadding = (this.gridSize / 3 - this.smallGridSize) / 2;
    }

    setup() {
        let bigBoard = this.makeGraphic(4, 0x404040, 0.1);
        BoardDrawing.drawGrid(bigBoard, this.gridSize, this.gridPadding);

        let smallBoards = this.makeGraphic(2, 0x555555, 0.0);

        let offset = new Point();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                offset.x = this.gridPadding + (this.gridSize / 3) * i;
                offset.y = this.gridPadding + (this.gridSize / 3) * j;
                BoardDrawing.drawGrid(smallBoards, this.smallGridSize, this.smallGridPadding, offset);
            }
        }
    }

    makeGraphic(lineWeight, color, blur) {
        let graphic = new Graphics();
        graphic.lineStyle(lineWeight, color, 1, 0.5);

        let blurFilter = new filters.BlurFilter();
        blurFilter.blur = blur;
        graphic.filters = [blurFilter];

        this.container.addChild(graphic);
        return graphic;
    }

    static drawGrid(graphic, size, padding, offset) {
        if (!offset) {
            offset = new Point(0, 0);
        }

        // Vertical lines
        for (let i = 1; i < 3; i++) {
            graphic.moveTo(padding + i * (size / 3) + offset.x, padding + offset.y);
            graphic.lineTo(padding + i * (size / 3) + offset.x, padding + size + offset.y);
        }

        // Horizontal lines
        for (let i = 1; i < 3; i++) {
            graphic.moveTo(padding + offset.x, padding + i * (size / 3) + offset.y);
            graphic.lineTo(padding + size + offset.x, padding + i * (size / 3) + offset.y);
        }
    }

    squareForCoords(point) {
        point = pointDelta(a, {x: this.gridPadding, y: this.gridPadding});
        let big = false;
        let small = false;

        if (point.x >= 0 && point.x < this.gridSize && point.y >= 0 && point.y < this.gridSize) {
            big = new Point(
                Math.floor(point.x * 3 / this.gridSize),
                Math.floor(point.y * 3 / this.gridSize)
            );


        }

        return {big: big, small: small};
    }
}

// TODO: Monkey patch into PIXI.Point?
function pointDelta(a, b) {
    return new Point(a.x - b.x, a.y - b.y);
}
