/*
 * Npmlist
 */

let { join } = require('path')
let { readFile } = require('fs')
let { exec } = require('child_process')

let _ = require('lodash')
let Conf = require('./colorConf')
let Color = require('./color')

const SCOPEVAR = 'npmlist.scope'

const IS_TEST = global.NODE_ENV === 'test'

class Npmlist {

  help (code=0) {
    console.log(`

  Usage: npmlist [flags]

  Flags:
    -h,         [--]help                  This message
    -v,         [--]version               Version number
    -l,         [--]local                 Local packages
    -g,         [--]global                Global packages
    -cs,        [--]colorscheme           Display current colorscheme
    -d=n,       [--]depth=n               Traverse n levels deep
    -gp=pkg,    [--]grep=pkg              Filter package (top-level)
    -c=x,y,z,   [--]colors=x,y,z          Use colors specified
    -sc=x,y,z,  [--]setcolors=x,y,z       Set colors (persistent)
    -ss=scope   [--]setscope=scope        Set global or local (persistent)

    `)
    if (!IS_TEST) process.exit(code)
  }

  version (callback) {
    let pkgJson = join(__dirname, '../package.json')
    readFile(pkgJson, (err, file) => {
      if (err) throw(err)
      let json = JSON.parse(file)
      let version = `npmlist v${json.version}`
      if (!IS_TEST) console.log(version)
      if (callback) callback(version)
    })
  }

  unknownCommand (flag) {
    console.log(`\nUnknown argument: ${flag}`)
    this.help(1)
  }

  isEmpty (list) {
    return /^└\W+(empty)/.test(list)
  }

  getScope (callback) {
    exec(`npm get ${SCOPEVAR}`, (err, stdout, stderr) => {
      callback(/^local$/i.test(stdout.trim()) ? false : true)
    })
  }

  setScope (scope) {
    let scope = /^l(ocal)?$/i.test(scope) ? 'local' : 'global'
    exec(`npm set ${SCOPEVAR}`, (err, stdout, stderr) => {
      let msg = 'Scope will now default to: '
      scope = (scope === 'local') ? `${Color.magenta}${scope}` : `${Color.cyan}${scope}`
      msg = `\n${Color.blue}${msg}${scope}${Color.reset}\n`
      process.stdout.write(msg)
      process.exit(0)
    })
  }

  depth (level, pkg) {
    let regex = new RegExp(`^(.{0,${2 * level}})[├└].*`, 'g')
    return regex.test(pkg)
  }

  grepPackage (lines, grep='') {
    let fuzzy = false
    if (!grep.length) return lines
    if (grep[0] === '_') {
      grep = grep.substr(1)
      fuzzy = true
    }
    let regex = new RegExp(`${grep}${fuzzy ? '' : '@.*'}`,'i')
    let keepGathering = false
    let grepped = []
    for (let line of lines) {
      let depth = this.depth(0, line)
      if (depth) {
        if (regex.test(line)) {
          grepped.push(line)
          keepGathering = true
        } else {
          keepGathering = false
        }
      }
      if (keepGathering && !this.depth(0, line)) {
        grepped.push(line)
      }
    }
    return grepped
  }

  getDepth (padding) {
    return (padding - 4) / 2
  }

  lineWidth (lines, lowerLimit) {
    let width = lines.reduce((prev, { length }) => {
      return (length > prev) ? length : prev
    }, 0)
    return (width > lowerLimit) ? width : lowerLimit
  }

  stripSource (line) {
    let [, pkg, link] = line.match(/^(\W+[^ ]+)(.*)/)
    return `${pkg}${link ? '*' : ''}`
  }

  parseResult ([, tree, module], width) {
    let depth = this.getDepth(tree.length)
    let pkg = module.split('@')
    let pkgLength = pkg[0].length + pkg[1].length
    let buffer = width - pkgLength - depth * 2 - 1
    pkg.push(_.repeat('.', buffer), depth)
    return pkg
  }

  prettify (module, ver, spaces, depth) {
    let { subpkg, pkg, dots, version } = this.colors
    let pkgColor = Color[depth ? subpkg : pkg]
    let l = _.repeat(' ', depth * 2)
    let p = `${pkgColor}${module}${Color.reset}`
    let s = `${Color[dots]}${spaces}${Color.reset}`
    let v = `${Color[version]}[${ver}]${Color.reset}`
    return `${l}${p}${s}${v}\n`
  }

  logger (length, line) {
    let result = line.match(/^(\W+)([^ ]+)/)
    let pkg = this.parseResult(result, length)
    if (!IS_TEST) process.stdout.write(this.prettify.apply(this, pkg))
    return pkg.slice(0, 2)
  }

  logEmpty () {
    let empty = `${Color[this.colors.pkg]}(empty)${Color.reset}\n`
    process.stdout.write(empty)
  }

  npmls (global, depth=0, grep='', colors='') {
    let cmd = 'npm ls'
    let scope = '(local)'
    if (global) {
      cmd = `${cmd} -g`
      scope = '(global)'
    }

    if (colors.length) {
      this.colors = Conf.parseColors(colors)
      this.run(cmd, scope, depth, grep)
    } else {
      Conf.getColors((colors) => {
        this.colors = Conf.parseColors(colors)
        this.run(cmd, scope, depth, grep)
      })
    }
  }

  run (cmd, scope, depth, grep) {
    exec(cmd, (err, stdout, stderr) => {
      let msg = `Installed npm packages:${scope}`
      let width = msg.length - 1
      let banner = `\n${Color[this.colors.banner]}${msg}${Color.reset}\n\n`
      process.stdout.write(banner)

      let list = stdout.split('\n')
      if (list.filter(this.isEmpty).length) return this.logEmpty()

      let lines = list.filter(this.depth.bind(this, depth))
      lines = lines.map(this.stripSource)
      lines = this.grepPackage(lines, grep)

      if (!lines.length) return this.logEmpty()

      width = this.lineWidth(lines, width)
      lines.map(this.logger.bind(this, width))
    })
  }

  init () {
    let args = process.argv.slice(2)

    let depth = 0
    let flag = null
    let colors = ''
    let setColors = ''
    let getColors = false
    let scope = ''
    let grep = ''

    let depthRegex = /^(?:(?:--)?depth|-d)=(\d+)/
    let flagRegex = /^(?:(?:(?:--)?(?:scope|colorscheme|global|local|version|help))|(?:-(?:s|cs|g|l|v|h)))$/g
    let colorRegex = /^(?:(?:--)?colors|-c)=(.+)/
    let setRegex = /^(?:(?:--)?setcolors|-sc)=(.+)/
    let scopeRegex = /^(?:(?:--)?setscope|-ss)=(.+)/
    let grepRegex = /^(?:(?:--)?grep|-gp)=(.+)/

    for (let arg of args) {
      let flagMatches = arg.match(flagRegex)
      let depthMatches = arg.match(depthRegex)
      let colorMatches = arg.match(colorRegex)
      let setMatches = arg.match(setRegex)
      let scopeMatches = arg.match(scopeRegex)
      let grepMatches = arg.match(grepRegex)
      if (!(flagMatches || depthMatches || colorMatches || setMatches || scopeMatches || grepMatches)) {
        this.unknownCommand(arg)
      }

      if (flagMatches && _.isNull(flag)) flag = flagMatches[0]
      if (depthMatches && !depth) depth = depthMatches[1]
      if (colorMatches && !colors.length) colors = colorMatches[1]
      if (setMatches && !setColors.length) setColors = setMatches[1]
      if (scopeMatches && !scope.length) scope = scopeMatches[1]
      if (grepMatches && !grep.length) grep = grepMatches[1]
    }

    if (scope.length) this.setScope(scope)

    if (setColors.length) {
      Conf.setColors(setColors)
    } else {
      switch (flag) {
        case "colorscheme":
        case "-cs":
        case "--colorscheme":
          return Conf.colorscheme();
        case "help":
        case "-h":
        case "--help":
          return this.help();
        case "version":
        case "-v":
        case "--version":
          return this.version();
        case "global":
        case "-g":
        case "--global":
          return this.npmls(true, depth, grep, colors);
        case "local":
        case "-l":
        case "--local":
          return this.npmls(false, depth, grep, colors);
        default:
          this.getScope( (global) => {
            return this.npmls(global, depth, grep, colors);
          })
      }
    }

  }
}

module.exports = new Npmlist
