import 'pixi.js';
import 'lodash/core';


const loader = new PIXI.loaders.Loader();
const Graphics = PIXI.Graphics;
const Sprite = PIXI.Sprite;
const textures = loadTextures();

loader.onProgress.add((loader, resource) => {
    console.log(`${resource.url}: ${loader.progress}% done`);
});


async function loadAll() {
    return new Promise((resolve, reject) => {
        loader
            // .add("images/cat.png")
            .load(resolve);

        loader.onError.add(reject);
    });
}

export default async function loadResources() {
    let loader = await loadAll();

    return loader.resources;
}

export function loadGameSprite(spriteName) {
    let sprite = new Sprite(textures[spriteName]);
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    return sprite;
}

function loadTextures() {
    let textures = {};

    textures['O'] = makeTexture('O', 12, 4, 0xFF0000);
    textures['O:hover'] = makeTexture('O', 12, 4, 0xFF5555);
    textures['X'] = makeTexture('X', 12, 4, 0x0000FF);
    textures['X:hover'] = makeTexture('X', 12, 4, 0x5555FF);
    return textures;
}

function makeTexture(shape, radius, lineWeight, color, alpha=1.0) {
    let graphic = new Graphics();
    graphic.lineStyle(lineWeight, color, alpha);

    switch (shape) {
        case 'O':
            graphic.drawCircle(0, 0, radius);
            break;
        case 'X':
            graphic.moveTo(-radius, -radius);
            graphic.lineTo(radius, radius);
            graphic.moveTo(radius, -radius);
            graphic.lineTo(-radius, radius);
            break;
        default:
            throw new Error('Unknown tic tac toe shape: ' + shape);
    }

    return graphic.generateCanvasTexture(0);
}
