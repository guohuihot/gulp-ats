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
        taskInfo = '',
        params;
    taskInfo += '\ngulp\t显示帮助信息(参数一个字母一个中线，>一个字母两个中线)\n\n';
    for(var i in tasks) {
        params = '';
        for (var j in tasks[i]['argv']) {
            params += j + '\t' + tasks[i]['argv'][j] + '\n\t';
        }
        taskInfo += 'gulp ' + i + '\t' + tasks[i]['title'] + '\n\t' + params + '\n';
    }
    console.log(taskInfo);
});