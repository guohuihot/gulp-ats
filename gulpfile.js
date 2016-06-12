var gulp      = require('gulp'),
    $             = require('gulp-load-plugins')({
                        pattern       : ['*'],
                        replaceString : /^(gulp|node|vinyl)(-|\.)/,
                    }),
    utils         = require('./gulp/tasks/utils')(gulp, $),
    debugMoudle   = [], //调试用，只加载数组里的模块，如：['web']
    gulpTaskList  = debugMoudle.length &&
                    debugMoudle ||
                    require('fs').readdirSync('./gulp/tasks/');
gulpTaskList.forEach(function(taskfile) {
    require('./gulp/tasks/' + taskfile)(gulp, $, utils);
});

gulp.task('default', function() {
    console.log(utils.getInfo());
});