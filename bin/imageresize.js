module.exports = function(gulp, $, utils, configs) {
    var path  = require('path'),
        fs  = require('fs-extra'),
        argv = $.yargs.argv;

    // imageresize
    gulp.task('imageresize', function(){

        var _src = argv.s;
        var _dist = argv.d;

        var aFiles = $.glob.sync(path.join(_src, '**/*.{jpg,jpeg}'));
        
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

    gulp.task('imageresize1', function(){

        var _src = argv.p;
        var _dist = argv.d;

    $.mkdirp.sync(_dist);

    if (!fs.existsSync(_dist + '/records.json')) {
        // 不存在时 创建一个空的文件 保证不报错
        fs.writeFileSync(_dist + '/records.json', '');
    }

    var base = $.jsonFilePlus.sync(_dist + '/records.json');
    base.data = base.data || {};
        var aFiles = $.glob.sync(path.join(_src, '**/*.{jpg,jpeg,png}'));

        aFiles.forEach(function(file) {
            try {
                var _img = $.images(file); //加载图像文件
            } catch (err) {
                console.warn(file, err);
                base.data[file] = 0;
            }
            var _imgW = _img.width();
            var _imgH = _img.height();
            // console.log(path.relative(_src, file));
            // return false;
            // console.log(file, _imgW + ' * ' + _imgH);
            var savePath = path.join(_dist || _src, path.relative(_src, file));
            // var savePath = path.join(_dist || _src, path.basename(file));

            // var aImgSize = utils.getImgSize({width: _imgW, height: _imgH}, 1024, 768);
            // console.log(aImgSize);
            // return false;
            if (_imgW > 900) {
                $.mkdirp.sync(path.dirname(savePath));
                console.log(file, _imgW + ' * ' + _imgH);
                base.data[file] = 1;
                _img
                    .resize(900) //等比缩放图像到1000像素宽
                    .save(savePath, {
                        quality: 80 //保存图片到文件,图片质量为50
                    });

            }
        });

    base.saveSync();
    });

    gulp.task('remove-watermark', function(){

        var _src = argv.p;
        var _dist = argv.d;

        var aFiles = $.glob.sync(path.join(_src, '**/*.{jpg,jpeg}'));

        var waterMarkImg = $.images('C:/Users/Administrator/Pictures/watermark1.png');
        var waterMarkImgW = waterMarkImg.width();
        var waterMarkImgH = waterMarkImg.height();
        

        
        $.mkdirp.sync(_dist);
        /*aFiles.filter(function(file) {
            var _img = $.images(file); //加载图像文件
            var _imgW = _img.width();
            var _imgH = _img.height();
            if (_imgW > 300 && _imgH > 300) {
                return file;
            };
        })
        console.log(aFiles.length);
        return false;*/
        aFiles.forEach(function(file) {
            var _img = $.images(file); //加载图像文件
            var _imgW = _img.width();
            var _imgH = _img.height();
            // console.log(path.relative(_src, file));
            // return false;
            if (_imgW > 300 && _imgH > 300) {
                console.log(file, _imgW + ' * ' + _imgH);
                var savePath = path.join(_dist || _src, path.relative(_src, file));
                // var savePath = path.join(_dist || _src, path.basename(file));
                $.mkdirp.sync(path.dirname(savePath));
                /*_img
                    .draw(waterMarkImg, _imgW - waterMarkImgW, _imgH - waterMarkImgH) //在(10,10)处绘制Logo
                    // .size(100) //等比缩放图像到1000像素宽
                    .save(savePath, {
                        quality: 100 //保存图片到文件,图片质量为50
                    });*/
                $.images(_img, 0, 0, _imgW, _imgH - 85).save(savePath, {
                        quality: 100 //保存图片到文件,图片质量为50
                    });;

            };
        });

    });

    gulp.task('delete-thumb', function(){
        var _src = argv.p;
        var aFiles = $.glob.sync(path.join(_src, '**/*.{jpg,jpeg,png}'));
        var i = 0;
        aFiles.forEach(function(path) {
            if (/\S+_\d+_\d+/.test(path)) {
                console.log(path);
                fs.removeSync(path);
                i ++ ;
            };
        });
        console.log(`共清除${i}个图片`);
    });
};