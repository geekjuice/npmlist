# npmlist

[![NPM
version](https://badge.fury.io/js/npmlist.png)](http://badge.fury.io/js/npmlist)

Sugar wrapped `npm list` with optional depth

Project initiated using [nblocks](https://github.com/geekjuice/nblocks)


# Why?
Current npm's (v1.4.3 and v.1.4.4) list (ls) function at depth=0 is broken. Plus
this looks aesthetically better than the original (such colors. oooohh~)


## Usage

Installation

```sh
  $ npm install -g npmlist
```

Usage (sans color)

```sh
  $ npmlist
  Installed npm packages: (global)

  bower....................[1.2.8]
  brewcleaner..............[1.1.0]
  chai.....................[1.9.0]
  coffee-script............[1.7.1]
  connect.................[2.13.0]
  dispatch-proxy...........[0.1.2]
  express..................[3.4.8]
  gulp.....................[3.5.2]
  mocha..................[1.17.1*]
  nodemon.................[1.0.15]
  npm......................[1.4.4]
  yo.......................[1.1.2]
```

An asterisk by a version name signifies you are using a linked version of the
package rather than one installed from a registry.

Other options include:

### Help

Display help message

### Version

Display version number

### Local

List local packages

### Global

List global packages

### Colorscheme

Displays current color scheme. More on color below in `Color Customization`

### Depth

Specify depth to display (same as `npm`'s depth)

### Filtering

Filter by package name (useful for manageable sub-package view)

### Colors

Uses colors (one-off)

### Set Color

Set colors for persistence i.e. default colors

### Set Scope

Set scope for persistence i.e. default scope


## Color Customization

The color of the output can be changed through a few options.

```sh
  # One-off colorscheme
  $ npmlist -c=red,yellow,blue,magenta,cyan
  ...

  # Setting persistent colorscheme
  $ npmlist -s=red,yellow,blue,magenta,cyan

  Current colorscheme:

  Package...................red
  Version................yellow
  Banner...................blue
  Dots..................magenta
  Sub-package..............cyan

  # Get current colorscheme
  $ npmlist -k

  Current colorscheme:

  Package...................red
  Version................yellow
  Banner...................blue
  Dots..................magenta
  Sub-package..............cyan
```

As you can see from above, there are five variable colors for `npmlist`:
Package name, version, banner, dots, and sub-packages. When specifying more
than 1 color, they will populate in the order as above. When only one color is
given, everything will be that color. The default colorscheme is the same as
previous versions of `npmlist`:

```coffee-script
defaultColors =
COLORS =
  pkg:      'magenta'
  version:  'cyan'
  banner:   'blue'
  dots:     'grey'
  subpkg:   'grey'
```

For persistent color settings, the colors are saved as a variable in
`$HOME/.npmrc` as `npmlist.colors`.

To see what colors are avaialble, check out [colors](src/coffee/color.coffee)
here.


## Future Plans
* Signify if using linked package or installed
* ~~Allow for package filtering (useful for > 0 depth view of a package)~~
* Fix `extraneous` package mark
* Better package versioning...
* Refactor out CLI parser (or use optimist?)
* Clean up code


## Credits

[nblocks](https://github.com/geekjuice/nblocks)


## License

Copyright &copy; Nicholas Hwang <nick.joosung.hwang@gmail.com>
