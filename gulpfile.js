"use strict";

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    useref = require('gulp-useref'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    minCss = require('gulp-clean-css'),
    maps = require('gulp-sourcemaps'),
    del = require('del'),
    lazypipe = require('lazypipe'),
    gulpif = require('gulp-if'),
    CacheBuster = require('gulp-cachebust'),
    debug = require('gulp-debug');

var options = {
    src: 'src',
    dist: 'production'
};

var cachebust = new CacheBuster();

// clean tasks
gulp.task('cleanSass', function () {
    del([options.src + '/css']);
});

gulp.task('cleanDist', function () {
    del([options.dist]);
});

gulp.task('clean', ['cleanDist', 'cleanSass']);

// styles
gulp.task('compileSassDev', ['cleanSass'], function () {
    return gulp.src(options.src + "/scss/application.scss")
        .pipe(maps.init())
        .pipe(rename('app.min.css'))
        .pipe(sass())
        .pipe(minCss())
        .pipe(maps.write('./'))
        .pipe(gulp.dest(options.src + '/css'));
});

// styles
gulp.task('compileSass', ['compileSassDev'], function () {
    return gulp.src(options.src + "/scss/application.scss")
        .pipe(maps.init())
        .pipe(rename('app.min.css'))
        .pipe(cachebust.resources())
        .pipe(sass())
        .pipe(minCss())
        .pipe(maps.write('./'))
        .pipe(gulp.dest(options.dist + '/css'));
});

// clean and copy static
gulp.task('copyStatic', ['cleanDist', 'compileSass'], function () {
    gulp.src([
        options.src + '/img/**',
        options.src + '/fonts/**',
        options.src + '/css/**'
    ], {base: options.src})
        .pipe(gulp.dest(options.dist));
});

// html
gulp.task('html', ['copyStatic'], function () {
    return gulp.src(options.src + '/index.html')
        .pipe(useref({}, lazypipe().pipe(maps.init, {loadMaps: true})))
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.js', cachebust.resources()))
        .pipe(gulpif('*.css', minCss()))
        .pipe(gulpif('*.css', cachebust.resources()))
        .pipe(maps.write('./'))
        .pipe(gulp.dest(options.dist));
});

// build
gulp.task("build", ['html'], function () {
    gulp.src(options.dist + '/**/*.html')
        .pipe(cachebust.references())
        .pipe(gulp.dest(options.dist));
});

// dev tools
gulp.task('watchFiles', function () {
    gulp.watch(options.src + '/scss/**/*.scss', ['compileSassDev']);
});

gulp.task('serve', ['watchFiles']);

// default
gulp.task("default", ["build"]);