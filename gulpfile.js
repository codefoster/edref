/// <vs BeforeBuild='jshint' AfterBuild='deploy, set-startup' />
var gulp = require('gulp');
var config = require('./config');
var ssh2Client = require('ssh2').Client;
var conn;

// JS hint task
// this is just a nice library for making sure your JavaScript syntax is all good
gulp.task('jshint', function () {
    var jshint = require('gulp-jshint');
    gulp.src('./*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// deploy to the device
// NOTE: this will only deploy files at the root project level; it is not recursive
gulp.task('deploy', function () {
    var scp = require('gulp-scp2');
    return gulp.src(['*.{js,json}', '!gulpfile.js'])
        .pipe(scp({
            host: config.host,
            username: config.user,
            password: config.password,
            dest: config.projectName
        }))
        .on('error', function (err) {
            console.log('ERR: ' + err);
        });
});

//run npm install on the remote machine to assure all packages
gulp.task('restore-packages', function () {
    var run = require('gulp-run');
    run('ssh ' + config.user + '@' + config.host + ' cd ~/' + config.projectName + '; npm install --production')
        .exec().pipe(gulp.dest('output'));
});

//kill processes
gulp.task('killProcesses', function () {
    conn = new ssh2Client();
    conn.on('ready', function () {
        conn.exec('kill -9 `ps | grep "edref/app.js" | grep -v grep | awk \' { print $1 }\'`', execCallback);
    }).connect({ host: config.host, port: config.sshPort, username: config.user, password: config.password });
});

//set startup
gulp.task('set-startup', function () {
    var serviceText =
        "[Unit]\n" + 
        "    Description = Node startup app service for starting a node process\n" +
        "    After = mdns.service\n" +
        "[Service]\n" +
        "    ExecStart = /usr/bin/node /home/" + config.user + "/" + config.projectName + "/" + config.startFile + "\n" +
        "    Restart = on-failure\n" +
        "    RestartSec = 2s\n" +
        "[Install]\n" +
        "    WantedBy=default.target\n";

    conn = new ssh2Client();
    conn.on('ready', function () {
        conn.exec('systemctl stop nodeup.service; echo "' + serviceText + '" > /etc/systemd/system/nodeup.service; systemctl daemon-reload; systemctl enable nodeup.service; systemctl start nodeup.service', execCallback);
    }).connect({ host: config.host, port: config.sshPort, username: config.user, password:config.password });
});

//DON'T USE YET
////execute
//gulp.task('execute', ['killProcesses'], function () {
//    conn = new ssh2Client();
//    conn.on('ready', function () {
//        conn.exec("node /home/" + config.user + "/" + config.projectName + "/" + config.startFile, execCallback);
//    }).connect({ host: config.host, port: config.sshPort, username: config.user, password: config.password });
//});

function execCallback (err, stream) {
    if (err) throw err;
    stream
        .on('close', function (code, signal) { console.log('Stream closed with code ' + code + ' and signal ' + signal); conn.end() })
        .on('data', function (data) { console.log(data); })
        .stderr.on('data', function (err) { console.log('Error: ' + err); });
}