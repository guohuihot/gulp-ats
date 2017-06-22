module.exports = function(gulp, $, utils, configs) {
    var argv       = $.yargs.argv,
        oInit      = require('../lib/init')($, argv),
        isMultiple = oInit.isMultiple, // 多目录
        path       = require('path');
        cfgs       = oInit.configs;
        
    gulp.task('jshint', function() {
        Object.keys(cfgs).forEach(function(p) {
            var cfg = cfgs[p];
            // var files = $.glob.sync(path.join(cfg.src, '**/*.js'))
            // 自动更新的readme
            gulp.src(path.join(cfg.src, '**/*.js'), {
                    base: cfg.src
                })
                .pipe($.plumber())
                .pipe($.jshint(configs.jshint))
                .pipe($.jshint.reporter());
        });
    });
}