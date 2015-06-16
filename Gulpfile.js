var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');

var BABEL_TRANSFORMS = [
    'es6.arrowFunctions',
    'es6.classes',
    'es6.properties.computed',
    'es6.constants',
    'es6.blockScoping',
    'es6.destructuring',
    'es6.modules',
    'es6.parameters.default',
    'es6.templateLiterals',
    'es6.forOf',
    'regenerator',
    'runtime',
    'strict',
    'es7.asyncFunctions',
    'es7.classProperties'
];

gulp.task('ES6', function () {
    return gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            whitelist: BABEL_TRANSFORMS,
            loose: BABEL_TRANSFORMS
        }))
        .pipe(sourcemaps.write('.', {
            includeContent: true,
            sourceRoot: '../src'
        }))
        .pipe(gulp.dest('./lib'));
});

gulp.task('app', ['ES6'], function () {
    var app = require('./lib/app.js');
});
