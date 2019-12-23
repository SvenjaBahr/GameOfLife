const { src, dest, watch, parallel, series } = require('gulp');
var gulp = require('gulp');
const htmlhint = require("gulp-htmlhint");
const concat = require('gulp-concat');
var uncomment = require('gulp-uncomment');
const debug = require('gulp-debug');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');

gulp.task('cssMin', function () {
  gulp.src('./source/*.css')
    .pipe(uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('compress', function () {
  return gulp.src('./source/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist'))
})

function html() {
  return src('./source/*.html')
    .pipe(debug({ title: 'html:' }))
    .pipe(htmlhint())
    .pipe(htmlhint.failOnError())
    .pipe(dest('./dist'));
}

function css() {
  return src('./source/*.css')
    .pipe(dest('./dist'));
}

async function js() {
  return src('./source/*.js', { sourcemaps: true })
    .pipe(debug({ title: 'js  :' }))
    .pipe(concat('app.js'))
    .pipe(uncomment({
      removeEmptyLines: true
    }))
    .pipe(dest('./dist', { sourcemaps: true }));
}

exports.js = js;
exports.css = css;
exports.html = series(html);
exports.default = parallel(html, css, js);