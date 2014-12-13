/// <vs BeforeBuild='jshint' AfterBuild='deploy' />
var gulp = require('gulp');
var config = require('./config');

// JS hint task
// this is just a nice library for making sure your JavaScript syntax is all good
var jshint = require('gulp-jshint');
gulp.task('jshint', function () {
    gulp.src('./*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// deploy to the device
// NOTE: this will only deploy files at the root level; it is not recursive
var scp = require('gulp-scp2');
gulp.task('deploy', function () {
    return gulp.src(['*.{js,json}', '!gulpfile.js'])
        .pipe(scp({
            host: config.host,
            username: config.user,
            password: config.password,
            dest: config.deployFolder
        }))
        .on('error', function (err) {
            console.log('ERR: ' + err);
        });
});


