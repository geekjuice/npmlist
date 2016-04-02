/**
 * Copyright 2016 Nicholas Hwang
 * MIT Licensed
 *
 * @module cli.js
 */

import commands from './commands';
import npmlist from './npmlist';

const ARGS = process.argv.slice(2);

const REGEX = {
  help: /^(?:(?:--)?help|-h)$/,
  version: /^(?:(?:--)?version|-v)$/,
  local: /^(?:(?:--)?local|-l)$/,
  global: /^(?:(?:--)?global|-g)$/,
  dev: /^(?:(?:--)?dev|-d)$/,
  prod: /^(?:(?:--)?prod|-p)$/,
  depth: /^(?:(?:--)?depth|-n)=(\d+)$/,
  scope: /^(?:(?:--)?scope|-s)(?:=(local|global))?$/
};

const flags = {
  scope: 'global',
  depth: 0
};

let executed = false;

ARGS.forEach(arg => {
  let invalid = true;

  for (const option in REGEX) {
    if ({}.hasOwnProperty.call(REGEX, option)) {
      const matches = arg.match(REGEX[option]);
      if (matches) {
        invalid = false;
        const [value] = matches.slice(1);
        if (commands[option]) {
          commands[option].run(value);
          executed = true;
        } else {
          flags[option] = value || option;
        }
      }
    }
  }

  if (invalid) {
    commands.unknown.run(arg);
  }
});

if (!executed) {
  commands.scope.get(current => {
    const {global, local, dev, prod, scope} = flags;
    flags.scope = global || local || current || scope;
    flags.env = prod || dev;
    npmlist.run(flags);
  });
}
