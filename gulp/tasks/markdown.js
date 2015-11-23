module.exports = function(gulp, $, config) {
    gulp.task('default', ['watch']);
    // markdown
    gulp.task('markdown', function() {
        return gulp.src('src/docs/**/*.md')
            .pipe($.watch('src/docs/**/*.md'))
            .pipe($.markdown())
            .pipe($.wrap({
                src: 'config/markdown_template.html'
            }))
            .pipe(gulp.dest('src/docs/'));
    });
};