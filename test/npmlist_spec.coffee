
# Require spec helper
_ = require './spec_helper'

# Examples
depth0 = '├─┬ chai@1.9.0'
depth1 = '│ └─┬ deep-eql@0.1.3'
depth2 = '│   └── type-detect@0.1.1 (git://github.com/geekjuice/npmlist#sha5hash'
badVer = '└─┬ npmlist@*'
empty = '└── (empty)'

# Tests
describe 'npmlist', ->
  it '#help', ->
    help = _.stdoutTrap -> _.nls.help()
    _.expect(help).to.contain 'Usage: npmlist [flags]'

  it '#unknownCommand', ->
    unknown = _.stdoutTrap -> _.nls.unknownCommand 'noop'
    _.expect(unknown).to.contain 'Unknown argument: noop'
    _.expect(unknown).to.contain 'Usage: npmlist [flags]'

  it '#version', (done) ->
    _.nls.version (v) ->
      _.expect(v).to.equal "npmlist v#{_.pkg.version}"
      done()

  it '#isEmpty', ->
    _.expect(_.nls.isEmpty empty).to.equal true
    _.expect(_.nls.isEmpty depth0).to.equal false

  it '#depth', ->
    _.expect(_.nls.depth 0, depth0).to.equal true
    _.expect(_.nls.depth 1, depth1).to.equal true
    _.expect(_.nls.depth 1, depth0).to.equal true

  it '#getDepth', ->
    _.expect(_.nls.getDepth 4).to.equal 0
    _.expect(_.nls.getDepth 6).to.equal 1
    _.expect(_.nls.getDepth 8).to.equal 2

  it '#lineWidth', ->
    lines = ['foo','bar','foobar', 'fubar']
    _.expect(_.nls.lineWidth lines, 8).to.equal 8
    _.expect(_.nls.lineWidth lines, 4).to.equal 6

  it '#stripSource', ->
    _.expect(_.nls.stripSource depth0).to.equal '├─┬ chai@1.9.0'
    _.expect(_.nls.stripSource depth2).to.equal '│   └── type-detect@0.1.1*'

  it '#parseResult', ->
    # NOTE: Lengths hardcoded in for simplicity
    regex = /^(\W+)([^ ]+)/
    _.expect(_.nls.parseResult depth0.match(regex), 10)
      .to.eql ['chai','1.9.0','',0]
    _.expect(_.nls.parseResult depth1.match(regex), 15)
      .to.eql ['deep-eql','0.1.3','',1]
    _.expect(_.nls.parseResult badVer.match(regex), 9)
      .to.eql ['npmlist','*','',0]

  it '#logger', ->
    log = _.nls.logger 30, depth0
    _.expect(log.join '@').to.equal 'chai@1.9.0'

  it '#grepPackage'
  it '#logEmpty'
  it '#prettify'
