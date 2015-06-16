import chalk from 'chalk';
import help from './help';

export default {
  run(opt) {
    console.log(`\n  Invalid option: ${chalk.yellow(opt)}`);
    help.run(1);
  }
};
