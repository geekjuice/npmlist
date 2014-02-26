
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


# Help/Usage
help = ->
  console.log """

  Usage: npmlist [flags]

  Flags:
    local, -l, --local        Local packages
    help, -h, --help          This message
    version, -v, --version    Version number

              """
  process.exit(1)


# Version
version = ->
  pkgjson = join __dirname, '../../package.json'
  readFile pkgjson, (err, file) ->
    throw err if err
    json = JSON.parse file
    console.log "npmlist v" + json.version


# Unknown Command
unknownCommand = (flag) ->
  console.log "\nUnknown flag: #{flag}"
  help()


# Output Colors
yellow = '\x1B[33m'
blue = '\x1B[34m'
magenta = '\x1B[35m'
cyan ='\x1B[36m'
grey = '\x1B[90m'
reset = '\x1B[0m'


# Prettify package and version
prettify = (pkg,version,spaces) ->
  p = [magenta,pkg,reset].join ''
  v = [cyan,'[',version,']',reset].join ''
  s = [grey,spaces,reset].join ''
  [p,s,v,'\n'].join ''


# Check if no packages
isEmpty = (list) -> /^└\W+(empty)/.test list


# Check if main package
isMainPackage = (pkg) -> /^[├└].*/g.test pkg


# Write to stdout
logger = (totalLength,line) ->
  regex = /^\W+([^ ]+)/
  result = line.match(regex)[1].split '@'
  buffer = totalLength - result[0].length - result[1].length
  result.push Array(buffer).join '.'
  process.stdout.write prettify.apply null,result


# Main npm list function
npmls = (global) ->
  cmd = 'npm ls'
  scope = '(local)'
  if global
    cmd = [cmd,' -g'].join ' '
    scope = '(global)'
  exec cmd, (err, stdout, stderr) ->
    msg = ['Installed npm packages:',scope].join ' '
    totalLength = msg.length - 1
    msg = ['\n',blue,msg,'\n\n'].join ''
    process.stdout.write msg
    list = stdout.split '\n'
    if list.filter(isEmpty).length
      empty = [magenta,'(empty)',reset,'\n'].join ''
      return process.stdout.write(empty)
    result = list.filter isMainPackage
    result.map logger.bind null,totalLength


# Initialize
init = ->

  # Flag
  flag = process.argv[2]

  # Flag switch
  switch flag
    when "help","-h","--help"             then help()
    when "version","-v","--version"       then version()
    when "local","-l","--local"           then npmls false
    when undefined                        then npmls true
    else unknownCommand flag


# Export
exports.call = init
