module.exports = function(gulp, $) {
    gulp.task('default', function() {
        var info = require('../lib/tasks-info');
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
}