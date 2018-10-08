'use strict';

import 'pixi.js';
import loadResources from "./loader";
import './play_area';
import {PlayArea} from "./play_area";
import {PlayInput} from "./play_input";



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
    let gameViewPort = new PIXI.Container();
    gameViewPort.position.set(0, 50);
	let gameBoard = new PlayArea(gameViewPort);

    let playInput = new PlayInput(gameBoard, gameViewPort);

    app.stage.addChild(gameViewPort);
	gameBoard.setup();
}

