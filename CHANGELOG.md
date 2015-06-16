## v3.0.2
* Display no packages found message

## v3.0.1
* Fix 'undefined' string for scope

## v3.0.0
__Breaking changes__
* Color options are deprecated unless requested
* Uses fixed `npm ls --depth=0`, so broken version will not work e.g. v1.4.3 & v1.4.4
* `setscope` is now just `scope`
* `query` deprecated

__Other updates__
* `dev` and `prod` options added


## 2014-04-11
* Allow for package filtering (for sub-package views)
* Add option for exact or fuzzy filtering (by prepending _ in search)

## 2014-03-18
* Add asterisk to version when using link
* Add persistent scope
* Fix missing color prefix for empty packages
* Make home directory OS agnostic


## 2014-03-16
* Major update with color options added
* Add ability to change color of output
  * Banner, package name, version, dots, and sub-packages
* Persistent colorscheme via npmrc


## 2014-03-03
* Fix depth length issue with long source i.e. github


## 2014-02-26
* Move npmls script to node package
* Update regex to allow linked packages
* Add simple unit tests
* Add depth option with expanding view (multiple flag options)
