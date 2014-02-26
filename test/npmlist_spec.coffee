
# Require spec helper
_ = require './spec_helper'

# Examples
depth0 = '├─┬ chai@1.9.0'
depth1 = '│ └─┬ deep-eql@0.1.3'
depth2 = '│   └── type-detect@0.1.1'
empty = '└── (empty)'

# Tests
describe 'npmlist', ->
  it '#help', ->
    help = _.stdoutTrap -> _.nls.help()
    _.expect(help).to.contain 'Usage: npmlist [flags]'

  it '#unknownCommand', ->
    unknown = _.stdoutTrap -> _.nls.unknownCommand 'noop'
    _.expect(unknown).to.contain 'Unknown flag: noop'
    _.expect(unknown).to.contain 'Usage: npmlist [flags]'

  it '#version', (done) ->
    _.nls.version (v) ->
      _.expect(v).to.equal "npmlist v#{_.pkg.version}"
      done()

  it '#prettify', ->
    pretty = _.nls.prettify 'chai','1.9.0',null
    _.expect(pretty).to.contain 'chai'
    _.expect(pretty).to.contain '[1.9.0]'

  it '#isEmpty', ->
    _.expect(_.nls.isEmpty empty).to.equal true
    _.expect(_.nls.isEmpty depth0).to.equal false

  it '#isMainPackage', ->
    _.expect(_.nls.isMainPackage depth0).to.equal true
    _.expect(_.nls.isMainPackage depth1).to.equal false

  it '#logger', ->
    log = _.nls.logger 30, depth0
    _.expect(log.join '@').to.equal 'chai@1.9.0'



