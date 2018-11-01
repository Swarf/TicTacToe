import $ from 'jquery';
import 'jquery-ui/ui/widgets/button';
import 'jquery-ui/ui/widgets/selectmenu';
import 'jquery-ui/themes/base/menu.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/button.css';
import 'jquery-ui/themes/base/selectmenu.css';


export default function (controller) {
    const replays = {
        'X wins': null,
        'O wins': null,
        'Tie': null,
        'X wins full': null,
        'O wins full': null,
        'Tie full board': null,
    };

    const debugFuncs = {
        reset: 'reset',
        go: 'record',
        'go-1': 'dump',
    };

    let options = Object.keys(replays).map(x => `<option value="${x}">${x}</option>`);
    $('.debug-control select').append(options.join('')).selectmenu().selectmenu({
        width: 150,
        position: {
            my: "left top", at: "left bottom+5", collision: "flip"
        }
    });
    $('.debug-control button').button().click(function () {
        console.log($(this).attr('name'));
        controller[debugFuncs[$(this).attr('name')]]();
    });
}
