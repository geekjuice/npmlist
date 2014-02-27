
###
    npm ls replacement
    - Pretty log of installed npm list
    - Current npm (1.4.4) list's depth 0 is broken

    by Nicholas Hwang
###


# Require
{ exec } = require 'child_process'
{ readFile } = require 'fs'
{ join } = require 'path'


# Global
npmlist = {}


# Output Colors
yellow = '\x1B[33m'
blue = '\x1B[34m'
magenta = '\x1B[35m'
cyan ='\x1B[36m'
grey = '\x1B[90m'
reset = '\x1B[0m'

# Test?
isTest = global.NODE_ENV is 'test'

# Help/Usage
npmlist.help = ->
  console.log """

  Usage: npmlist [flags] [--depth=n]

  Flags:
    help, -h, --help          This message
    version, -v, --version    Version number
    local, -l, --local        Local packages
    --depth=n                 Traverse n levels deep (default: 0)

              """
  process.exit(1) unless isTest


# Version
npmlist.version = (callback) ->
  pkgjson = join __dirname, '../../package.json'
  readFile pkgjson, (err, file) ->
    throw err if err
    json = JSON.parse file
    version = "npmlist v" + json.version
    console.log version unless isTest
    callback version if callback


# Unknown Command
npmlist.unknownCommand = (flag) ->
  console.log "\nUnknown argument: #{flag}"
  npmlist.help()


# Check if no packages
npmlist.isEmpty = (list) -> /^└\W+(empty)/.test list


# Check if within depth
npmlist.depth = (level, pkg) ->
  regex = new RegExp "^(.{0,#{2*level}})[├└].*", 'g'
  regex.test pkg


# Get depth
npmlist.getDepth = (padding) -> (padding - 4) / 2


# Get max line width to ensure full display
npmlist.lineWidth = (lines, lowerlimit) ->
  width = lines.reduce (prev,curr) ->
    if curr.length > prev then curr.length else prev
  , 0
  if width > lowerlimit then width else lowerlimit


# Extract relevance
npmlist.parseResult = (result, width) ->
  depth = npmlist.getDepth result[1].length
  pkg = result[2].split '@'
  pkgLength = pkg[0].length + pkg[1].length
  buffer = width - pkgLength - depth*2
  pkg.push Array(buffer).join('.'), depth
  pkg


# Prettify package and version
npmlist.prettify = (pkg,version,spaces,depth) ->
  color = if depth then grey else magenta
  p = [color,pkg,reset].join ''
  v = [cyan,'[',version,']',reset].join ''
  s = [grey,spaces,reset].join ''
  l = Array(depth*2+1).join ' '
  [l,p,s,v,'\n'].join ''


# Write to stdout
npmlist.logger = (length,line) ->
  regex = /^(\W+)([^ ]+)/
  result = line.match regex
  pkg = npmlist.parseResult result, length
  process.stdout.write npmlist.prettify.apply null,pkg unless isTest
  pkg.slice 0, 2 # Return pkg and version if needed


# Main npm list function
npmlist.npmls = (global, depth = 0) ->

  # Set cmd and scope
  cmd = 'npm ls'
  scope = '(local)'
  if global
    cmd = [cmd,' -g'].join ' '
    scope = '(global)'

  # Run npm list and parse
  exec cmd, (err, stdout, stderr) ->

    # Command top message
    msg = ['Installed npm packages:',scope].join ' '
    width = msg.length - 1
    msg = ['\n',blue,msg,'\n\n'].join ''
    process.stdout.write msg

    # Split full npm list tree by newline and filter by depth
    list = stdout.split '\n'
    if list.filter(npmlist.isEmpty).length
      empty = [magenta,'(empty)',reset,'\n'].join ''
      return process.stdout.write(empty)
    lines = list.filter npmlist.depth.bind null, depth
    width = npmlist.lineWidth lines, width
    lines.map npmlist.logger.bind null,width


# Initialize
npmlist.init = ->

  # Args
  args = process.argv.slice 2

  # Parse arguments (Greedy)
  depth = 0
  flag = undefined
  depthRegex = /--depth=(\d+)/
  flagRegex = /^(?:(?:(?:--)?(?:local|version|help))|(?:-(?:h|v|l)))$/g
  for arg in args
    flagMatches = arg.match flagRegex
    depthMatches = arg.match depthRegex
    npmlist.unknownCommand arg unless flagMatches or depthMatches
    depth = depthMatches[1] if depthMatches and depth is 0
    flag = flagMatches[0] if flagMatches and flag is undefined

  # Flag switch
  switch flag
    when "help","-h","--help"             then npmlist.help()
    when "version","-v","--version"       then npmlist.version()
    when "local","-l","--local"           then npmlist.npmls false, depth
    else npmlist.npmls true, depth


# Export
if isTest
  module.exports = npmlist
else
  module.exports.call = npmlist.init

