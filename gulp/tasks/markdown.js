module.exports = function(gulp, $, utils) {
    // markdown
    gulp.task('markdown', function() {
        return gulp.src(['./**/*.md','!./node_modules/**/*'], {base: './'})
            .pipe($.changed('./docs/'))
            .pipe($.marked())
            .pipe($.wrap({
                src: './gulp/markdown/template.html'
            }))
            .pipe($.convertEncoding({to: 'gbk'}))
            .pipe(gulp.dest('./docs'));
    });
};