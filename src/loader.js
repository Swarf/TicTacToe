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
    textures = loadTextures();
    return loader.resources;
}


export const color = {
    'O': 0xB5512D, // orange-ish
    'X': 0x2D91B5  // blue-ish
};
export const colorDark = {
    'O': 0xA64B29,
    'X': 0x247491
};
const weightO = 6;
const weightX = 7;
const winLineLength = 57;


export function loadGameSprite(spriteName) {
    let hover = spriteName.indexOf(':hover');
    if (hover > 0) {
        spriteName = spriteName.slice(0, hover);
    }

    let sprite = new Sprite(textures[spriteName]);
    sprite.anchor.set(0.5);
    if (hover > 0) {
        sprite.alpha = 0.7;
    }
    return sprite;
}

function loadTextures() {
    let textures = {};

    textures['O'] = makeTexture('O', 12, weightO, color['O']);
    textures['X'] = makeTexture('X', 12, weightX, color['X']);
    textures['O:big'] = makeTexture('O', 35, 12, colorDark['O']);
    textures['X:big'] = makeTexture('X', 35, 15, colorDark['X']);

    for (let shape of ['row', 'col', 'diag']) {
        for (let player of ['O', 'X']) {
            textures[`${player}:${shape}`] = makeTexture(shape, winLineLength, weightX - 1, color[player]);
        }
    }

    return textures;
}

function makeTexture(shape, radius, lineWeight, color) {
    let graphic = new Graphics();
    graphic.lineStyle(lineWeight, color, 1/*alpha*/, 0/*centering*/);

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
        case 'row':
            graphic.moveTo(-radius, 0);
            graphic.lineTo(radius, 0);
            break;
        case 'col':
            graphic.moveTo(0, -radius);
            graphic.lineTo(0, radius);
            break;
        case 'diag':
            graphic.moveTo(-radius, -radius);
            graphic.lineTo(radius, radius);
            break;
        default:
            throw new Error('Unknown tic tac toe shape: ' + shape);
    }

    // graphic.generateCanvasTexture(); // makes fuzzy sprites
    return renderer.generateTexture(graphic);
}
