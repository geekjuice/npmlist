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

var REGEX = {
  'package': /^([│ ]*)[└├]─+┬?\s+(.*)@(.*)$/,
  unmet: /^.*UNMET DEPENDENCY\s+(.*)$/,
  version: /^([\d.]*)(?:\s+->\s+(.*))$/
};

function cmd(flags) {
  var depth = flags.depth;
  var env = flags.env;
  var scope = flags.scope;

  return ['npm ls', '--depth=' + depth, env ? '--' + env : '', scope === 'global' ? '-g' : ''].join(' ');
}

// TODO: Clean up
exports['default'] = {
  run: function run() {
    var flags = arguments[0] === undefined ? {} : arguments[0];

    (0, _child_process.exec)(cmd(flags), function (err, stdout, stderr) {
      if (err) {}

      var pkgs = [];
      var lines = (0, _utils.clean)(stdout.split('\n'));

      var buffer = 4;
      // TODO: Display dev/prod info
      var banner = '\nInstalled npm packages: (' + flags.scope + ')\n';
      console.log(_chalk2['default'].blue(banner));

      var maxLength = banner.length - buffer;

      lines.forEach(function (line) {
        var pkgMatches = line.match(REGEX['package']);

        if (pkgMatches) {
          var _pkgMatches$slice = pkgMatches.slice(1);

          var _pkgMatches$slice2 = _slicedToArray(_pkgMatches$slice, 3);

          var bars = _pkgMatches$slice2[0];
          var _name = _pkgMatches$slice2[1];
          var version = _pkgMatches$slice2[2];

          var unmetMatches = _name.match(REGEX.unmet);
          var versionMatches = version.match(REGEX.version);

          if (unmetMatches) {
            _name = unmetMatches[1];
            version = 'UNMET';
          }

          if (versionMatches) {
            version = '' + versionMatches[1] + '*';
          }

          version = '[' + version + ']';

          var spaces = new Array(bars.length + 1).join(' ');
          var pkgLength = spaces.length + _name.length + version.length;
          maxLength = Math.max(maxLength, pkgLength);

          pkgs.push({
            spaces: spaces,
            name: _name,
            version: version,
            pkgLength: pkgLength
          });
        }
      });

      pkgs.forEach(function (pkg) {
        var spaces = pkg.spaces;
        var name = pkg.name;
        var version = pkg.version;
        var pkgLength = pkg.pkgLength;

        var msg = [spaces, spaces ? _chalk2['default'].black(name) : _chalk2['default'].magenta(name), _chalk2['default'].black(new Array(maxLength - pkgLength + 1 + buffer).join('.')), version === '[UNMET]' ? _chalk2['default'].red(version) : _chalk2['default'].cyan(version)].join('');

        console.log(msg);
      });
    });
  }
};
module.exports = exports['default'];