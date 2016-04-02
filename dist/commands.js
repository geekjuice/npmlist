'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _help = require('./commands/help');

var _help2 = _interopRequireDefault(_help);

var _scope = require('./commands/scope');

var _scope2 = _interopRequireDefault(_scope);

var _unknown = require('./commands/unknown');

var _unknown2 = _interopRequireDefault(_unknown);

var _version = require('./commands/version');

var _version2 = _interopRequireDefault(_version);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  help: _help2.default,
  version: _version2.default,
  scope: _scope2.default,
  unknown: _unknown2.default
};