
/*
    npm ls replacement

    - Pretty log of installed npm list
    - Current npm (1.4.4) list's depth 0 is broken

    by Nicholas Hwang
 */
var Conf, Npmlist, SCOPEVAR, c, exec, isTest, join, readFile;

exec = require('child_process').exec;

readFile = require('fs').readFile;

join = require('path').join;

Conf = require('./color_conf');

c = require('./color');

SCOPEVAR = 'npmlist.scope';

Npmlist = {};


/*
 * Test?
 */

isTest = global.NODE_ENV === 'test';


/*
 * Help/Usage
 */

Npmlist.help = function() {
  console.log("\nUsage: npmlist [flags]\n\nFlags:\n  -h,         [--]help                  This message\n  -v,         [--]version               Version number\n  -l,         [--]local                 Local packages\n  -g,         [--]global                Global packages\n  -cs,        [--]colorscheme           Display current colorscheme\n  -d=n,       [--]depth=n               Traverse n levels deep\n  -gp=pkg,    [--]grep=pkg              Filter package (top-level)\n  -c=x,y,z,   [--]colors=x,y,z          Use colors specified\n  -sc=x,y,z,  [--]setcolors=x,y,z       Set colors (persistent)\n  -ss=scope   [--]setscope=scope        Set global or local (persistent)\n");
  if (!isTest) {
    return process.exit(1);
  }
};


/*
 * Version
 */

Npmlist.version = function(callback) {
  var pkgjson;
  pkgjson = join(__dirname, '../../package.json');
  return readFile(pkgjson, function(err, file) {
    var json, version;
    if (err) {
      throw err;
    }
    json = JSON.parse(file);
    version = "npmlist v" + json.version;
    if (!isTest) {
      console.log(version);
    }
    if (callback) {
      return callback(version);
    }
  });
};


/*
 * Unknown Command
 */

Npmlist.unknownCommand = function(flag) {
  console.log("\nUnknown argument: " + flag);
  return Npmlist.help();
};


/*
 * Check if no packages
 */

Npmlist.isEmpty = function(list) {
  return /^└\W+(empty)/.test(list);
};


/*
 * Get scope from npmrc
 */

Npmlist.getScope = function(callback) {
  return exec("npm get " + SCOPEVAR, function(err, stdout, stderr) {
    return callback(/^local$/i.test(stdout.trim()) ? false : true);
  });
};


/*
 * Set scope to npmrc
 */

Npmlist.setScope = function(scope) {
  scope = /^l(ocal)?$/i.test(scope) ? 'local' : 'global';
  return exec("npm set " + SCOPEVAR + " " + scope, function(err, stdout, stderr) {
    var msg;
    msg = "Scope will no default to: ";
    scope = scope === 'local' ? "" + c.magenta + scope : "" + c.cyan + scope;
    msg = ['\n', c.blue, msg, scope, c.reset, '\n'].join('');
    process.stdout.write(msg);
    return process.exit(1);
  });
};


/*
 * Check if within depth
 */

Npmlist.depth = function(level, pkg) {
  var regex;
  regex = new RegExp("^(.{0," + (2 * level) + "})[├└].*", 'g');
  return regex.test(pkg);
};


/*
 * Grep Packages
 */

Npmlist.grepPackage = function(lines, grep) {
  var depth, fuzzy, grepped, keepGathering, line, regex, _i, _len;
  if (!grep.length) {
    return lines;
  }
  if (grep[0] === '_') {
    grep = grep.substr(1);
    fuzzy = true;
  }
  regex = new RegExp("" + grep + (fuzzy ? '' : '@.*'), 'i');
  keepGathering = false;
  grepped = [];
  for (_i = 0, _len = lines.length; _i < _len; _i++) {
    line = lines[_i];
    depth = Npmlist.depth(0, line);
    if (depth) {
      if (regex.test(line)) {
        grepped.push(line);
        keepGathering = true;
      } else {
        keepGathering = false;
      }
    }
    if (keepGathering && !Npmlist.depth(0, line)) {
      grepped.push(line);
    }
  }
  return grepped;
};


/*
 * Get depth
 */

Npmlist.getDepth = function(padding) {
  return (padding - 4) / 2;
};


/*
 * Get max line width to ensure full display
 */

Npmlist.lineWidth = function(lines, lowerlimit) {
  var width;
  width = lines.reduce(function(prev, curr) {
    if (curr.length > prev) {
      return curr.length;
    } else {
      return prev;
    }
  }, 0);
  if (width > lowerlimit) {
    return width;
  } else {
    return lowerlimit;
  }
};


/*
 * Strip source - pkg@version (source)
 */

Npmlist.stripSource = function(line) {
  var match, regex;
  regex = /^(\W+[^ ]+)(.*)/;
  match = line.match(regex);
  return match[1] + (match[2] ? '*' : '');
};


/*
 * Extract relevance
 */

Npmlist.parseResult = function(result, width) {
  var buffer, depth, pkg, pkgLength;
  depth = Npmlist.getDepth(result[1].length);
  pkg = result[2].split('@');
  pkgLength = pkg[0].length + pkg[1].length;
  buffer = width - pkgLength - depth * 2;
  pkg.push(Array(buffer).join('.'), depth);
  return pkg;
};


/*
 * Prettify package and version
 */

Npmlist.prettify = function(pkg, version, spaces, depth) {
  var l, p, pkgcolor, s, v;
  pkgcolor = depth ? c[Npmlist.colors.subpkg] : c[Npmlist.colors.pkg];
  p = [pkgcolor, pkg, c.reset].join('');
  v = [c[Npmlist.colors.version], '[', version, ']', c.reset].join('');
  s = [c[Npmlist.colors.dots], spaces, c.reset].join('');
  l = Array(depth * 2 + 1).join(' ');
  return [l, p, s, v, '\n'].join('');
};


/*
 * Write to stdout
 */

Npmlist.logger = function(length, line) {
  var pkg, regex, result;
  regex = /^(\W+)([^ ]+)/;
  result = line.match(regex);
  pkg = Npmlist.parseResult(result, length);
  if (!isTest) {
    process.stdout.write(Npmlist.prettify.apply(null, pkg));
  }
  return pkg.slice(0, 2);
};


/*
 * Write empty to stdout
 */

Npmlist.logEmpty = function() {
  var empty;
  empty = [c[Npmlist.colors.pkg], '(empty)', c.reset, '\n'].join('');
  return process.stdout.write(empty);
};


/*
 * Main npm list function
 */

Npmlist.npmls = function(global, depth, grep, colors) {
  var cmd, runCommand, scope;
  if (depth == null) {
    depth = 0;
  }
  if (grep == null) {
    grep = '';
  }
  if (colors == null) {
    colors = '';
  }
  runCommand = function() {
    return exec(cmd, function(err, stdout, stderr) {
      var banner, lines, list, msg, width;
      msg = ['Installed npm packages:', scope].join(' ');
      width = msg.length - 1;
      banner = ['\n', c[Npmlist.colors.banner], msg, c.reset, '\n\n'].join('');
      process.stdout.write(banner);
      list = stdout.split('\n');
      if (list.filter(Npmlist.isEmpty).length) {
        return Npmlist.logEmpty();
      }
      lines = list.filter(Npmlist.depth.bind(null, depth));
      lines = lines.map(Npmlist.stripSource);
      lines = Npmlist.grepPackage(lines, grep);
      if (!lines.length) {
        return Npmlist.logEmpty();
      }
      width = Npmlist.lineWidth(lines, width);
      return lines.map(Npmlist.logger.bind(null, width));
    });
  };
  cmd = 'npm ls';
  scope = '(local)';
  if (global) {
    cmd = [cmd, ' -g'].join(' ');
    scope = '(global)';
  }
  if (colors.length) {
    Npmlist.colors = Conf.parseColors(colors);
    return runCommand();
  } else {
    return Conf.getColors(function(colors) {
      Npmlist.colors = Conf.parseColors(colors);
      return runCommand();
    });
  }
};


/*
 * Initialize
 */

Npmlist.init = function() {
  var arg, args, colorMatches, colorRegex, colors, depth, depthMatches, depthRegex, flag, flagMatches, flagRegex, getColors, grep, grepMatches, grepRegex, scope, scopeMatches, scopeRegex, setColors, setMatches, setRegex, _i, _len;
  args = process.argv.slice(2);
  depth = 0;
  flag = void 0;
  colors = '';
  setColors = '';
  getColors = false;
  scope = '';
  grep = '';
  depthRegex = /^(?:(?:--)?depth|-d)=(\d+)/;
  flagRegex = /^(?:(?:(?:--)?(?:scope|colorscheme|global|local|version|help))|(?:-(?:s|cs|g|l|v|h)))$/g;
  colorRegex = /^(?:(?:--)?colors|-c)=(.+)/;
  setRegex = /^(?:(?:--)?setcolors|-sc)=(.+)/;
  scopeRegex = /^(?:(?:--)?setscope|-ss)=(.+)/;
  grepRegex = /^(?:(?:--)?grep|-gp)=(.+)/;
  for (_i = 0, _len = args.length; _i < _len; _i++) {
    arg = args[_i];
    flagMatches = arg.match(flagRegex);
    depthMatches = arg.match(depthRegex);
    colorMatches = arg.match(colorRegex);
    setMatches = arg.match(setRegex);
    scopeMatches = arg.match(scopeRegex);
    grepMatches = arg.match(grepRegex);
    if (!(flagMatches || depthMatches || colorMatches || setMatches || scopeMatches || grepMatches)) {
      Npmlist.unknownCommand(arg);
    }
    if (flagMatches && flag === void 0) {
      flag = flagMatches[0];
    }
    if (depthMatches && depth === 0) {
      depth = depthMatches[1];
    }
    if (colorMatches && colors.length === 0) {
      colors = colorMatches[1];
    }
    if (setMatches && setColors.length === 0) {
      setColors = setMatches[1];
    }
    if (scopeMatches && scope.length === 0) {
      scope = scopeMatches[1];
    }
    if (grepMatches && grep.length === 0) {
      grep = grepMatches[1];
    }
  }
  if (scope.length !== 0) {
    Npmlist.setScope(scope);
  }
  if (setColors.length !== 0) {
    return Conf.setColors(setColors);
  } else {
    switch (flag) {
      case "colorscheme":
      case "-cs":
      case "--colorscheme":
        return Conf.colorscheme();
      case "help":
      case "-h":
      case "--help":
        return Npmlist.help();
      case "version":
      case "-v":
      case "--version":
        return Npmlist.version();
      case "global":
      case "-g":
      case "--global":
        return Npmlist.npmls(true, depth, grep, colors);
      case "local":
      case "-l":
      case "--local":
        return Npmlist.npmls(false, depth, grep, colors);
      default:
        return Npmlist.getScope(function(global) {
          return Npmlist.npmls(global, depth, grep, colors);
        });
    }
  }
};


/*
 * Export
 */

if (isTest) {
  module.exports = Npmlist;
} else {
  module.exports.call = Npmlist.init;
}
