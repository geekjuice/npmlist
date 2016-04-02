# npmlist

[![NPM
version](https://badge.fury.io/js/npmlist.png)](http://badge.fury.io/js/npmlist)


## Why?
Originally to replace the broken `npm ls` in versions v1.4.3 and v.1.4.4.
Now primarily for pretty colors and formatting.


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
  chai.....................[1.9.0]
  connect.................[2.13.0]
  dispatch-proxy...........[0.1.2]
  express..................[3.4.8]
  gulp.....................[3.5.2]
  mocha....................[UNMET]
  nodemon.................[1.0.15]
  npm......................[1.4.4]
  yo.......................[1.1.2]
```

### Colored version numbers

__Yellow__: Indicates that the package is linked

__Red__: Indicates that has an invalid version number


## Other options:

__Most options mirror `npm ls` options__

### Help

Display help message

### Version

Display version number

### Dev

Only list `depDependencies`

### Prod

Only list `dependencies`

### Local

List local packages

### Global

List global packages

### Depth

Specify depth to display (same as `npm`'s depth)

### Scope

Get/set scope i.e. default scope


## License
Copyright &copy; 2015 Nicholas Hwang - [MIT License](LICENSE)
