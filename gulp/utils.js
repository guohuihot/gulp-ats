module.exports = function(gulp, $) {
    var fs = require('fs');
    var utils = {
        mkdir: function(dest, src, sync) {
            fs.stat(dest, function(err, stats) {
                var nSrc;
                if (err || !stats.isDirectory() || sync) {
                    nSrc = src + '**/*';
                } else {
                    nSrc = [src + '*/', '!' + src + '*.html'];
                };
                gulp.src(nSrc)
                    .pipe(gulp.dest(dest))
            })
        },
        inArray: function(search, array) {
            for (var i in array) {
                if (array[i] == search) {
                    return true;
                }
            }
            return false;
        }
    };
    return utils;
};