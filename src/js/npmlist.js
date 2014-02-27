
/*
    npm ls replacement
    - Pretty log of installed npm list
    - Current npm (1.4.4) list's depth 0 is broken

    by Nicholas Hwang
 */
var blue, cyan, exec, grey, isTest, join, magenta, npmlist, readFile, reset, yellow;

exec = require('child_process').exec;

readFile = require('fs').readFile;

join = require('path').join;

npmlist = {};

yellow = '\x1B[33m';

blue = '\x1B[34m';

magenta = '\x1B[35m';

cyan = '\x1B[36m';

grey = '\x1B[90m';

reset = '\x1B[0m';

isTest = global.NODE_ENV === 'test';

npmlist.help = function() {
  console.log("\nUsage: npmlist [flags] [--depth=n]\n\nFlags:\n  help, -h, --help          This message\n  version, -v, --version    Version number\n  local, -l, --local        Local packages\n  --depth=n                 Traverse n levels deep (default: 0)\n");
  if (!isTest) {
    return process.exit(1);
  }
};

npmlist.version = function(callback) {
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

npmlist.unknownCommand = function(flag) {
  console.log("\nUnknown argument: " + flag);
  return npmlist.help();
};

npmlist.isEmpty = function(list) {
  return /^└\W+(empty)/.test(list);
};

npmlist.depth = function(level, pkg) {
  var regex;
  regex = new RegExp("^(.{0," + (2 * level) + "})[├└].*", 'g');
  return regex.test(pkg);
};

npmlist.getDepth = function(padding) {
  return (padding - 4) / 2;
};

npmlist.lineWidth = function(lines, lowerlimit) {
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

npmlist.parseResult = function(result, width) {
  var buffer, depth, pkg, pkgLength;
  depth = npmlist.getDepth(result[1].length);
  pkg = result[2].split('@');
  pkgLength = pkg[0].length + pkg[1].length;
  buffer = width - pkgLength - depth * 2;
  pkg.push(Array(buffer).join('.'), depth);
  return pkg;
};

npmlist.prettify = function(pkg, version, spaces, depth) {
  var color, l, p, s, v;
  color = depth ? grey : magenta;
  p = [color, pkg, reset].join('');
  v = [cyan, '[', version, ']', reset].join('');
  s = [grey, spaces, reset].join('');
  l = Array(depth * 2 + 1).join(' ');
  return [l, p, s, v, '\n'].join('');
};

npmlist.logger = function(length, line) {
  var pkg, regex, result;
  regex = /^(\W+)([^ ]+)/;
  result = line.match(regex);
  pkg = npmlist.parseResult(result, length);
  if (!isTest) {
    process.stdout.write(npmlist.prettify.apply(null, pkg));
  }
  return pkg.slice(0, 2);
};

npmlist.npmls = function(global, depth) {
  var cmd, scope;
  if (depth == null) {
    depth = 0;
  }
  cmd = 'npm ls';
  scope = '(local)';
  if (global) {
    cmd = [cmd, ' -g'].join(' ');
    scope = '(global)';
  }
  return exec(cmd, function(err, stdout, stderr) {
    var empty, lines, list, msg, width;
    msg = ['Installed npm packages:', scope].join(' ');
    width = msg.length - 1;
    msg = ['\n', blue, msg, '\n\n'].join('');
    process.stdout.write(msg);
    list = stdout.split('\n');
    if (list.filter(npmlist.isEmpty).length) {
      empty = [magenta, '(empty)', reset, '\n'].join('');
      return process.stdout.write(empty);
    }
    lines = list.filter(npmlist.depth.bind(null, depth));
    width = npmlist.lineWidth(lines, width);
    return lines.map(npmlist.logger.bind(null, width));
  });
};

npmlist.init = function() {
  var arg, args, depth, depthMatches, depthRegex, flag, flagMatches, flagRegex, _i, _len;
  args = process.argv.slice(2);
  depth = 0;
  flag = void 0;
  depthRegex = /--depth=(\d+)/;
  flagRegex = /^(?:(?:(?:--)?(?:local|version|help))|(?:-(?:h|v|l)))$/g;
  for (_i = 0, _len = args.length; _i < _len; _i++) {
    arg = args[_i];
    flagMatches = arg.match(flagRegex);
    depthMatches = arg.match(depthRegex);
    if (!(flagMatches || depthMatches)) {
      npmlist.unknownCommand(arg);
    }
    if (depthMatches && depth === 0) {
      depth = depthMatches[1];
    }
    if (flagMatches && flag === void 0) {
      flag = flagMatches[0];
    }
  }
  switch (flag) {
    case "help":
    case "-h":
    case "--help":
      return npmlist.help();
    case "version":
    case "-v":
    case "--version":
      return npmlist.version();
    case "local":
    case "-l":
    case "--local":
      return npmlist.npmls(false, depth);
    default:
      return npmlist.npmls(true, depth);
  }
};

if (isTest) {
  module.exports = npmlist;
} else {
  module.exports.call = npmlist.init;
}
