"use strict";

/*
 * Colors for output
 */

module.exports = {
  // Reset and overwrite
  reset: "\u001b[0m",
  rewrite: "\u001b[1A\u001b[0K",

  // Style
  bold: "\u001b[1m",
  italic: "\u001b[3m",
  underline: "\u001b[4m",
  inverse: "\u001b[7m",
  strikethrough: "\u001b[9m",

  // Greyscale FG
  white: "\u001b[37m",
  grey: "\u001b[90m",
  black: "\u001b[30m",

  // Color FG
  blue: "\u001b[34m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  magenta: "\u001b[35m",
  red: "\u001b[31m",
  yellow: "\u001b[33m",

  // Greyscale BG
  whitebg: "\u001b[47m",
  greybg: "\u001b[49;5;8m",
  blackbg: "\u001b[40m",

  // Color BG
  bluebg: "\u001b[44m",
  cyanbg: "\u001b[46m",
  greenbg: "\u001b[42m",
  magentabg: "\u001b[45m",
  redbg: "\u001b[41m",
  yellowbg: "\u001b[43m"
};