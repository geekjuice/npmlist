
###
    npm ls replacement

    - Pretty log of installed npm list
    - Current npm (1.4.4) list's depth 0 is broken

    by Nicholas Hwang
###


# Require
{ exec } = require('child_process')
{ readFile } = require('fs')
{ join } = require('path')

Conf = require('./color_conf')
c = require('./color')

# Constants
SCOPEVAR = 'npmlist.scope'

# Global
Npmlist = {}


###
# Test?
###
isTest = global.NODE_ENV is 'test'


###
# Help/Usage
###
Npmlist.help = ->
  console.log """

  Usage: npmlist [flags]

  Flags:
    -h,         [--]help                  This message
    -v,         [--]version               Version number
    -l,         [--]local                 Local packages
    -g,         [--]global                Global packages
    -cs,        [--]colorscheme           Display current colorscheme
    -d=n,       [--]depth=n               Traverse n levels deep
    -c=x,y,z,   [--]colors=x,y,z          Use colors specified
    -sc=x,y,z,  [--]setcolors=x,y,z       Set colors (persistent)
    -ss=scope   [--]setscope=scope        Set global or local (persistent)

              """
  process.exit(1) unless isTest


###
# Version
###
Npmlist.version = (callback) ->
  pkgjson = join __dirname, '../../package.json'
  readFile pkgjson, (err, file) ->
    throw err if err
    json = JSON.parse file
    version = "npmlist v" + json.version
    console.log version unless isTest
    callback version if callback


###
# Unknown Command
###
Npmlist.unknownCommand = (flag) ->
  console.log "\nUnknown argument: #{flag}"
  Npmlist.help()


###
# Check if no packages
###
Npmlist.isEmpty = (list) -> /^└\W+(empty)/.test list


###
# Get scope from npmrc
###
Npmlist.getScope = (callback) ->
  exec "npm get #{SCOPEVAR}", (err, stdout, stderr) ->
    callback if /^local$/i.test stdout.trim() then false else true


###
# Set scope to npmrc
###
Npmlist.setScope = (scope) ->
  scope = if /^l(ocal)?$/i.test scope then 'local' else 'global'
  exec "npm set #{SCOPEVAR} #{scope}", (err, stdout, stderr) ->
    msg = "Scope will no default to: "
    scope = if scope is 'local'
    then "#{c.magenta}#{scope}"
    else "#{c.cyan}#{scope}"
    msg = ['\n',c.blue,msg,scope,c.reset,'\n'].join ''
    process.stdout.write msg
    process.exit(1)


###
# Check if within depth
###
Npmlist.depth = (level, pkg) ->
  regex = new RegExp "^(.{0,#{2*level}})[├└].*", 'g'
  regex.test pkg


###
# Get depth
###
Npmlist.getDepth = (padding) -> (padding - 4) / 2


###
# Get max line width to ensure full display
###
Npmlist.lineWidth = (lines, lowerlimit) ->
  width = lines.reduce (prev,curr) ->
    if curr.length > prev then curr.length else prev
  , 0
  if width > lowerlimit then width else lowerlimit


###
# Strip source - pkg@version (source)
###
Npmlist.stripSource = (line) ->
  regex = /^(\W+[^ ]+)(.*)/
  match = line.match regex
  match[1] + (if match[2] then '*' else '')


###
# Extract relevance
###
Npmlist.parseResult = (result, width) ->
  depth = Npmlist.getDepth result[1].length
  pkg = result[2].split '@'
  pkgLength = pkg[0].length + pkg[1].length
  buffer = width - pkgLength - depth*2
  pkg.push Array(buffer).join('.'), depth
  pkg


###
# Prettify package and version
###
Npmlist.prettify = (pkg,version,spaces,depth) ->
  pkgcolor = if depth
  then c[Npmlist.colors.subpkg]
  else c[Npmlist.colors.pkg]

  p = [pkgcolor,pkg,c.reset].join ''
  v = [c[Npmlist.colors.version],'[',version,']',c.reset].join ''
  s = [c[Npmlist.colors.dots],spaces,c.reset].join ''
  l = Array(depth*2+1).join ' '

  [l,p,s,v,'\n'].join ''


###
# Write to stdout
###
Npmlist.logger = (length,line) ->
  regex = /^(\W+)([^ ]+)/
  result = line.match regex
  pkg = Npmlist.parseResult result, length
  process.stdout.write Npmlist.prettify.apply null,pkg unless isTest
  pkg.slice 0, 2 # Return pkg and version if needed


###
# Main npm list function
###
Npmlist.npmls = (global, depth=0, colors='') ->

  runCommand = ->
    # Run npm list and parse
    exec cmd, (err, stdout, stderr) ->

      # Command top message
      msg = ['Installed npm packages:',scope].join ' '
      width = msg.length - 1
      banner = ['\n',c[Npmlist.colors.banner],msg,c.reset,'\n\n'].join ''
      process.stdout.write banner

      # Split full npm list tree by newline and filter by depth
      list = stdout.split '\n'
      if list.filter(Npmlist.isEmpty).length
        empty = [c[Npmlist.colors.pkg],'(empty)',c.reset,'\n'].join ''
        return process.stdout.write(empty)
      lines = list.filter Npmlist.depth.bind null, depth
      lines = lines.map Npmlist.stripSource
      width = Npmlist.lineWidth lines, width
      lines.map Npmlist.logger.bind null,width

  # Set cmd and scope
  cmd = 'npm ls'
  scope = '(local)'
  if global
    cmd = [cmd,' -g'].join ' '
    scope = '(global)'

  # Set colors and run command
  if colors.length
    Npmlist.colors = Conf.parseColors colors
    runCommand()
  else
    Conf.getColors (colors) ->
      Npmlist.colors = Conf.parseColors colors
      runCommand()


###
# Initialize
###
Npmlist.init = ->

  # Args
  args = process.argv.slice 2

  # Defaults
  depth = 0
  flag = undefined
  colors = ''
  setColors = ''
  getColors = false
  scope = ''

  # Regex
  depthRegex = /^(?:(?:--)?depth|-d)=(\d+)/
  flagRegex = /^(?:(?:(?:--)?(?:scope|colorscheme|global|local|version|help))|(?:-(?:s|cs|g|l|v|h)))$/g
  colorRegex = /^(?:(?:--)?colors|-c)=(.+)/
  setRegex = /^(?:(?:--)?setcolors|-sc)=(.+)/
  scopeRegex = /^(?:(?:--)?setscope|-ss)=(.+)/

  # Parse arguments
  for arg in args
    flagMatches = arg.match flagRegex
    depthMatches = arg.match depthRegex
    colorMatches = arg.match colorRegex
    setMatches = arg.match setRegex
    scopeMatches = arg.match scopeRegex
    unless flagMatches or depthMatches or colorMatches or
      setMatches or scopeMatches
        Npmlist.unknownCommand arg
    flag = flagMatches[0] if flagMatches and flag is undefined
    depth = depthMatches[1] if depthMatches and depth is 0
    colors = colorMatches[1] if colorMatches and colors.length is 0
    setColors = setMatches[1] if setMatches and setColors.length is 0
    scope = scopeMatches[1] if scopeMatches and scope.length is 0

  # Set scope and return early
  if scope.length isnt 0
    Npmlist.setScope scope

  # Set colors and return early
  if setColors.length isnt 0
    Conf.setColors setColors

  # Flag switch
  else
    switch flag
      when "colorscheme","-cs","--colorscheme"
        Conf.colorscheme()
      when "help","-h","--help"
        Npmlist.help()
      when "version","-v","--version"
        Npmlist.version()
      when "global","-g","--global"
        Npmlist.npmls true, depth, colors
      when "local","-l","--local"
        Npmlist.npmls false, depth, colors
      else
        Npmlist.getScope (global) ->
          Npmlist.npmls global, depth, colors


###
# Export
###
if isTest
  module.exports = Npmlist
else
  module.exports.call = Npmlist.init

