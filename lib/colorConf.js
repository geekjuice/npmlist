/*
 * Color configs
 */

let { join } = require('path')
let { existsSync } = require('fs')
let { exec } = require('child_process')

let _ = require('lodash')
let Color = require('./color')

// Constants
const HOMEDIR = process.platform === 'win32' ? 'USERPROFILE' : 'HOME'
const NPMRC = join(process.env[HOMEDIR], '.npmrc')
const COLORVAR = 'npmlist.colors'
const MAPS = ['Package','Version','Banner','Dots','Sub-package']
const COLORS = {
  pkg:      'magenta',
  version:  'cyan',
  banner:   'blue',
  dots:     'grey',
  subpkg:   'grey'
}


class ColorConf {

  duplicate (val, times) {
    return _.times(times, () => { return val })
  }

  npmrcExists () {
    return existsSync(NPMRC)
  }

  downcase (array) {
    return array.map((elem) => {
      return elem.toLowerCase()
    })
  }

  sanitize (str) {
    return this.downcase(str.trim().split(/\s*,\s*/g))
  }

  getColors (callback) {
    return exec(`npm get ${COLORVAR}`, (err, stdout, stderr) => {
      return callback((stdout.trim() === 'undefined') ? 'default' : stdout)
    })
  }

  setColors (colors) {
    let colors = this.sanitize(colors.replace(/\s+/g, ''))
    return exec(`npm set ${COLORVAR}`, (err, stdout, stderr) => {
      if (err) console.log(err)
      return this.colorscheme('Colorscheme set to:')
    })
  }

  colorscheme (banner='Current colorscheme:') {
    return this.getColors( (currentColors) => {
      let colors = []
      if (_.isUndefined(currentColors.trim())) {
        for (let color in COLORS) {
          colors.push(COLORS[color])
        }
      } else {
        currentColors = this.parseColors(currentColors)
        for (let color in currentColors) {
          colors.push(currentColors[color])
        }
      }

      process.stdout.write(`\n${Color.blue}${banner}${Color.reset}\n\n`)

      let width = 30
      for (let i of _.range(5)) {
        let color = colors[i]
        let buffer = width - (MAPS[i].length + color.length) - 1
        let dots = `${Color.grey}${_.repeat('.', buffer)}${Color.reset}`
        let msg = `${MAPS[i]}${dots}${Color[color]}${color}${Color.reset}\n`
        process.stdout.write(msg)
      }

      return process.exit(0)
    })
  }

  mapColors (colors) {
    return {
      pkg:      colors[0],
      version:  colors[1],
      banner:   colors[2],
      dots:     colors[3],
      subpkg:   colors[4]
    }
  }

  parseColors (colorString) {
    let colorMap = _.clone(COLORS)
    let colors = this.sanitize(colorString)
    let colorsLength = colors.length

    if (_.includes(colors, 'default')) {
      return colorMap
    } else if (_.includes(colors, 'sans')) {
      return this.mapColors(this.duplicate('system', 5))
    }

    return (() => {
      switch(colorsLength) {
        case 5:
          return this.mapColors(colors)
        case 4:
          return this.mapColors(colors.concat('grey'))
        case 3:
          return this.mapColors(colors.concat('grey', 'grey'))
        case 2:
          return _.assign({}, colorMap, {
            pkg: colors[0],
            versions: colors[1]
          })
        case 1:
          return this.mapColors(this.duplicate(colors[0], 5))
        default:
          return colorMap
      }
    })()
  }
}


module.exports = new ColorConf
