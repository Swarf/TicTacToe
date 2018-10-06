import 'pixi.js';
import 'lodash/core';


let loader = new PIXI.loaders.Loader();

loader.onProgress.add((loader, resource) => {
    console.log(`${resource.url}: ${loader.progress}% done`);
});


async function loadAll() {
    return new Promise((resolve, reject) => {
        loader
            .add("images/cat.png")
            .load(resolve);

        loader.onError.add(reject);
    });
}

export default async function loadResources() {
    let loader = await loadAll();

    // Post-load processing?

    return loader.resources;
}
