module.exports = function(gulp, $) {
    var reg = new RegExp('node_modules|.git');
    var tree = $.directoryTree(process.cwd(), {
                    exclude: reg
                }, function(item, PATH) {
                    // console.log(item, PATH);
                });
    
// console.log(tree);
    gulp.task('default', function() {
        var info = require('../lib/tasks-info');
        console.log(info);
        // 自动更新的readme
        gulp.src('./tpl/readme.md')
            .pipe($.swig({
                data: {
                    title: '使用说明',
                    tree: tree,
                    content: info
                },
                ext: '.md'
            }))
            .pipe(gulp.dest('./'))
    });
}