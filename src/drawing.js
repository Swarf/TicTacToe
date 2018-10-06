import 'pixi.js';

let Graphics = PIXI.Graphics;


export class BoardDrawing {
    constructor(stage) {
        this.stage = stage;
    }

    setup() {
        let bigBoard = new Graphics();
        let paddingBig = 50;
        let sizeBig = 300;

        bigBoard.lineStyle(4, 0xFF3300, 1, 0);

        // Vertical lines
        for (let i = 1; i < 3; i++) {
            bigBoard.moveTo(paddingBig + i * (sizeBig / 3), paddingBig);
            bigBoard.lineTo(paddingBig + sizeBig / 3, paddingBig + sizeBig);
        }

        this.stage.addChild(bigBoard);
    }
}