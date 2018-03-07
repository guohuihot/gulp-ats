module.exports = function(gulp, $, utils, configs) {
    var fs = require('fs-extra');

    gulp.task('base', function() {
        var basePath = './lib/base.json';
        var base = fs.readJsonSync(basePath, { throws: false }) || {};
        
        console.log(base);
    });
}