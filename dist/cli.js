'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var _npmlist = require('./npmlist');

var _npmlist2 = _interopRequireDefault(_npmlist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright 2016 Nicholas Hwang
 * MIT Licensed
 *
 * @module cli.js
 */

var ARGS = process.argv.slice(2);

var REGEX = {
  help: /^(?:(?:--)?help|-h)$/,
  version: /^(?:(?:--)?version|-v)$/,
  local: /^(?:(?:--)?local|-l)$/,
  global: /^(?:(?:--)?global|-g)$/,
  dev: /^(?:(?:--)?dev|-d)$/,
  prod: /^(?:(?:--)?prod|-p)$/,
  depth: /^(?:(?:--)?depth|-n)=(\d+)$/,
  scope: /^(?:(?:--)?scope|-s)(?:=(local|global))?$/
};

var flags = {
  scope: 'global',
  depth: 0
};

var executed = false;

ARGS.forEach(function (arg) {
  var invalid = true;

  for (var option in REGEX) {
    if ({}.hasOwnProperty.call(REGEX, option)) {
      var matches = arg.match(REGEX[option]);
      if (matches) {
        invalid = false;

        var _matches$slice = matches.slice(1);

        var _matches$slice2 = (0, _slicedToArray3.default)(_matches$slice, 1);

        var value = _matches$slice2[0];

        if (_commands2.default[option]) {
          _commands2.default[option].run(value);
          executed = true;
        } else {
          flags[option] = value || option;
        }
      }
    }
  }

  if (invalid) {
    _commands2.default.unknown.run(arg);
  }
});

if (!executed) {
  _commands2.default.scope.get(function (current) {
    var global = flags.global;
    var local = flags.local;
    var dev = flags.dev;
    var prod = flags.prod;
    var scope = flags.scope;

    flags.scope = global || local || current || scope;
    flags.env = prod || dev;
    _npmlist2.default.run(flags);
  });
}