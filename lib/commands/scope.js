import chalk from 'chalk';
import {exec} from 'child_process';

const CONFIG = 'npmlist.scope';

const FLIP = '(╯°□°）╯︵ ┻━┻ ';

const UNFLIP = '┬──┬ ﾉ(°—°ﾉ)';

const ERROR_MSG = `
  ${chalk.red(FLIP)}

  Something went terribly wrong...

  Let ${chalk.yellow('Nick')} know on ${chalk.blue('GitHub (geekjuice/npmlist)')}
  Sorry about that... ${chalk.cyan(UNFLIP)}`;

function error() {
  console.log(ERROR_MSG);
  process.exit(1);
}

export default {
  get(cb) {
    const cmd = `npm get ${CONFIG}`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        error();
      }
      stdout = stdout.trim() === 'local' ? 'local' : 'global';
      cb(stdout);
    });
  },

  set(scope) {
    const cmd = `npm set ${CONFIG} ${scope}`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        error();
      }
      console.log(`Scope set to ${chalk.cyan(scope)}`);
      process.exit(0);
    });
  },

  run(scope) {
    if (scope) {
      this.set(scope);
    } else {
      this.get(current => {
        console.log(`Current scope: ${chalk.cyan(current)}`);
      });
    }
  }
};
