"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*
 * Color configs
 */

var _require = require("path");

var join = _require.join;

var _require2 = require("fs");

var existsSync = _require2.existsSync;

var _require3 = require("child_process");

var exec = _require3.exec;

var _ = require("lodash");
var Color = require("./color");

// Constants
var HOMEDIR = process.platform === "win32" ? "USERPROFILE" : "HOME";
var NPMRC = join(process.env[HOMEDIR], ".npmrc");
var COLORVAR = "npmlist.colors";
var MAPS = ["Package", "Version", "Banner", "Dots", "Sub-package"];
var COLORS = {
  pkg: "magenta",
  version: "cyan",
  banner: "blue",
  dots: "grey",
  subpkg: "grey"
};

var ColorConf = (function () {
  function ColorConf() {
    _classCallCheck(this, ColorConf);
  }

  _createClass(ColorConf, {
    duplicate: {
      value: function duplicate(val, times) {
        return _.times(times, function () {
          return val;
        });
      }
    },
    npmrcExists: {
      value: function npmrcExists() {
        return existsSync(NPMRC);
      }
    },
    downcase: {
      value: function downcase(array) {
        return array.map(function (elem) {
          return elem.toLowerCase();
        });
      }
    },
    sanitize: {
      value: function sanitize(str) {
        return this.downcase(str.trim().split(/\s*,\s*/g));
      }
    },
    getColors: {
      value: function getColors(callback) {
        return exec("npm get " + COLORVAR, function (err, stdout, stderr) {
          return callback(stdout.trim() === "undefined" ? "default" : stdout);
        });
      }
    },
    setColors: {
      value: function setColors(colors) {
        var _this = this;

        var colors = this.sanitize(colors.replace(/\s+/g, ""));
        return exec("npm set " + COLORVAR, function (err, stdout, stderr) {
          if (err) console.log(err);
          return _this.colorscheme("Colorscheme set to:");
        });
      }
    },
    colorscheme: {
      value: function colorscheme() {
        var _this = this;

        var banner = arguments[0] === undefined ? "Current colorscheme:" : arguments[0];

        return this.getColors(function (currentColors) {
          var colors = [];
          if (_.isUndefined(currentColors.trim())) {
            for (var color in COLORS) {
              colors.push(COLORS[color]);
            }
          } else {
            currentColors = _this.parseColors(currentColors);
            for (var color in currentColors) {
              colors.push(currentColors[color]);
            }
          }

          process.stdout.write("\n" + Color.blue + "" + banner + "" + Color.reset + "\n\n");

          var width = 30;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = _.range(5)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var i = _step.value;

              var color = colors[i];
              var buffer = width - (MAPS[i].length + color.length) - 1;
              var dots = "" + Color.grey + "" + _.repeat(".", buffer) + "" + Color.reset;
              var msg = "" + MAPS[i] + "" + dots + "" + Color[color] + "" + color + "" + Color.reset + "\n";
              process.stdout.write(msg);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          return process.exit(0);
        });
      }
    },
    mapColors: {
      value: function mapColors(colors) {
        return {
          pkg: colors[0],
          version: colors[1],
          banner: colors[2],
          dots: colors[3],
          subpkg: colors[4]
        };
      }
    },
    parseColors: {
      value: function parseColors(colorString) {
        var _this = this;

        var colorMap = _.clone(COLORS);
        var colors = this.sanitize(colorString);
        var colorsLength = colors.length;

        if (_.includes(colors, "default")) {
          return colorMap;
        } else if (_.includes(colors, "sans")) {
          return this.mapColors(this.duplicate("system", 5));
        }

        return (function () {
          switch (colorsLength) {
            case 5:
              return _this.mapColors(colors);
            case 4:
              return _this.mapColors(colors.concat("grey"));
            case 3:
              return _this.mapColors(colors.concat("grey", "grey"));
            case 2:
              return _.assign({}, colorMap, {
                pkg: colors[0],
                versions: colors[1]
              });
            case 1:
              return _this.mapColors(_this.duplicate(colors[0], 5));
            default:
              return colorMap;
          }
        })();
      }
    }
  });

  return ColorConf;
})();

module.exports = new ColorConf();