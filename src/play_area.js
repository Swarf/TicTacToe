import 'pixi.js';
import {filters} from "pixi.js";
import {loadGameSprite} from "./loader";


const Container = PIXI.Container;
const Graphics = PIXI.Graphics;
const Point = PIXI.Point;


export class PlayArea extends Container {
    constructor() {
        super();

        this.gridSize = 480;
        this.gridPadding = 30;

        this.smallGridSize = this.gridSize / 4;  // One third of bigger grid is space for small grid, use 3/4ths of that
        this.smallGridPadding = (this.gridSize / 3 - this.smallGridSize) / 2;

        this.hoverSprite = null;
        this.hoverLine = null;

        this.playHintLayer = new Container();
    }

    setup() {
        let bigBoard = this.makeGraphic(4, 0x404040, 0.1);
        PlayArea.drawGrid(bigBoard, this.gridSize, this.gridPadding);

        let smallBoards = this.makeGraphic(2, 0x555555, 0.0);

        let offset = new Point();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                offset.x = this.gridPadding + (this.gridSize / 3) * i;
                offset.y = this.gridPadding + (this.gridSize / 3) * j;
                PlayArea.drawGrid(smallBoards, this.smallGridSize, this.smallGridPadding, offset);
            }
        }
    }

    makeGraphic(lineWeight, color, blur) {
        let graphic = new Graphics();
        graphic.lineStyle(lineWeight, color, 1, 0.5);

        let blurFilter = new filters.BlurFilter();
        blurFilter.blur = blur;
        graphic.filters = [blurFilter];

        this.addChild(graphic);
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

    squareForEvent(event) {
        let point = pointDelta(event.data.getLocalPosition(this), {x: this.gridPadding, y: this.gridPadding});
        let big = false;
        let small = false;

        if (point.x >= 0 && point.x < this.gridSize && point.y >= 0 && point.y < this.gridSize) {
            big = new Point(
                Math.floor(point.x * 3 / this.gridSize),
                Math.floor(point.y * 3 / this.gridSize)
            );

            point = pointDelta(point, {
                x: this.gridSize / 3 * big.x + this.smallGridPadding,
                y: this.gridSize / 3 * big.y + this.smallGridPadding
            });

            if (point.x >= 0 && point.x < this.smallGridSize && point.y >= 0 && point.y < this.smallGridSize) {
                small = new Point(
                    Math.floor(point.x * 3 / this.smallGridSize),
                    Math.floor(point.y * 3 / this.smallGridSize)
                );
            }
        }

        return {big: big, small: small};
    }

    hoverSelection(shape, gridPos, potentialWins) {
        if (this.hoverSprite) {
            this.removeHover();
        }

        let sprite = loadGameSprite(shape + ':hover');
        sprite.position.set(...this.smallCenterOffset(gridPos));
        this.hoverSprite = sprite;

        let lb = sprite.getLocalBounds();
        let hitPadding = this.smallGridSize / 3 - lb.width;
        sprite.hitArea = new PIXI.Rectangle(
            lb.x - hitPadding,
            lb.y - hitPadding,
            lb.width + hitPadding * 2,
            lb.height + hitPadding * 2
        );

        if (potentialWins) {
            this.hoverLine = this.makeWinLineSprite(potentialWins, shape, ':hover');
            this.addChild(this.hoverLine);
        }

        this.addChild(sprite);
        return sprite;
    }

    removeHover() {
        if (this.hoverSprite) {
            this.removeChild(this.hoverSprite);
            this.hoverSprite = null;

            if (this.hoverLine) {
                this.removeChild(this.hoverLine);
                this.hoverLine = null;
            }
        }
    }

    place(shape, gridPos) {
        let sprite = loadGameSprite(shape);
        sprite.position.set(...this.smallCenterOffset(gridPos));

        this.addChild(sprite);
    }

    markSolved(shape, gridPos, winningSquares) {
        let bigSprite = loadGameSprite(shape + ':big');
        bigSprite.position.set(...this.smallCenterOffset({big: gridPos.big, small: {x: 1, y: 1}}));

        this.addChild(bigSprite);

        let winLineSprite = this.makeWinLineSprite(winningSquares, shape);
        this.addChild(winLineSprite);
    }

    /* Assumes winning squares are sorted */
    makeWinLineSprite(winningSquares, shape, modifier = '') {
        let xDir = (winningSquares[2].small.x - winningSquares[0].small.x) / 2;
        let yDir = (winningSquares[2].small.y - winningSquares[0].small.y) / 2;

        let sprite;
        if (xDir === 0) {
            sprite = loadGameSprite(`${shape}:col${modifier}`);
        } else if (yDir === 0) {
            sprite = loadGameSprite(`${shape}:row${modifier}`);
        } else {
            sprite = loadGameSprite(`${shape}:diag${modifier}`);
            if (xDir * yDir < 0) {
                sprite.rotation = Math.PI / 2;
            }
        }

        sprite.position.set(...this.smallCenterOffset(winningSquares[1]));
        return sprite;
    }

    smallCenterOffset(gridPos) {
        let bigOffsetX = this.gridPadding + this.gridSize * gridPos.big.x / 3;
        let bigOffsetY = this.gridPadding + this.gridSize * gridPos.big.y / 3;
        return [
            bigOffsetX + this.smallGridPadding + this.smallGridSize * (0.5 + gridPos.small.x) / 3,
            bigOffsetY + this.smallGridPadding + this.smallGridSize * (0.5 + gridPos.small.y) / 3
        ];
    }

    winningLinePoints(squareA, squareB) {
        let pointA = new Point(...this.smallCenterOffset(squareA));
        let pointB = new Point(...this.smallCenterOffset(squareB));

        let delta = pointDelta(pointA, pointB);
        pointA.set(pointA.x + delta.x / 5, pointA.y + delta.y / 5);
        pointB.set(pointB.x - delta.x / 5, pointA.y - delta.y / 5);

        return {
            from: pointA,
            to: pointB
        }
    }
}

// TODO: Monkey patch these two into PIXI.Point?
function pointDelta(a, b) {
    return new Point(a.x - b.x, a.y - b.y);
}

function pointDistance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
