module.exports = function(gulp, $) {
    var fs = require('fs');
    var utils = {
        mkdir: function(dest, src) {
            fs.stat(dest, function(err, stats) {
                if (err || !stats.isDirectory()) {
                    if (err) fs.mkdir(dest);
                    gulp.src(src + '**/*')
                        .pipe(gulp.dest(dest));
                } else {
                    fs.readdir(dest, function(er, files) {
                        var hash = {},
                            needFiles = [];
                        files.forEach(function(file, i) {
                            hash[file] = true;
                        })
                        fs.readdir(src, function(e, orgFiles) {
                            orgFiles.forEach(function(file, i) {
                                if (!hash[file]) {
                                    gulp.src(src + file + '/')
                                        .pipe(gulp.dest(dest));
                                }
                            })
                        })
                    })
                };
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