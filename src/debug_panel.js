import $ from 'jquery';
import 'jquery-ui/ui/widgets/button';
import 'jquery-ui/ui/widgets/selectmenu';
import 'jquery-ui/themes/base/menu.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/button.css';
import 'jquery-ui/themes/base/selectmenu.css';
import replays from './debug_replay';
import {minimax} from './minimax_engine';
import "lodash";


export default class DebugPanel {
    constructor(controller) {
        this.controller = controller;
        this.selectReplay = $('.debug-control select');

        let options = Object.keys(replays).map(x => `<option value="${x}">${x}</option>`);
        this.selectReplay
            .append(options.join(''))
            .selectmenu()
            .selectmenu({
                width: 150,
                position: {
                    my: "left top", at: "left bottom+5", collision: "flip"
                }
            })
            .on('selectmenuchange', () => localStorage.debugReplaySelect = this.selectReplay.val());
        if (localStorage.debugReplaySelect) {
            this.selectReplay.val(localStorage.debugReplaySelect).selectmenu('refresh');
        }

        let self = this;
        $('.debug-control button').button().click(function () {
            self.debugCall($(this).attr('name'));
        });
    }

    debugCall(callName) {
        switch (callName) {
            case 'reset':
                this.controller.reset();
                break;
            case 'go':
                this.replay();
                break;
            case 'go-1':
                this.replay(true);
                break;
            case 'comp':
                this.computer_player();
                break;
            default:
                throw new Error('TicTacToe debug call invalid: ' + callName);
        }
    }

    replay(omitLast = false) {
        let replayList = replays[this.selectReplay.val()];
        let last = replayList.length - (omitLast ? 1 : 0);

        this.controller.reset();
        for (let i = 0; i < last; i++) {
            this.controller.takeMove(replayList[i].player, replayList[i].pos);
        }
    }

    computer_player() {
        const positions = [
            'TL', 'TC', 'TR',
            'CL', 'CC', 'CR',
            'BL', 'BC', 'BR',
        ];
        const gameBlank = positions.reduce((obj, key) => _.set(obj, key, {}), {});
        console.log(minimax(gameBlank, 'X', 1));
    }
}
