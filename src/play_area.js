import 'pixi.js';
import {filters} from "pixi.js";
import {color as shapeColors, colorDark as shapeColorsDark, loadGameSprite} from "./loader";
import * as Bezier from 'bezier-easing';


const Container = PIXI.Container;
const Graphics = PIXI.Graphics;
const Point = PIXI.Point;
const Text = PIXI.Text;
const TextStyle = PIXI.TextStyle;
const Rectangle = PIXI.Rectangle;


export default class PlayArea extends Container {
    constructor() {
        super();

        this.gridSize = 480;
        this.gridPadding = 30;

        this.smallGridSize = this.gridSize / 4;  // One third of bigger grid is space for small grid, use 3/4ths of that
        this.smallGridPadding = (this.gridSize / 3 - this.smallGridSize) / 2;

        this.hoverSprite = null;
        this.hoverLine = null;

        this.playHints = {      // Array of y * 3 + x
            'O': new Array(9),  // 0 1 2
            'X': new Array(9)   // 3 4 5
        };                      // 6 7 8
    }

    setup() {
        // Lowest layer is play hints
        let playHintLayer = new Container();
        for (let shape of Object.keys(this.playHints)) {
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    let hint = this.makeSquareFill(shapeColors[shape]);
                    hint.position.set(this.gridPadding + x * this.gridSize / 3, this.gridPadding + y * this.gridSize / 3);
                    hint.alpha = 0.2;
                    hint.visible = false;
                    playHintLayer.addChild(hint);
                    this.playHints[shape][y * 3 + x] = hint;
                }
            }
        }
        this.addChild(playHintLayer);

        let smallBoards = this.makeGraphic(2, 0x555555, 0.0);

        let offset = new Point();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                offset.x = this.gridPadding + (this.gridSize / 3) * i;
                offset.y = this.gridPadding + (this.gridSize / 3) * j;
                PlayArea.drawGrid(smallBoards, this.smallGridSize, this.smallGridPadding, offset);
            }
        }

        this.playMarkerLayer = new Container();
        this.addChild(this.playMarkerLayer);

        this.bigSquareLayer = new Container();
        this.addChild(this.bigSquareLayer);

        // Big board should always be at the top
        let bigBoard = this.makeGraphic(4, 0x404040, 0.1);
        PlayArea.drawGrid(bigBoard, this.gridSize, this.gridPadding);

        this.statusLayer = new Container();
        this.addChild(this.statusLayer);

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

    makeSquareFill(color, size) {
        if (!size) {
            size = this.gridSize / 3;
        }
        let graphic = new Graphics();
        graphic.lineStyle(0);
        graphic.beginFill(color);
        graphic.drawRect(0, 0, size, size);
        graphic.endFill();
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
        sprite.hitArea = new Rectangle(
            lb.x - hitPadding,
            lb.y - hitPadding,
            lb.width + hitPadding * 2,
            lb.height + hitPadding * 2
        );

        if (potentialWins) {
            this.hoverLine = this.makeWinLineSprite(shape, potentialWins, ':hover');
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

        this.playMarkerLayer.addChild(sprite);
        this.playHints[shape].forEach((hint) => hint.visible = false);
    }

    nextBoardHint(shape, moveHints) {
        for (let hint of moveHints) {
            this.playHints[shape][hint.x + hint.y * 3].visible = true;
        }
    }

    markSolved(shape, gridPos, winningSquares) {
        let whiteLayer = this.makeSquareFill(0xFFFFFF);
        whiteLayer.alpha = 0.85;
        whiteLayer.position.set(
            this.gridPadding + gridPos.big.x * this.gridSize / 3,
            this.gridPadding + gridPos.big.y * this.gridSize / 3
        );
        this.bigSquareLayer.addChild(whiteLayer);

        if (shape) {
            let bigSprite = loadGameSprite(shape + ':big');
            bigSprite.position.set(...this.smallCenterOffset({big: gridPos.big, small: {x: 1, y: 1}}));
            bigSprite.zIndex = 10;
            this.bigSquareLayer.addChild(bigSprite);

            let winLineSprite = this.makeWinLineSprite(shape, winningSquares);
            this.playMarkerLayer.addChild(winLineSprite);
        }
    }

    /* Assumes winning squares are sorted */
    makeWinLineSprite(shape, winningSquares, modifier = '') {
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

    endGame(shape, winningSquares, unresolved) {
        if (shape) {
            let start = this.smallCenterOffset(winningSquares[0]);
            let end = this.smallCenterOffset(winningSquares[2]);
            this.strikeThrough(shape, start, end);

            // Cover the small boards with no resolution
            for (let pos of unresolved) {
                let whiteLayer = this.makeSquareFill(0xFFFFFF);
                whiteLayer.alpha = 0.85;
                whiteLayer.position.set(
                    this.gridPadding + pos.x * this.gridSize / 3,
                    this.gridPadding + pos.y * this.gridSize / 3
                );
                this.bigSquareLayer.addChild(whiteLayer);
            }
        } else {
            let whiteOverlay = this.makeSquareFill(0xFFFFFF, this.gridSize + this.gridPadding);
            whiteOverlay.alpha = 0.65;
            this.statusLayer.addChild(whiteOverlay);

            let tieText = new Text('TIE');
            tieText.rotation = - Math.PI / 10;

            tieText.style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: 225,
                fontWeight: 'bold',
                fill: [0x749124],
                dropShadow: true,
                dropShadowColor: 0x222b0a,
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 1.3,
                dropShadowDistance: 9,
                dropShadowAlpha: 0.2,
            });

            tieText.anchor.set(0.5);
            tieText.position.set(this.gridPadding + this.gridSize / 2, this.gridPadding + this.gridSize / 2 - 30);
            this.statusLayer.addChild(tieText);
        }
    }

    strikeThrough(shape, start, end) {
        const overSize = 3.5;
        let xDelta = overSize * this.smallGridPadding;
        let yDelta = overSize * this.smallGridPadding;
        const xDir = Math.sign(end[0] - start[0]);
        const yDir = Math.sign(end[1] - start[1]);
        start[0] -= xDelta * xDir;
        start[1] -= yDelta * yDir;
        end[0] += xDelta * xDir;
        end[1] += yDelta * yDir;

        let graphic = new Graphics();
        const curve = Bezier(0.95, 0.05, 0.795, 0.035);
        this.statusLayer.addChild(graphic);

        const duration = 250;
        const finish = Date.now() + duration;
        const animate = () => {
            const now = Date.now();
            const progress = Math.min(1, curve(1 - Math.min((finish - now) / duration, 1)));

            graphic.clear();
            graphic.lineStyle(20, shapeColorsDark[shape]);
            graphic.moveTo(...start);
            graphic.lineTo(...start.map((val, idx) => val + (end[idx] - val) * progress));

            if (now < finish) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    smallCenterOffset(gridPos) {
        let bigOffsetX = this.gridPadding + this.gridSize * gridPos.big.x / 3;
        let bigOffsetY = this.gridPadding + this.gridSize * gridPos.big.y / 3;
        return [
            bigOffsetX + this.smallGridPadding + this.smallGridSize * (0.5 + gridPos.small.x) / 3,
            bigOffsetY + this.smallGridPadding + this.smallGridSize * (0.5 + gridPos.small.y) / 3
        ];
    }

    clearMarkers() {
        this.removeHover();
        this.statusLayer.removeChildren();
        this.playMarkerLayer.removeChildren();
        this.bigSquareLayer.removeChildren();
        Object.values(this.playHints).forEach(shapeHints => shapeHints.forEach((hint) => hint.visible = false));
    }
}

function pointDelta(a, b) {
    return new Point(a.x - b.x, a.y - b.y);
}
