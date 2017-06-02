module.exports = function(gulp, $, utils) {
    var configs = require('../configs'),
        path  = require('path'),
        argv = $.yargs
        .alias({
            dist : 'd',
            src  : 's'
        }).argv;

    // imageresize
    gulp.task('imageresize', function(){

        var _src = argv.s;
        var _dist = argv.d;

        var aFiles = $.glob.sync(path.join(_src, '**/*.{jpg,jpeg,png,gif}'));
        
        $.mkdirp.sync(_dist);

        aFiles.forEach(function(file) {
            $.images(file) //加载图像文件
                .size(100) //等比缩放图像到1000像素宽
                // .draw(images("pficon.jpg"), 10, 10) //在(10,10)处绘制Logo
                .save(path.join(_dist, path.basename(file)), {
                    quality: 50 //保存图片到文件,图片质量为50
                });
        });

    });

    gulp.task('remove-watermark', function(){

        var _src = argv.p;
        var _dist = argv.d;

        var aFiles = $.glob.sync(path.join(_src, '**/*.{jpg,jpeg,png,gif}'));
        
        $.mkdirp.sync(_dist);

        aFiles.forEach(function(file) {
            $.images(file) //加载图像文件
                .size(100) //等比缩放图像到1000像素宽
                // .draw(images("pficon.jpg"), 10, 10) //在(10,10)处绘制Logo
                .save(path.join(_dist || _src, path.basename(file)), {
                    quality: 50 //保存图片到文件,图片质量为50
                });
        });

    });

};