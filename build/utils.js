'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

exports['default'] = {
  clean: function clean(arr) {
    for (var i = 0; i < arr.length; ++i) {
      if (!arr[i]) {
        arr.splice(i, 1);
        --i;
      }
    }
    return arr;
  }
};
module.exports = exports['default'];