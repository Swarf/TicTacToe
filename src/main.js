'use strict';

import 'pixi.js';
import loadResources from "./loader";
import {PlayArea} from "./play_area";
import {PlayInput} from "./play_input";
import {GameBoard} from "./game_board";


Promise.resolve(setup())
    .catch((err) => {
        console.error('Caught error at App level');
        console.error(err);
    });


async function setup() {
    let app = createApp();
    document.body.appendChild(app.view);

    let resources = await loadResources(app);
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

    app.renderer.backgroundColor = 0xFAFAFA;
    return app;
}

// Setup creates the app
function testApp(app) {
	let playView = new PlayArea(app);
	playView.position.set(0, 50);

	let gameBoard = new GameBoard();
    let playInput = new PlayInput(playView, gameBoard);

    app.stage.addChild(playView);
	playView.setup();
}
