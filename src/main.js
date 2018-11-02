'use strict';

import 'pixi.js';
import loadResources from "./loader";
import PlayArea from "./play_area";
import PlayInput from "./play_input";


Promise.resolve(runApp())
    .catch((err) => {
        console.error('Caught error at App level');
        console.error(err);
    });


async function runApp() {
    const app = createApp();
    const appDiv = document.getElementById('gameApp');
    appDiv.appendChild(app.view);

    await loadResources(app);
    let controller = runGame(app);
    import(/* webpackChunkName: "debug" */ './debug_panel')
        .then(({default: DebugPanel}) => new DebugPanel(controller))
        .catch((err) => console.error('No debug: ' + err));
}


function createApp() {
    //Create a Pixi Application
    const app = new PIXI.Application({
            width: 800,         // default: 800
            height: 600,        // default: 600
            antialias: true,    // default: false
            transparent: false, // default: false
            resolution: 1,
            forceCanvas: true,
        }
    );

    app.renderer.backgroundColor = 0xFFFFFF;
    return app;
}

// Setup creates the app
function runGame(app) {
    let playView = new PlayArea();
    playView.position.set(0, 50);

    let playInput = new PlayInput(playView);

    app.stage.addChild(playView);
    playView.setup();

    return playInput;
}
