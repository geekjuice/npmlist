import chalk from 'chalk';
import {exec} from 'child_process';
import {clean} from './utils';

const REGEX = {
  package: /^([│ ]*)[└├]─+┬?\s+(.*)@(.*)$/,
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

// TODO: Clean up
export default {
  run(flags={}) {
    exec(cmd(flags), (err, stdout, stderr) => {
      if (err) {}

      const pkgs = [];
      const lines = clean(stdout.split('\n'));

      const buffer = 4;
      // TODO: Display dev/prod info
      const banner = `\nInstalled npm packages: (${flags.scope})\n`;
      console.log(chalk.blue(banner));

      let maxLength = banner.length - buffer;

      lines.forEach(line => {
        let pkgMatches = line.match(REGEX.package);

        if (pkgMatches) {
          let [bars, name, version] = pkgMatches.slice(1);
          const unmetMatches = name.match(REGEX.unmet);
          const versionMatches = version.match(REGEX.version);

          if (unmetMatches) {
            ([name, version] = [unmetMatches[1], 'UNMET']);
          }

          if (versionMatches) {
            version = `${versionMatches[1]}*`;
          }

          version = `[${version}]`;

          const spaces = new Array(bars.length + 1).join(' ');
          const pkgLength = spaces.length + name.length + version.length;
          maxLength = Math.max(maxLength, pkgLength);

          pkgs.push({
            spaces,
            name,
            version,
            pkgLength
          });
        }
      });

      pkgs.forEach(pkg => {
        const {spaces, name, version, pkgLength} = pkg;
        const msg = [
          spaces,
          spaces ? chalk.black(name) : chalk.magenta(name),
          chalk.black(new Array(maxLength - pkgLength + 1 + buffer).join('.')),
          version === '[UNMET]' ? chalk.red(version) : chalk.cyan(version)
        ].join('');

        console.log(msg);
      });

    });
  }
};
