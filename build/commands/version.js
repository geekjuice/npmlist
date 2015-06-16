'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _package = require('../../package');

var _package2 = _interopRequireDefault(_package);

exports['default'] = {
  run: function run() {
    console.log('v' + _package2['default'].version);
    process.exit(0);
  }
};
module.exports = exports['default'];