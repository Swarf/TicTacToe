import 'pixi.js';
import 'lodash/core';


let loader = new PIXI.loaders.Loader();
let Graphics = PIXI.Graphics;
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
    let sprite = new PIXI.Sprite(textures[spriteName]);
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    return sprite;
}

function loadTextures() {
    let textures = {};

    let oGraphic = new Graphics();
    oGraphic.lineStyle(4, 0xFF0000);
    oGraphic.drawCircle(0, 0, 12);
    textures['O'] = oGraphic.generateCanvasTexture(0);

    let xGraphic = new Graphics();
    xGraphic.lineStyle(4, 0x0000FF);
    xGraphic.moveTo(-12, -12);
    xGraphic.lineTo(12, 12);
    xGraphic.moveTo(12, -12);
    xGraphic.lineTo(-12, 12);
    textures['X'] = xGraphic.generateCanvasTexture(0);

    return textures;
}