    var gulp         = require('gulp'),
        $            = require('gulp-load-plugins')({
                            pattern      : ['*'],
                            replaceString: /^(gulp|node|vinyl)(-|\.)/,
                        }),
        utils        = require('./gulp/utils'),
        configs      = require('./gulp/configs')($, utils),
        debugMoudle  = [], //调试用，数组里放要排除的模块，如：['web']
        gulpTasks    = require('fs').readdirSync('./gulp/tasks/');

gulpTasks.forEach(function(gulpTask) {
    if (!utils.inArray(gulpTask.replace(/\.js$/, ''), debugMoudle)) {
        require('./gulp/tasks/' + gulpTask)(gulp, $, utils, configs);
    };
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