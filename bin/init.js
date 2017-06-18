module.exports = function(gulp, $) {
    gulp.task('init', function() {
        // base
        oInit = require('../lib/init')($),

        console.log('\n');
        console.log('当前配置:\n');
        console.log(oInit.config);
        console.log('\n');
    })
}