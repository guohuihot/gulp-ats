module.exports = function(gulp, $, utils) {
    var path = require('path'),
        argv = $.yargs
        .alias({
            path: 'p',
            author: 'a',
            custom: 'c',
            libs: 'l',
            dev: 'd',
            server: 's',
            open: 'o',
            ftp: 'f',
            reverse: 'r',
            mode: 'm',
            tpl: 't'
        }).argv;
    // markdown
    gulp.task('markdown', function() {

        var files = $.glob.sync(path.join(argv.p, '/**/!(vendor)/doc/*.md'));

        // gulp.src('./gulp/markdown/*/**')
        //     .pipe(gulp.dest(path.join(argv.p, 'docs')));

        console.log(files);
        files.forEach(function(file) {

            var dataFun = function (file, cb1) {
                gulp.src(file)
                    .pipe($.marked())
                    .pipe($.concatStream(function(content) {
                        console.log(content);
                        cb1(undefined, {
                            content : content,
                        });
                    }));
            };
            return false;
            gulp.src('./gulp/markdown/template.html')
                .pipe($.data(dataFun))
                .pipe($.template())
                .pipe($.convertEncoding({
                    to: 'gbk'
                }))
                .pipe(gulp.dest(path.join(argv.p, 'docs')));
        });
    });
};