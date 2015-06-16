'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _help = require('./help');

var _help2 = _interopRequireDefault(_help);

exports['default'] = {
  run: function run(opt) {
    console.log('\n  Invalid option: ' + _chalk2['default'].yellow(opt));
    _help2['default'].run(1);
  }
};
module.exports = exports['default'];