# Modules
gulp = require('gulp')
clean = require('gulp-clean')
coffee = require('gulp-coffee')
plumber = require('gulp-plumber')


# Configs
pkg = require('./package.json')
env = require('./env.json')

# Clean
gulp.task 'clean', ->
  gulp.src('./src/js/*', {read: false})
    .pipe(clean())

# Coffee
gulp.task 'coffee', ->
  gulp.src('./src/coffee/**/*.coffee')
    .pipe(plumber())
    .pipe(coffee({bare:true}))
    .pipe(gulp.dest('./src/js'))

# Build
gulp.task 'build', ['clean', 'coffee']

# Watch
gulp.task 'watch', ->
  gulp.watch './src/coffee/**/*.coffee', ['coffee']

# Default
gulp.task 'default', ['build']
