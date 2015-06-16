'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commandsHelp = require('./commands/help');

var _commandsHelp2 = _interopRequireDefault(_commandsHelp);

var _commandsScope = require('./commands/scope');

var _commandsScope2 = _interopRequireDefault(_commandsScope);

var _commandsUnknown = require('./commands/unknown');

var _commandsUnknown2 = _interopRequireDefault(_commandsUnknown);

var _commandsVersion = require('./commands/version');

var _commandsVersion2 = _interopRequireDefault(_commandsVersion);

exports['default'] = {
  help: _commandsHelp2['default'],
  version: _commandsVersion2['default'],
  scope: _commandsScope2['default'],
  unknown: _commandsUnknown2['default']
};
module.exports = exports['default'];