
###
  Spec Helper
###

global.NODE_ENV = 'test'

require 'mocha'
{ join } = require 'path'
{ readFileSync } = require 'fs'
{ expect } = require 'chai'
{ stdoutTrap } = require 'logtrap'

# Require module and package.json
nls = require '../dist/npmlist'
conf = require '../dist/colorConf'
c = require '../dist/color'
pkg = require '../package.json'

# Get npm full tree output as variable
list = (readFileSync join __dirname, 'npm_ls_out').toString()

# Export
module.exports = {
  join
  readFileSync
  expect
  stdoutTrap
  nls
  pkg
  list
  conf
  c
}
