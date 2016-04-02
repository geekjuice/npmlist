'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _child_process = require('child_process');

var _utils = require('./utils');

var _chalk = require('chalk');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BUFFER = 4; /**
                 * Copyright 2016 Nicholas Hwang
                 * MIT Licensed
                 *
                 * @module npmlist.js
                 */

var REGEX = {
  package: /^([│ ]*)[└├+`][─-]+┬?\s+(.*)@(.*)$/,
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
      return (0, _chalk.red)(msg);
    case 1:
      return (0, _chalk.yellow)(msg);
    default:
      return (0, _chalk.cyan)(msg);
  }
}

exports.default = {
  run: function run() {
    var flags = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    (0, _child_process.exec)(cmd(flags), function (err, stdout) {
      var pkgs = [];
      var lines = (0, _utils.clean)(stdout.split('\n'));

      // Banner
      var type = flags.env ? flags.env : 'npm';
      var banner = '\nInstalled ' + type + ' packages: (' + flags.scope + ')\n';
      console.log((0, _chalk.blue)(banner));

      var maxLength = banner.trim().length - BUFFER;

      lines.forEach(function (line) {
        var logLevel = 0;
        var pkgMatches = line.match(REGEX.package);

        if (pkgMatches) {
          var matches = pkgMatches.slice(1);

          var _matches = (0, _slicedToArray3.default)(matches, 1);

          var bars = _matches[0];

          var _matches2 = (0, _slicedToArray3.default)(matches, 3);

          var name = _matches2[1];
          var version = _matches2[2];


          var unmetMatches = name.match(REGEX.unmet);
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
            name = unmetMatches[1];
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
          var pkgLength = spaces.length + name.length + version.length;
          maxLength = Math.max(maxLength, pkgLength);

          pkgs.push({
            spaces: spaces,
            name: name,
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
          spaces ? (0, _chalk.black)(name) : (0, _chalk.magenta)(name),

          // Dotted spacing
          (0, _chalk.black)(new Array(maxLength - pkgLength + 1 + BUFFER).join('.')),

          // Version
          log(logLevel, version)].join('');

          console.log(msg);
        });
      } else {
        var msg = (0, _chalk.magenta)('No packages found.');
        console.log(msg);
      }
    });
  }
};