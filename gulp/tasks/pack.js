module.exports = function(gulp, $, config) {
    gulp.task('pack:patch', function() {
        // argv.run('gulp html_pstohtml --config="e:/test"');
        if (!$.argv.config) {
            console.log('请设置要打包的名称！');
            return;
        }
        var aPathName = $.argv.config.split(',');
        gulp.src([aPathName[0] + '/**/*', '!' + aPathName[0] + '/*.zip'])
            .pipe($.clean())
            .pipe($.zip(aPathName[1] + '.zip'))
            .pipe(gulp.dest(aPathName[0]))
    })
};