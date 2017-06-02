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
    var info = utils.getInfo();
    console.log(info);
    // 自动更新的readme
    gulp.src('./readme.tpl')
        .pipe($.swig({
            data: {
                title: '使用说明',
                content: info
            },
            ext: '.md'
        }))
        .pipe(gulp.dest('./'))
});