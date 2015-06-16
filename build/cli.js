'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var _npmlist = require('./npmlist');

var _npmlist2 = _interopRequireDefault(_npmlist);

var args = process.argv.slice(2);

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

args.forEach(function (arg) {
  var invalid = true;

  for (var option in REGEX) {
    if (({}).hasOwnProperty.call(REGEX, option)) {
      var matches = arg.match(REGEX[option]);
      if (matches) {
        invalid = false;

        var _matches$slice = matches.slice(1);

        var _matches$slice2 = _slicedToArray(_matches$slice, 1);

        var value = _matches$slice2[0];

        if (_commands2['default'][option]) {
          _commands2['default'][option].run(value);
          executed = true;
        } else {
          flags[option] = value || option;
        }
      }
    }
  }

  if (invalid) {
    _commands2['default'].unknown.run(arg);
  }
});

if (!executed) {
  _commands2['default'].scope.get(function (current) {
    var global = flags.global;
    var local = flags.local;
    var dev = flags.dev;
    var prod = flags.prod;
    var scope = flags.scope;

    flags.scope = global || local || current || scope;
    flags.env = prod || dev;
    _npmlist2['default'].run(flags);
  });
}