
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
  console.log("\nUsage: npmlist [flags]\n\nFlags:\n  local, -l, --local        Local packages\n  help, -h, --help          This message\n  version, -v, --version    Version number\n");
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
  console.log("\nUnknown flag: " + flag);
  return npmlist.help();
};

npmlist.prettify = function(pkg, version, spaces) {
  var p, s, v;
  p = [magenta, pkg, reset].join('');
  v = [cyan, '[', version, ']', reset].join('');
  s = [grey, spaces, reset].join('');
  return [p, s, v, '\n'].join('');
};

npmlist.isEmpty = function(list) {
  return /^└\W+(empty)/.test(list);
};

npmlist.isMainPackage = function(pkg) {
  return /^[├└].*/g.test(pkg);
};

npmlist.logger = function(totalLength, line) {
  var buffer, regex, result, resultLength;
  regex = /^\W+([^ ]+)/;
  result = line.match(regex)[1].split('@');
  resultLength = result[0].length + result[1].length;
  buffer = totalLength - resultLength;
  result.push(Array(buffer).join('.'));
  if (!isTest) {
    process.stdout.write(npmlist.prettify.apply(null, result));
  }
  return result.slice(0, 2);
};

npmlist.npmls = function(global) {
  var cmd, scope;
  cmd = 'npm ls';
  scope = '(local)';
  if (global) {
    cmd = [cmd, ' -g'].join(' ');
    scope = '(global)';
  }
  return exec(cmd, function(err, stdout, stderr) {
    var empty, list, msg, result, totalLength;
    msg = ['Installed npm packages:', scope].join(' ');
    totalLength = msg.length - 1;
    msg = ['\n', blue, msg, '\n\n'].join('');
    process.stdout.write(msg);
    list = stdout.split('\n');
    if (list.filter(npmlist.isEmpty).length) {
      empty = [magenta, '(empty)', reset, '\n'].join('');
      return process.stdout.write(empty);
    }
    result = list.filter(npmlist.isMainPackage);
    return result.map(npmlist.logger.bind(null, totalLength));
  });
};

npmlist.init = function() {
  var flag;
  flag = process.argv[2];
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
      return npmlist.npmls(false);
    case void 0:
      return npmlist.npmls(true);
    default:
      return npmlist.unknownCommand(flag);
  }
};

if (isTest) {
  module.exports = npmlist;
} else {
  module.exports.call = npmlist.init;
}
