var gulp = require('gulp'),
    $            = require('gulp-load-plugins')(),
    utils        = require('./gulp/utils')(gulp, $),
    debugMoudle  = [], //调试用，只加载数组里的模块，如：['web.js']
    gulpTaskList = debugMoudle.length &&
                    debugMoudle ||
                    require('fs').readdirSync('./gulp/tasks/');

$.moment = require('moment');
$.path   = require('path');

gulpTaskList.forEach(function(taskfile) {
    require('./gulp/tasks/' + taskfile)(gulp, $, utils);
});

gulp.task('default', function() {
    var tasks = require('json-file-plus').sync('./gulp/tasks.json').data,
        taskInfo = '\n--------------- help -----------------\n\n';

    taskInfo += '使用帮助信息\t\tgulp\n\n';
    for(var i in tasks) {
        taskInfo += tasks[i]['title'] + '\tgulp ' + i + ' ' + tasks[i]['argv'] + '\n\n';
    }
    taskInfo += '--------------- /help -----------------\n';
    
    console.log(taskInfo);
});