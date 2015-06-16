import chalk from 'chalk';

const HELP = `
  Usage ${chalk.cyan('npmlist')} ${chalk.magenta('[options]')}

  Options:

  -h          [--]help           This message
  -v          [--]version        Version number
  -d          [--]dev            Only devDependencies
  -p          [--]prod           Only dependencies
  -l          [--]local          Local packages
  -g          [--]global         Global packages
  -d=n        [--]depth=n        Traverse n levels deep
  -s=scope    [--]scope=scope    Set persistent scope [local|global]`;

export default {
  run(code) {
    console.log(HELP);
    process.exit(code || 0);
  }
};
