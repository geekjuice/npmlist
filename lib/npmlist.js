/**
 * Copyright 2016 Nicholas Hwang
 * MIT Licensed
 *
 * @module npmlist.js
 */

import { exec } from 'child_process';
import { clean } from './utils';
import {
  red,
  yellow,
  cyan,
  blue,
  black,
  magenta
} from 'chalk';

const BUFFER = 4;

const REGEX = {
  package: /^([│ ]*)[└├+`][─-]+┬?\s+(.*)@(.*)$/,
  invalid: /^(.*)\s+invalid$/,
  unmet: /^.*UNMET DEPENDENCY\s+(.*)$/,
  version: /^([\d.]*)(?:\s+->\s+(.*))$/
};

function cmd(flags) {
  const { depth, env, scope } = flags;
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
      return red(msg);
    case 1:
      return yellow(msg);
    default:
      return cyan(msg);
  }
}

export default {
  run(flags = {}) {
    exec(cmd(flags), (err, stdout) => {
      const pkgs = [];
      const lines = clean(stdout.split('\n'));

      // Banner
      const type = flags.env ? flags.env : 'npm';
      const banner = `\nInstalled ${type} packages: (${flags.scope})\n`;
      console.log(blue(banner));

      let maxLength = banner.trim().length - BUFFER;

      lines.forEach(line => {
        let logLevel = 0;
        const pkgMatches = line.match(REGEX.package);

        if (pkgMatches) {
          const matches = pkgMatches.slice(1);
          const [bars] = matches;
          let [, name, version] = matches;

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
            spaces ? black(name) : magenta(name),

            // Dotted spacing
            black(new Array(maxLength - pkgLength + 1 + BUFFER).join('.')),

            // Version
            log(logLevel, version)
          ].join('');

          console.log(msg);
        });
      } else {
        const msg = magenta('No packages found.');
        console.log(msg);
      }
    });
  }
};
