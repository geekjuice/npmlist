
# Require spec helper
_ = require './spec_helper'

# Default colomap
defaultColors =

# Tests
describe 'color_config', ->
  it 'should check if npmrc exists', ->
    _.expect(_.conf.npmrcExists()).to.equal true

  it 'should duplicate array (helper)', ->
    _.expect(_.conf.duplicate ['xx'], 2).to.eql ['xx','xx']
    _.expect(_.conf.duplicate 'x', 2).to.eql ['x','x']

  it 'should map downcase (helper)', ->
    _.expect(_.conf.downcase ['Red','bluE']).to.eql ['red','blue']

  it 'should sanitize strs (helper)', ->
    _.expect(_.conf.sanitize 'Red  , bluE').to.eql ['red','blue']

  it 'should return empty object for sans', ->
    _.expect(_.conf.parseColors 'sans').to.eql
      pkg:      'system'
      version:  'system'
      banner:   'system'
      dots:     'system'
      subpkg:   'system'

  it 'should default to original colorscheme', ->
    _.expect(_.conf.parseColors 'default').to.eql
      pkg:      'magenta'
      version:  'cyan'
      banner:   'blue'
      dots:     'grey'
      subpkg:   'grey'

  it 'should have command options to colors and sans', ->
    _.expect(_.conf.parseColors 'red,yellow,blue').to.eql
      pkg:      'red'
      version:  'yellow'
      banner:   'blue'
      dots:     'grey'
      subpkg:   'grey'

