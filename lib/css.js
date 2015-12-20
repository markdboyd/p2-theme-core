'use strict';
var sassGlob = require('gulp-sass-glob');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var sassLint = require('gulp-sass-lint');
var postcss = require('gulp-postcss');
var cached = require('gulp-cached');
var autoprefixer = require('autoprefixer');
var gulpif = require('gulp-if');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');

module.exports = function (gulp, config, tasks) {
  var reload;
  if (config.browserSync.enabled) {
    reload = require('browser-sync').get('server').reload;
  } else {
    reload = function (x) {
      return x;
    };
  }

  gulp.task('css', 'Compile Scss to CSS using Libsass with Autoprefixer and SourceMaps', function () {
    return gulp.src(config.css.src)
        .pipe(sassGlob())
        .pipe(plumber({
          errorHandler: function(error) {
            notify.onError({
              title: 'CSS <%= error.name %> - Line <%= error.line %>',
              message: '<%= error.message %>'
            })(error);
            this.emit('end');
          }
        }))
        .pipe(sourcemaps.init({
          debug: config.debug
        }))
        .pipe(sass({
          outputStyle: 'expanded',
          sourceComments: config.css.sourceComments,
          includePaths: config.css.includePaths
        }).on('error', sass.logError))
        .pipe(postcss(
          [
            autoprefixer({
              browsers: config.css.autoPrefixerBrowsers
            })
          ]
        ))
        .pipe(sourcemaps.write((config.css.sourceMapEmbed) ? null : './'))
        .pipe(gulp.dest(config.css.dest))
        .pipe(gulpif(config.browserSync.enabled, reload({stream: true})));
  });

  gulp.task('watch:css', ['css'], function () {
    return gulp.watch(config.css.src, [
      'css',
      'validate:css'
    ]);
  });

  gulp.task('validate:css', 'Lint Scss files', function () {
    return gulp.src(config.css.src)
        .pipe(cached('validate:css'))
        .pipe(sassLint())
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
  });

  tasks.watch.push('watch:css');
  tasks.compile.push('css');
  tasks.validate.push('validate:css');

};