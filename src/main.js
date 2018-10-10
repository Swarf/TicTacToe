'use strict';

import 'pixi.js';
import {PlayArea} from "./play_area";
import {PlayInput} from "./play_input";
import {loadGameSprite} from "./loader";


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
	let gameBoard = new PlayArea();
	gameBoard.position.set(0, 50);

    let playInput = new PlayInput(gameBoard);

    app.stage.addChild(gameBoard);
	gameBoard.setup();

	let oSprite = loadGameSprite('O');
    oSprite.position.set(70, 120);
	app.stage.addChild(oSprite);

	let xSprite = loadGameSprite('X');
    xSprite.position.set(110, 160);
	app.stage.addChild(xSprite);
}

