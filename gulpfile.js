var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    config = require('./gulp/config')(),
    gulpTaskList = require('fs').readdirSync('./gulp/tasks/');

$.jsonFile = require('json-file');
$.argv = require('yargs').argv;
$.moment = require('moment');

gulpTaskList.forEach(function(taskfile) {
    require('./gulp/tasks/' + taskfile)(gulp, $, config);
});

gulp.task('help', function() {
    console.log('\n');
    console.log('gulp server\t\t监控一个动态服务器');
    console.log('gulp server:web\t\t创建一个静态服务器并监控');
    console.log('gulp csscomb\t\tcss排序并格式化');
    console.log('gulp help\t\tgulp参数说明');
    console.log('\n');
});