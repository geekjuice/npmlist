// Modules
var del     = require('del')
var gulp    = require('gulp')
var babel   = require('gulp-babel')
var plumber = require('gulp-plumber')

// Directory
var SRC = 'lib/**/*.js'
var DEST = 'dist'
var MODULES = 'node_modules'

// Clean
gulp.task('clean', function () {
  del.sync([DEST])
})

// Wipe
gulp.task('wipe', function () {
  del([DEST, MODULES])
})

// Babel
gulp.task('babel', function () {
  return gulp.src(SRC)
    .pipe(babel())
    .pipe(gulp.dest(DEST))
})

// Watch
gulp.task('watch', ['build'], function () {
  return gulp.watch(SRC, ['babel'])
})

// Build
gulp.task ('build', ['clean', 'babel'])

// Default
gulp.task('default', ['watch'])
