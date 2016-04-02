'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _package = require('../../package');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  run: function run() {
    console.log('v' + _package2.default.version);
    process.exit(0);
  }
};