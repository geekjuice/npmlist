
###
  Color configs
###


# Require
{ exec } = require('child_process')
{ existsSync } = require('fs')
{ join } = require('path')

c = require('./color')

# Constants
HOMEDIR = if process.platform is 'win32' then 'USERPROFILE' else 'HOME'
NPMRC = join(process.env[HOMEDIR], '.npmrc')
COLORVAR = 'npmlist.colors'
COLORS =
  pkg:      'magenta'
  version:  'cyan'
  banner:   'blue'
  dots:     'grey'
  subpkg:   'grey'

# Globals
ColorConf = {}


###
# Duplicate array
###
ColorConf.duplicate = (arr, n) ->
  out = []
  elem = arr
  unless Object::toString.call(arr) is '[object Array]'
    elem = [arr]
  out = out.concat elem for i in [0...n]
  out


###
# Downcaser
###
ColorConf.downcase = (arr) ->
  arr.map (a) -> a.toLowerCase()


###
# Sanitizer
###
ColorConf.sanitize = (str) ->
  ColorConf.downcase str.trim().split /\s*,\s*/g


###
# Check if ~/.npmrc exists
###
ColorConf.npmrcExists = -> existsSync NPMRC


###
# Get color config from ~/.npmrc
###
ColorConf.getColors = (callback) ->
  exec "npm get #{COLORVAR}", (err, stdout, stderr) ->
    callback if stdout.trim() is 'undefined' then 'default' else stdout


###
# Set color config to ~/.npmrc
###
ColorConf.setColors = (colors) ->
  colors = ColorConf.sanitize colors.replace /\s+/g, ''
  exec "npm set #{COLORVAR} #{colors}", (err, stdout, stderr) ->
    console.log err if err
    ColorConf.colorscheme 'Colorscheme set to:'


###
# List colorscheme
###
ColorConf.colorscheme = (banner='') ->
  ColorConf.getColors (currentColors) ->
    # Determine if colors set or fallbacking to defaults
    colors = []
    if currentColors.trim() is 'undefined'
      colors.push color for type,color of COLORS
    else
      currentColors = ColorConf.parseColors currentColors
      colors.push color for type,color of currentColors

    # Display banner
    width = 30
    maps = ['Package','Version','Banner','Dots','Sub-package']
    banner = 'Current colorscheme:' unless banner.length
    process.stdout.write ['\n',c.blue, banner, c.reset,'\n\n'].join ''

    # Loop through color mapping and output showing color
    for i in [0...5]
      color = colors[i]
      buffer = width - (maps[i].length + color.length)
      dots = [c.grey,Array(buffer).join('.'),c.reset].join ''
      msg = [maps[i],dots,c[color],color,c.reset,'\n'].join ''
      process.stdout.write msg

    process.exit(1)

###
# Parse colors
###
ColorConf.parseColors = (colors) ->
  colorMap = COLORS

  # Split string into array
  colors = ColorConf.sanitize colors

  # Get number of color inputs
  colorsLength = colors.length

  # Determine colorscheme
  if ~colors.indexOf 'default'
    colorMap
  else if ~colors.indexOf 'sans'
    colorMap = ColorConf.mapColors ColorConf.duplicate 'system', 5
  else if colorsLength >= 5
    colorMap = ColorConf.mapColors colors
  else if colorsLength is 4
    colorMap = ColorConf.mapColors colors.concat('grey')
  else if colorsLength is 3
    colorMap = ColorConf.mapColors colors.concat('grey', 'grey')
  else if colorsLength is 2
    colorMap.pkg      = colors[0]
    colorMap.version  = colors[1]
  else if colorsLength is 1
    colorMap = ColorConf.mapColors ColorConf.duplicate colors[0], 5

  colorMap


###
# Color Mapper
###
ColorConf.mapColors = (colors) ->
  pkg:      colors[0]
  version:  colors[1]
  banner:   colors[2]
  dots:     colors[3]
  subpkg:   colors[4]


###
# Export
###
module.exports = ColorConf
