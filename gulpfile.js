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
    gulp.src('./readme.md')
        .pipe($.through2.obj(function(file, encoding, done) {
            var contents = [
                String(file.contents),
                '#### 使用说明',
                info
            ].join('\n');

            file.contents = new Buffer(contents);
            this.push(file);
            done();
        }))
        .pipe(gulp.dest('./'))
});