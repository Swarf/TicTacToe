import 'pixi.js';
import 'lodash/core';

let renderer = null;
const loader = new PIXI.loaders.Loader();
const Graphics = PIXI.Graphics;
const Sprite = PIXI.Sprite;
let textures;

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

export default async function loadResources(app) {
    let loader = await loadAll();
    renderer = app.renderer;
    console.log(renderer);
    textures = loadTextures();
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

    let red = 0xB5512D;
    let blue = 0x2D91B5;
    let lighten = 0x202020;

    textures['O'] = makeTexture('O', 12, 6, red);
    textures['X'] = makeTexture('X', 12, 7, blue);
    textures['O:hover'] = makeTexture('O', 12, 6, red | lighten);
    textures['X:hover'] = makeTexture('X', 12, 7, blue | lighten);
    textures['O:big'] = makeTexture('O', 35, 12, red);
    textures['X:big'] = makeTexture('X', 35, 15, blue);
    return textures;
}

function makeTexture(shape, radius, lineWeight, color, alpha=1.0) {
    let graphic = new Graphics();
    graphic.lineStyle(lineWeight, color, alpha, 0);

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

    return renderer.generateTexture(graphic);
}
