'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONFIG = 'npmlist.scope';

var FLIP = '(╯°□°）╯︵ ┻━┻ ';

var UNFLIP = '┬──┬ ﾉ(°—°ﾉ)';

var ERROR_MSG = '\n  ' + _chalk2.default.red(FLIP) + '\n\n  Something went terribly wrong...\n\n  Let ' + _chalk2.default.yellow('Nick') + ' know on ' + _chalk2.default.blue('GitHub (geekjuice/npmlist)') + '\n  Sorry about that... ' + _chalk2.default.cyan(UNFLIP);

function error() {
  console.log(ERROR_MSG);
  process.exit(1);
}

exports.default = {
  get: function get(cb) {
    var cmd = 'npm get ' + CONFIG;
    (0, _child_process.exec)(cmd, function (err, stdout, stderr) {
      if (err) {
        error();
      }
      stdout = stdout.trim() === 'local' ? 'local' : 'global';
      cb(stdout);
    });
  },
  set: function set(scope) {
    var cmd = 'npm set ' + CONFIG + ' ' + scope;
    (0, _child_process.exec)(cmd, function (err, stdout, stderr) {
      if (err) {
        error();
      }
      console.log('Scope set to ' + _chalk2.default.cyan(scope));
      process.exit(0);
    });
  },
  run: function run(scope) {
    if (scope) {
      this.set(scope);
    } else {
      this.get(function (current) {
        console.log('Current scope: ' + _chalk2.default.cyan(current));
      });
    }
  }
};