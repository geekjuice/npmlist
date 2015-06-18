'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _child_process = require('child_process');

var _utils = require('./utils');

var BUFFER = 4;

var REGEX = {
  'package': /^([│ ]*)[└├]─+┬?\s+(.*)@(.*)$/,
  invalid: /^(.*)\s+invalid$/,
  unmet: /^.*UNMET DEPENDENCY\s+(.*)$/,
  version: /^([\d.]*)(?:\s+->\s+(.*))$/
};

function cmd(flags) {
  var depth = flags.depth;
  var env = flags.env;
  var scope = flags.scope;

  return ['npm ls', '--depth=' + depth, env ? '--' + env : '', scope === 'global' ? '-g' : ''].join(' ');
}

function log(level, msg) {
  switch (level) {
    case 2:
      return _chalk2['default'].red(msg);
    case 1:
      return _chalk2['default'].yellow(msg);
    default:
      return _chalk2['default'].cyan(msg);
  }
}

exports['default'] = {
  run: function run() {
    var flags = arguments[0] === undefined ? {} : arguments[0];

    (0, _child_process.exec)(cmd(flags), function (err, stdout, stderr) {
      if (err) {}

      var pkgs = [];
      var lines = (0, _utils.clean)(stdout.split('\n'));

      // Banner
      var type = flags.env ? flags.env : 'npm';
      var banner = '\nInstalled ' + type + ' packages: (' + flags.scope + ')\n';
      console.log(_chalk2['default'].blue(banner));

      var maxLength = banner.trim().length - BUFFER;

      lines.forEach(function (line) {
        var logLevel = 0;
        var pkgMatches = line.match(REGEX['package']);

        if (pkgMatches) {
          var _pkgMatches$slice = pkgMatches.slice(1);

          var _pkgMatches$slice2 = _slicedToArray(_pkgMatches$slice, 3);

          var bars = _pkgMatches$slice2[0];
          var _name = _pkgMatches$slice2[1];
          var version = _pkgMatches$slice2[2];

          var unmetMatches = _name.match(REGEX.unmet);
          var invalidMatches = version.match(REGEX.invalid);
          var versionMatches = version.match(REGEX.version);

          // Check for invalid dependencies
          if (invalidMatches) {
            logLevel = 2;
            version = invalidMatches[1];
          }

          // Check for UNMET dependencies
          if (unmetMatches) {
            logLevel = 1;
            _name = unmetMatches[1];
            version = 'UNMET';
          }

          // Check for linked packages
          if (versionMatches) {
            logLevel = 1;
            version = versionMatches[1];
          }

          // Format depth and version
          version = '[' + version + ']';
          var spaces = new Array(bars.length + 1).join(' ');

          // Calculate longest string
          var pkgLength = spaces.length + _name.length + version.length;
          maxLength = Math.max(maxLength, pkgLength);

          pkgs.push({
            spaces: spaces,
            name: _name,
            version: version,
            pkgLength: pkgLength,
            logLevel: logLevel
          });
        }
      });

      if (pkgs.length) {
        pkgs.forEach(function (pkg) {
          var spaces = pkg.spaces;
          var name = pkg.name;
          var version = pkg.version;
          var pkgLength = pkg.pkgLength;
          var logLevel = pkg.logLevel;

          var msg = [
          // Add depth
          spaces,

          // Top-level or dependency
          spaces ? _chalk2['default'].black(name) : _chalk2['default'].magenta(name),

          // Dotted spacing
          _chalk2['default'].black(new Array(maxLength - pkgLength + 1 + BUFFER).join('.')),

          // Version
          log(logLevel, version)].join('');

          console.log(msg);
        });
      } else {
        var msg = _chalk2['default'].magenta('No packages found.');
        console.log(msg);
      }
    });
  }
};
module.exports = exports['default'];