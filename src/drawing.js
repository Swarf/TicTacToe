import 'pixi.js';
import {filters} from "pixi.js";

let Graphics = PIXI.Graphics;
let Point = PIXI.Point;


export class BoardDrawing {
    constructor(stage) {
        this.stage = stage;
    }

    setup() {
        let paddingBig = 50;
        let sizeBig = 480;
        let bigBoard = this.makeGraphic(4, 0x404040, 0.1);
        BoardDrawing.drawGrid(bigBoard, sizeBig, paddingBig);

        let smallBoards = this.makeGraphic(2, 0x555555, 0.0);
        let paddingSmall = 20;
        let sizeSmall = 120;

        let offset = new Point();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                offset.x = paddingBig + (sizeBig / 3) * i;
                offset.y = paddingBig + (sizeBig / 3) * j;
                BoardDrawing.drawGrid(smallBoards, sizeSmall, paddingSmall, offset);
            }
        }
    }

    makeGraphic(lineWeight, color, blur) {
        let graphic = new Graphics();
        graphic.lineStyle(lineWeight, color, 1, 0.5);

        let blurFilter = new filters.BlurFilter();
        blurFilter.blur = blur;
        graphic.filters = [blurFilter];

        this.stage.addChild(graphic);
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
}