var del         = require('del');
var gulp        = require('gulp');
var babel       = require('gulp-babel');
var bump        = require('gulp-bump');
var filter      = require('gulp-filter');
var plumber     = require('gulp-plumber');
var tagVersion  = require('gulp-tag-version');

// Variables
var input = './lib';
var output = './build';
var pkg = require('./package.json');


// Clean
gulp.task('clean', function() {
  del.sync([output]);
});


// Javascript
gulp.task('js', function() {
  gulp.src(input + '/**/*.js')
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest(output));
});


// Version bump
['patch', 'minor', 'major'].forEach(function(type) {
  (function(version) {
    var pkgFilter = filter('package.json');
    gulp.task('version:' + version, function() {
      gulp.src(['package.json', 'bower.json'])
        .pipe(bump({type: version}))
        .pipe(pkgFilter)
        .pipe(tagVersion())
        .pipe(pkgFilter.restore())
        .pipe(gulp.dest('.'));
    });
  })(type);
});


// Watch
gulp.task('watch', ['build'], function() {
  gulp.watch(input + '/**/*.js', ['js']);
});


// Defaults
gulp.task('build', ['clean', 'js']);
gulp.task('default', ['build']);

