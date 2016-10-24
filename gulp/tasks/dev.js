module.exports = function(gulp, $) {
    var host = 'http://localhost:8080/',
        argv = $.yargs
                .alias({
                    all     : 'al',
                    server  : 's',
                    open    : 'o'
                }).argv;

    gulp.task('test', function () {
    // connect
        $.connect.server({
            root: process.cwd(),
            port: 8080,
            livereload: true
        });
        if (argv.o) {
            require('child_process').exec('start ' + host);
        }
    })
}