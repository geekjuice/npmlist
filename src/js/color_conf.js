
/*
  Color configs
 */
var COLORS, COLORVAR, ColorConf, NPMRC, c, exec, existsSync, join;

exec = require('child_process').exec;

existsSync = require('fs').existsSync;

join = require('path').join;

c = require('./color');

NPMRC = join(process.env.HOME, '.npmrc');

COLORVAR = 'npmlist.colors';

COLORS = {
  pkg: 'magenta',
  version: 'cyan',
  banner: 'blue',
  dots: 'grey',
  subpkg: 'grey'
};

ColorConf = {};


/*
 * Duplicate array
 */

ColorConf.duplicate = function(arr, n) {
  var elem, i, out, _i;
  out = [];
  elem = arr;
  if (Object.prototype.toString.call(arr) !== '[object Array]') {
    elem = [arr];
  }
  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
    out = out.concat(elem);
  }
  return out;
};


/*
 * Downcaser
 */

ColorConf.downcase = function(arr) {
  return arr.map(function(a) {
    return a.toLowerCase();
  });
};


/*
 * Sanitizer
 */

ColorConf.sanitize = function(str) {
  return ColorConf.downcase(str.trim().split(/\s*,\s*/g));
};


/*
 * Check if ~/.npmrc exists
 */

ColorConf.npmrcExists = function() {
  return existsSync(NPMRC);
};


/*
 * Get color config from ~/.npmrc
 */

ColorConf.getColors = function(callback) {
  return exec("npm get " + COLORVAR, function(err, stdout, stderr) {
    return callback(stdout.trim() === 'undefined' ? 'default' : stdout);
  });
};


/*
 * Set color config to ~/.npmrc
 */

ColorConf.setColors = function(colors) {
  colors = ColorConf.sanitize(colors.replace(/\s+/g, ''));
  return exec("npm set " + COLORVAR + " " + colors, function(err, stdout, stderr) {
    if (err) {
      console.log(err);
    }
    return ColorConf.colorscheme('Colorscheme set to:');
  });
};


/*
 * List colorscheme
 */

ColorConf.colorscheme = function(banner) {
  if (banner == null) {
    banner = '';
  }
  return ColorConf.getColors(function(currentColors) {
    var buffer, color, colors, dots, i, maps, msg, type, width, _i;
    colors = [];
    if (currentColors.trim() === 'undefined') {
      for (type in COLORS) {
        color = COLORS[type];
        colors.push(color);
      }
    } else {
      currentColors = ColorConf.parseColors(currentColors);
      for (type in currentColors) {
        color = currentColors[type];
        colors.push(color);
      }
    }
    width = 30;
    maps = ['Package', 'Version', 'Banner', 'Dots', 'Sub-package'];
    if (!banner.length) {
      banner = 'Current colorscheme:';
    }
    process.stdout.write(['\n', c.blue, banner, c.reset, '\n\n'].join(''));
    for (i = _i = 0; _i < 5; i = ++_i) {
      color = colors[i];
      buffer = width - (maps[i].length + color.length);
      dots = [c.grey, Array(buffer).join('.'), c.reset].join('');
      msg = [maps[i], dots, c[color], color, c.reset, '\n'].join('');
      process.stdout.write(msg);
    }
    return process.exit(1);
  });
};


/*
 * Parse colors
 */

ColorConf.parseColors = function(colors) {
  var colorMap, colorsLength;
  colorMap = COLORS;
  colors = ColorConf.sanitize(colors);
  colorsLength = colors.length;
  if (~colors.indexOf('default')) {
    colorMap;
  } else if (~colors.indexOf('sans')) {
    colorMap = ColorConf.mapColors(ColorConf.duplicate('system', 5));
  } else if (colorsLength >= 5) {
    colorMap = ColorConf.mapColors(colors);
  } else if (colorsLength === 4) {
    colorMap = ColorConf.mapColors(colors.concat('grey'));
  } else if (colorsLength === 3) {
    colorMap = ColorConf.mapColors(colors.concat('grey', 'grey'));
  } else if (colorsLength === 2) {
    colorMap.pkg = colors[0];
    colorMap.version = colors[1];
  } else if (colorsLength === 1) {
    colorMap = ColorConf.mapColors(ColorConf.duplicate(colors[0], 5));
  }
  return colorMap;
};


/*
 * Color Mapper
 */

ColorConf.mapColors = function(colors) {
  return {
    pkg: colors[0],
    version: colors[1],
    banner: colors[2],
    dots: colors[3],
    subpkg: colors[4]
  };
};


/*
 * Export
 */

module.exports = ColorConf;
