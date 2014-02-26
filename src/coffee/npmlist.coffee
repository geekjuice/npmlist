
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

  Usage: npmlist [flags]

  Flags:
    local, -l, --local        Local packages
    help, -h, --help          This message
    version, -v, --version    Version number

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
  console.log "\nUnknown flag: #{flag}"
  npmlist.help()


# Prettify package and version
npmlist.prettify = (pkg,version,spaces) ->
  p = [magenta,pkg,reset].join ''
  v = [cyan,'[',version,']',reset].join ''
  s = [grey,spaces,reset].join ''
  [p,s,v,'\n'].join ''


# Check if no packages
npmlist.isEmpty = (list) -> /^└\W+(empty)/.test list


# Check if main package
npmlist.isMainPackage = (pkg) -> /^[├└].*/g.test pkg


# Write to stdout
npmlist.logger = (totalLength,line) ->
  regex = /^\W+([^ ]+)/
  result = line.match(regex)[1].split '@'
  resultLength = result[0].length + result[1].length
  buffer = totalLength - resultLength
  result.push Array(buffer).join '.'
  process.stdout.write npmlist.prettify.apply null,result unless isTest
  result.slice 0, 2


# Main npm list function
npmlist.npmls = (global) ->
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
    if list.filter(npmlist.isEmpty).length
      empty = [magenta,'(empty)',reset,'\n'].join ''
      return process.stdout.write(empty)
    result = list.filter npmlist.isMainPackage
    result.map npmlist.logger.bind null,totalLength


# Initialize
npmlist.init = ->

  # Flag
  flag = process.argv[2]

  # Flag switch
  switch flag
    when "help","-h","--help"             then npmlist.help()
    when "version","-v","--version"       then npmlist.version()
    when "local","-l","--local"           then npmlist.npmls false
    when undefined                        then npmlist.npmls true
    else npmlist.unknownCommand flag


# Export
if isTest
  module.exports = npmlist
else
  module.exports.call = npmlist.init

