
/*
    npm ls replacement
    - Pretty log of installed npm list
    - Current npm (1.4.4) list's depth 0 is broken

    by Nicholas Hwang
 */
var blue, cyan, exec, grey, help, init, isEmpty, isMainPackage, join, logger, magenta, npmls, prettify, readFile, reset, unknownCommand, version, yellow;

exec = require('child_process').exec;

readFile = require('fs').readFile;

join = require('path').join;

help = function() {
  console.log("\nUsage: npmlist [flags]\n\nFlags:\n  local, -l, --local        Local packages\n  help, -h, --help          This message\n  version, -v, --version    Version number\n");
  return process.exit(1);
};

version = function() {
  var pkgjson;
  pkgjson = join(__dirname, '../../package.json');
  return readFile(pkgjson, function(err, file) {
    var json;
    if (err) {
      throw err;
    }
    json = JSON.parse(file);
    return console.log("npmlist v" + json.version);
  });
};

unknownCommand = function(flag) {
  console.log("\nUnknown flag: " + flag);
  return help();
};

yellow = '\x1B[33m';

blue = '\x1B[34m';

magenta = '\x1B[35m';

cyan = '\x1B[36m';

grey = '\x1B[90m';

reset = '\x1B[0m';

prettify = function(pkg, version, spaces) {
  var p, s, v;
  p = [magenta, pkg, reset].join('');
  v = [cyan, '[', version, ']', reset].join('');
  s = [grey, spaces, reset].join('');
  return [p, s, v, '\n'].join('');
};

isEmpty = function(list) {
  return /^└\W+(empty)/.test(list);
};

isMainPackage = function(pkg) {
  return /^[├└].*/g.test(pkg);
};

logger = function(totalLength, line) {
  var buffer, regex, result;
  regex = /^\W+([^ ]+)/;
  result = line.match(regex)[1].split('@');
  buffer = totalLength - result[0].length - result[1].length;
  result.push(Array(buffer).join('.'));
  return process.stdout.write(prettify.apply(null, result));
};

npmls = function(global) {
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
    if (list.filter(isEmpty).length) {
      empty = [magenta, '(empty)', reset, '\n'].join('');
      return process.stdout.write(empty);
    }
    result = list.filter(isMainPackage);
    return result.map(logger.bind(null, totalLength));
  });
};

init = function() {
  var flag;
  flag = process.argv[2];
  switch (flag) {
    case "help":
    case "-h":
    case "--help":
      return help();
    case "version":
    case "-v":
    case "--version":
      return version();
    case "local":
    case "-l":
    case "--local":
      return npmls(false);
    case void 0:
      return npmls(true);
    default:
      return unknownCommand(flag);
  }
};

exports.call = init;
