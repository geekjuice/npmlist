import pkg from '../../package';

export default {
  run() {
    console.log(`v${pkg.version}`);
    process.exit(0);
  }
};
