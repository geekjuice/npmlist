import chalk from 'chalk';
import {exec} from 'child_process';
import {clean} from './utils';

const BUFFER = 4;

const REGEX = {
  package: /^([│ ]*)[└├+][─-]+┬?\s+(.*)@(.*)$/,
  invalid: /^(.*)\s+invalid$/,
  unmet: /^.*UNMET DEPENDENCY\s+(.*)$/,
  version: /^([\d.]*)(?:\s+->\s+(.*))$/
};

function cmd(flags) {
  const {depth, env, scope} = flags;
  return [
    'npm ls',
    `--depth=${depth}`,
    env ? `--${env}` : '',
    scope === 'global' ? '-g' : ''
  ].join(' ');
}

function log(level, msg) {
  switch (level) {
    case 2:
      return chalk.red(msg);
    case 1:
      return chalk.yellow(msg);
    default:
      return chalk.cyan(msg);
  }
}

export default {
  run(flags={}) {
    exec(cmd(flags), (err, stdout, stderr) => {
      if (err) {}

      const pkgs = [];
      const lines = clean(stdout.split('\n'));

      // Banner
      const type = flags.env ? flags.env : 'npm';
      const banner = `\nInstalled ${type} packages: (${flags.scope})\n`;
      console.log(chalk.blue(banner));

      let maxLength = banner.trim().length - BUFFER;

      lines.forEach(line => {
        let logLevel = 0;
        let pkgMatches = line.match(REGEX.package);

        if (pkgMatches) {
          let [bars, name, version] = pkgMatches.slice(1);
          const unmetMatches = name.match(REGEX.unmet);
          const invalidMatches = version.match(REGEX.invalid);
          const versionMatches = version.match(REGEX.version);

          // Check for invalid dependencies
          if (invalidMatches) {
            logLevel = 2;
            version = invalidMatches[1];
          }

          // Check for UNMET dependencies
          if (unmetMatches) {
            logLevel = 1;
            ([name, version] = [unmetMatches[1], 'UNMET']);
          }

          // Check for linked packages
          if (versionMatches) {
            logLevel = 1;
            version = versionMatches[1];
          }

          // Format depth and version
          version = `[${version}]`;
          const spaces = new Array(bars.length + 1).join(' ');

          // Calculate longest string
          const pkgLength = spaces.length + name.length + version.length;
          maxLength = Math.max(maxLength, pkgLength);

          pkgs.push({
            spaces,
            name,
            version,
            pkgLength,
            logLevel
          });
        }
      });

      if (pkgs.length) {
        pkgs.forEach(pkg => {
          const {spaces, name, version, pkgLength, logLevel} = pkg;
          const msg = [
            // Add depth
            spaces,

            // Top-level or dependency
            spaces ? chalk.black(name) : chalk.magenta(name),

            // Dotted spacing
            chalk.black(new Array(maxLength - pkgLength + 1 + BUFFER).join('.')),

            // Version
            log(logLevel, version)
          ].join('');

          console.log(msg);
        });
      } else {
        const msg = chalk.magenta('No packages found.');
        console.log(msg);
      }

    });
  }
};
