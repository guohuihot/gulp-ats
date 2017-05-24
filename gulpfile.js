    var gulp         = require('gulp'),
        $            = require('gulp-load-plugins')({
                            pattern      : ['*'],
                            replaceString: /^(gulp|node|vinyl)(-|\.)/,
                        }),
        utils        = require('./gulp/utils'),
        configs      = require('./gulp/configs')($, utils),
        debugMoudle  = [], //调试用，只加载数组里的模块，如：['web']
        gulpTasks    = debugMoudle.length &&
                            debugMoudle ||
                            require('fs').readdirSync('./gulp/tasks/');

gulpTasks.forEach(function(gulpTask) {
    require('./gulp/tasks/' + gulpTask)(gulp, $, utils, configs);
});

gulp.task('default', function() {
    console.log(utils.getInfo());
});