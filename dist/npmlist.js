"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*
 * Npmlist
 */

var _require = require("path");

var join = _require.join;

var _require2 = require("fs");

var readFile = _require2.readFile;

var _require3 = require("child_process");

var exec = _require3.exec;

var _ = require("lodash");
var Conf = require("./colorConf");
var Color = require("./color");

var SCOPEVAR = "npmlist.scope";

var IS_TEST = global.NODE_ENV === "test";

var Npmlist = (function () {
  function Npmlist() {
    _classCallCheck(this, Npmlist);
  }

  _createClass(Npmlist, {
    help: {
      value: function help() {
        var code = arguments[0] === undefined ? 0 : arguments[0];

        console.log("\n\n  Usage: npmlist [flags]\n\n  Flags:\n    -h,         [--]help                  This message\n    -v,         [--]version               Version number\n    -l,         [--]local                 Local packages\n    -g,         [--]global                Global packages\n    -cs,        [--]colorscheme           Display current colorscheme\n    -d=n,       [--]depth=n               Traverse n levels deep\n    -gp=pkg,    [--]grep=pkg              Filter package (top-level)\n    -c=x,y,z,   [--]colors=x,y,z          Use colors specified\n    -sc=x,y,z,  [--]setcolors=x,y,z       Set colors (persistent)\n    -ss=scope   [--]setscope=scope        Set global or local (persistent)\n\n    ");
        if (!IS_TEST) process.exit(code);
      }
    },
    version: {
      value: function version(callback) {
        var pkgJson = join(__dirname, "../package.json");
        readFile(pkgJson, function (err, file) {
          if (err) throw err;
          var json = JSON.parse(file);
          var version = "npmlist v" + json.version;
          if (!IS_TEST) console.log(version);
          if (callback) callback(version);
        });
      }
    },
    unknownCommand: {
      value: function unknownCommand(flag) {
        console.log("\nUnknown argument: " + flag);
        this.help(1);
      }
    },
    isEmpty: {
      value: function isEmpty(list) {
        return /^└\W+(empty)/.test(list);
      }
    },
    getScope: {
      value: function getScope(callback) {
        exec("npm get " + SCOPEVAR, function (err, stdout, stderr) {
          callback(/^local$/i.test(stdout.trim()) ? false : true);
        });
      }
    },
    setScope: {
      value: function setScope(scope) {
        var scope = /^l(ocal)?$/i.test(scope) ? "local" : "global";
        exec("npm set " + SCOPEVAR, function (err, stdout, stderr) {
          var msg = "Scope will now default to: ";
          scope = scope === "local" ? "" + Color.magenta + "" + scope : "" + Color.cyan + "" + scope;
          msg = "\n" + Color.blue + "" + msg + "" + scope + "" + Color.reset + "\n";
          process.stdout.write(msg);
          process.exit(0);
        });
      }
    },
    depth: {
      value: function depth(level, pkg) {
        var regex = new RegExp("^(.{0," + 2 * level + "})[├└].*", "g");
        return regex.test(pkg);
      }
    },
    grepPackage: {
      value: function grepPackage(lines) {
        var grep = arguments[1] === undefined ? "" : arguments[1];

        var fuzzy = false;
        if (!grep.length) {
          return lines;
        }if (grep[0] === "_") {
          grep = grep.substr(1);
          fuzzy = true;
        }
        var regex = new RegExp("" + grep + "" + (fuzzy ? "" : "@.*"), "i");
        var keepGathering = false;
        var grepped = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var line = _step.value;

            var depth = this.depth(0, line);
            if (depth) {
              if (regex.test(line)) {
                grepped.push(line);
                keepGathering = true;
              } else {
                keepGathering = false;
              }
            }
            if (keepGathering && !this.depth(0, line)) {
              grepped.push(line);
            }
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

        return grepped;
      }
    },
    getDepth: {
      value: function getDepth(padding) {
        return (padding - 4) / 2;
      }
    },
    lineWidth: {
      value: function lineWidth(lines, lowerLimit) {
        var width = lines.reduce(function (prev, _ref) {
          var length = _ref.length;

          return length > prev ? length : prev;
        }, 0);
        return width > lowerLimit ? width : lowerLimit;
      }
    },
    stripSource: {
      value: function stripSource(line) {
        var _line$match = line.match(/^(\W+[^ ]+)(.*)/);

        var _line$match2 = _slicedToArray(_line$match, 3);

        var pkg = _line$match2[1];
        var link = _line$match2[2];

        return "" + pkg + "" + (link ? "*" : "");
      }
    },
    parseResult: {
      value: function parseResult(_ref, width) {
        var _ref2 = _slicedToArray(_ref, 3);

        var tree = _ref2[1];
        var module = _ref2[2];

        var depth = this.getDepth(tree.length);
        var pkg = module.split("@");
        var pkgLength = pkg[0].length + pkg[1].length;
        var buffer = width - pkgLength - depth * 2 - 1;
        pkg.push(_.repeat(".", buffer), depth);
        return pkg;
      }
    },
    prettify: {
      value: function prettify(module, ver, spaces, depth) {
        var _colors = this.colors;
        var subpkg = _colors.subpkg;
        var pkg = _colors.pkg;
        var dots = _colors.dots;
        var version = _colors.version;

        var pkgColor = Color[depth ? subpkg : pkg];
        var l = _.repeat(" ", depth * 2);
        var p = "" + pkgColor + "" + module + "" + Color.reset;
        var s = "" + Color[dots] + "" + spaces + "" + Color.reset;
        var v = "" + Color[version] + "[" + ver + "]" + Color.reset;
        return "" + l + "" + p + "" + s + "" + v + "\n";
      }
    },
    logger: {
      value: function logger(length, line) {
        var result = line.match(/^(\W+)([^ ]+)/);
        var pkg = this.parseResult(result, length);
        if (!IS_TEST) process.stdout.write(this.prettify.apply(this, pkg));
        return pkg.slice(0, 2);
      }
    },
    logEmpty: {
      value: function logEmpty() {
        var empty = "" + Color[this.colors.pkg] + "(empty)" + Color.reset + "\n";
        process.stdout.write(empty);
      }
    },
    npmls: {
      value: function npmls(global) {
        var _this = this;

        var depth = arguments[1] === undefined ? 0 : arguments[1];
        var grep = arguments[2] === undefined ? "" : arguments[2];
        var colors = arguments[3] === undefined ? "" : arguments[3];

        var cmd = "npm ls";
        var scope = "(local)";
        if (global) {
          cmd = "" + cmd + " -g";
          scope = "(global)";
        }

        if (colors.length) {
          this.colors = Conf.parseColors(colors);
          this.run(cmd, scope, depth, grep);
        } else {
          Conf.getColors(function (colors) {
            _this.colors = Conf.parseColors(colors);
            _this.run(cmd, scope, depth, grep);
          });
        }
      }
    },
    run: {
      value: function run(cmd, scope, depth, grep) {
        var _this = this;

        exec(cmd, function (err, stdout, stderr) {
          var msg = "Installed npm packages:" + scope;
          var width = msg.length - 1;
          var banner = "\n" + Color[_this.colors.banner] + "" + msg + "" + Color.reset + "\n\n";
          process.stdout.write(banner);

          var list = stdout.split("\n");
          if (list.filter(_this.isEmpty).length) return _this.logEmpty();

          var lines = list.filter(_this.depth.bind(_this, depth));
          lines = lines.map(_this.stripSource);
          lines = _this.grepPackage(lines, grep);

          if (!lines.length) return _this.logEmpty();

          width = _this.lineWidth(lines, width);
          lines.map(_this.logger.bind(_this, width));
        });
      }
    },
    init: {
      value: function init() {
        var _this = this;

        var args = process.argv.slice(2);

        var depth = 0;
        var flag = null;
        var colors = "";
        var setColors = "";
        var getColors = false;
        var scope = "";
        var grep = "";

        var depthRegex = /^(?:(?:--)?depth|-d)=(\d+)/;
        var flagRegex = /^(?:(?:(?:--)?(?:scope|colorscheme|global|local|version|help))|(?:-(?:s|cs|g|l|v|h)))$/g;
        var colorRegex = /^(?:(?:--)?colors|-c)=(.+)/;
        var setRegex = /^(?:(?:--)?setcolors|-sc)=(.+)/;
        var scopeRegex = /^(?:(?:--)?setscope|-ss)=(.+)/;
        var grepRegex = /^(?:(?:--)?grep|-gp)=(.+)/;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var arg = _step.value;

            var flagMatches = arg.match(flagRegex);
            var depthMatches = arg.match(depthRegex);
            var colorMatches = arg.match(colorRegex);
            var setMatches = arg.match(setRegex);
            var scopeMatches = arg.match(scopeRegex);
            var grepMatches = arg.match(grepRegex);
            if (!(flagMatches || depthMatches || colorMatches || setMatches || scopeMatches || grepMatches)) {
              this.unknownCommand(arg);
            }

            if (flagMatches && _.isNull(flag)) flag = flagMatches[0];
            if (depthMatches && !depth) depth = depthMatches[1];
            if (colorMatches && !colors.length) colors = colorMatches[1];
            if (setMatches && !setColors.length) setColors = setMatches[1];
            if (scopeMatches && !scope.length) scope = scopeMatches[1];
            if (grepMatches && !grep.length) grep = grepMatches[1];
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

        if (scope.length) this.setScope(scope);

        if (setColors.length) {
          Conf.setColors(setColors);
        } else {
          switch (flag) {
            case "colorscheme":
            case "-cs":
            case "--colorscheme":
              return Conf.colorscheme();
            case "help":
            case "-h":
            case "--help":
              return this.help();
            case "version":
            case "-v":
            case "--version":
              return this.version();
            case "global":
            case "-g":
            case "--global":
              return this.npmls(true, depth, grep, colors);
            case "local":
            case "-l":
            case "--local":
              return this.npmls(false, depth, grep, colors);
            default:
              this.getScope(function (global) {
                return _this.npmls(global, depth, grep, colors);
              });
          }
        }
      }
    }
  });

  return Npmlist;
})();

module.exports = new Npmlist();