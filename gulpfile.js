var gulp         = require('gulp'),
    $            = require('gulp-load-plugins')({
                        pattern      : ['*'],
                        replaceString: /^(gulp|node|vinyl)(-|\.)/,
                    }),
    utils        = require('./lib/utils'),
    configs      = require('./lib/configs')($, utils),
    debugMoudle  = [], //调试用，数组里放要排除的模块，如：['web']
    gulpTasks    = require('fs').readdirSync('./bin/');

// yargs配置
$.yargs.alias({
        path      : 'p',
        author    : 'au',
        alias     : 'a',
        custom    : 'c',
        libs      : 'l',
        dev       : 'd',
        server    : 's',
        open      : 'o',
        src      : 'src',
        ftp       : 'f',
        reverse   : 'r',
        mode      : 'm',
        type      : 't'
    })

gulpTasks.forEach(function(gulpTask) {
    if (!utils.inArray(gulpTask.replace(/\.js$/, ''), debugMoudle)) {
        require('./bin/' + gulpTask)(gulp, $, utils, configs);
    };
});

gulp.task('default', function() {
    var info = require('./lib/tasks-info');
    console.log(info);
    // 自动更新的readme
    gulp.src('./tpl/readme.md')
        .pipe($.swig({
            data: {
                title: '使用说明',
                content: info
            },
            ext: '.md'
        }))
        .pipe(gulp.dest('./'))
});