'use strict';

import 'pixi.js';
import loadResources from "./loader";
import './drawing';
import {BoardDrawing} from "./drawing";



Promise.resolve(setup())
    .catch((err) => {
        console.error('Caught error at App level');
        console.error(err);
    });


async function setup() {
    let app = createApp();
    document.body.appendChild(app.view);

    // let resources = await loadResources();

    testApp(app);
}

function createApp() {
    //Create a Pixi Application
    let app = new PIXI.Application({
            width: 800,         // default: 800
            height: 600,        // default: 600
            antialias: true,    // default: false
            transparent: false, // default: false
            resolution: 1       // default: 1
        }
    );

    app.renderer.backgroundColor = 0xeeeeee;
    return app;
}

// Setup creates the app
function testApp(app) {
    let playArea = new PIXI.Container();
    playArea.position.set(0, 50);
	let board = new BoardDrawing(playArea);

	app.stage.addChild(playArea);
	board.setup();
}

