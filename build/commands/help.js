'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var HELP = '\n  Usage ' + _chalk2['default'].cyan('npmlist') + ' ' + _chalk2['default'].magenta('[options]') + '\n\n  Options:\n\n  -h          [--]help           This message\n  -v          [--]version        Version number\n  -d          [--]dev            Only devDependencies\n  -p          [--]prod           Only dependencies\n  -l          [--]local          Local packages\n  -g          [--]global         Global packages\n  -d=n        [--]depth=n        Traverse n levels deep\n  -s=scope    [--]scope=scope    Set persistent scope [local|global]';

exports['default'] = {
  run: function run(code) {
    console.log(HELP);
    process.exit(code || 0);
  }
};
module.exports = exports['default'];