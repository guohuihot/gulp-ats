module.exports = function(gulp, $) {
    // banner
    var path = require('path'),
        configs   = require('../configs');
        argv      = $.yargs.argv,
        sourceUrl = path.join(process.cwd(), './gulp/'),
        config    = {},
        sign      = {
                    img: 'img',
                    font: 'font'
                },

        message = function (info) {
            return $.notify(function(file) {
                return path.relative(config.path, file.path) + ' ' + info + ' ok !';
            })
        };

    argv.d = argv.d === 0 ? false : true;

    gulp.task('init', function(cb) {
        var base = $.jsonFilePlus.sync('./gulp/base.json'),
        baseConfig = base.data.web;

        config = $.extend(baseConfig, {
            path: argv.p,
            author: argv.a
        });
        base.saveSync();

        config.src = path.join(config.path, config.src);

        console.log('\n');
        if (config.path) {
            console.log('当前配置:\n');
            console.log(config);
        } else {
            cb('err: 请指定项目目录！');
        }
        console.log('\n');

        cb();
    });
    // connect
    gulp.task('connect', function() {
            $.connect.server({
                root: config.path,
                port: 8080,
                livereload: true
            });
            if (argv.o) {
                require('child_process').exec('start http://localhost:8080/demo.html');
            }
        });
    // watch

    gulp.task('watch', ['init'], function() {
        if (argv.f) {
            $.watch(config.path + '/**/*.{html,css,js}', function(cssFile) {
                var relativeDir = path.dirname(path.relative(config.path, cssFile.path)
                                    .replace(/\\/g,'/'));
                console.log('本地：' + cssFile.path);
                console.log('远程：' + '/housev7.08cms.com/template/blue/' + relativeDir + '/');
                return gulp.src(cssFile.path)
                    .pipe($.ftp({
                        host: '',
                        user: '',
                        pass: '',
                        port: '621',
                        remotePath: '/housev7.08cms.com/template/blue/' + relativeDir + '/'
                    }))
                    .pipe($.livereload())
                    .pipe(message('上传'));
            });
        } else {
            $.livereload.listen();

            $.watch([
                config.path + '/**/*.html',
                '!' + config.path + '/**/{fonts,images}/*.html'
            ], function(file) {
                gulp.src(file.path, {
                        read: false
                    })
                    .pipe(gulp.dest(config.path))
                    .pipe($.livereload())
                    .pipe(message('livereload'));
            });
        }
        // images
        $.watch([config.src + '/**/images/*.{png,gif,jpg,jpeg}'], function(file) {
            if (file.event == 'unlink') {
                var pathRelative = path.relative(config.src, file.path);
                $.del([config.path + '/' + pathRelative], {force: true});
            } else {
                gulp.src(file.path, {base: config.src})
                    .pipe($.imagemin(configs.imagemin))
                    .pipe(gulp.dest(config.path))
                    .pipe(message('复制并压缩'));
            }
        });
        // sprites
        $.watch(config.src + '/**/images/*/*.{png,gif,jpg,jpeg}', function(file) {

            var pathRelative = path.relative(config.src, file.dirname),
                fName = path.basename(file.dirname),
                cssPath = path.join(file.dirname, '../../css/' + sign.img);

            var spriteData = gulp.src(file.dirname + '/*.{png,gif,jpg,jpeg}')
                .pipe($.spritesmith({
                    imgName: pathRelative + '.png',
                    cssName: 'sprite.json',
                    // cssName: path.join(file.dirname, '../../css/img/' + fName + '.scss'),
                    padding: 10
                }));

            var dataFun = function(file, cb1) {
                    spriteData.css.pipe($.concatStream(function(jsonArr) {
                        // console.log(JSON.parse(jsonArr[0].contents));
                        cb1(undefined, {
                            cssData   : JSON.parse(jsonArr[0].contents),
                            fUrl      : '../images/' + fName + '.png',
                            sourceUrl : '/',
                            fName     : fName,
                            sign      : sign.img
                        });
                    }));
                };  

            gulp.src(sourceUrl + 'css/images.scss')
                .pipe($.data(dataFun))
                .pipe($.template())
                .pipe($.rename(fName + '.scss'))
                .pipe(gulp.dest(cssPath))
                .pipe(message('sprites scss 生成'));
            // images 预览文件
            gulp.src(sourceUrl + 'html/images.html')
                .pipe($.data(dataFun))
                .pipe($.template())
                .pipe($.rename(pathRelative + '.html'))
                .pipe(gulp.dest(config.path));

            spriteData.img
                .pipe(gulp.dest(config.path))
                .pipe(message('sprites img 生成'));
        });
        // fonts
        $.watch(config.src + '/**/fonts/*/*.svg', function(file) {
            var pathRelative = path.relative(config.src, file.dirname),
                    fName = path.basename(file.dirname),
                    cssPath = path.join(file.dirname, '../../css/' + sign.font);
            gulp.src(file.dirname + '/*.svg', {base: config.src })
                .pipe($.iconfont({
                    fontName: pathRelative, // required
                    // appendUnicode: true, // recommended option
                    formats: ['eot', 'woff'], // default, 'woff2' and 'svg' are available
                    // timestamp: runTimestamp // recommended to get consistent builds when watching files
                }))
                .on('glyphs', function(glyphs, options) {
                    // CSS templating, e.g.
                    // console.log(glyphs, options);
                    
                    var templateData = {
                            sourceUrl : '/',
                            sign      : sign.font,
                            fName     : fName,
                            cssData   : glyphs,
                            fUrl      : '../fonts/'
                        };

                    gulp.src(sourceUrl + 'css/fonts.scss')
                        .pipe($.template(templateData))
                        .pipe($.rename(fName + '.scss'))
                        .pipe(gulp.dest(cssPath))
                        .pipe(message('font scss 生成'));

                    gulp.src(sourceUrl + 'html/fonts.html')
                        .pipe($.template(templateData))
                        .pipe($.rename(pathRelative + '.html'))
                        .pipe($.convertEncoding({to: 'gbk'}))
                        .pipe(gulp.dest(config.path))
                })
                // .pipe($.plumber())
                .pipe(gulp.dest(config.path))
                .pipe(message('font 生成'));
        });
        // scss
        $.watch([config.src + '/**/css/*.scss'], function (file) {
            if (file.event == 'unlink') {
                var pathRelative = path.relative(config.src, file.path.replace(/.scss/,'.css'));
                $.del([config.path + '/' + pathRelative], {force: true});
            } else {
                gulp.src(file.path, {base: config.src})
                    .pipe($.plumber())
                    .pipe($.if(argv.d, $.sourcemaps.init()))
                    .pipe($.sass({
                        includePaths: config.tpl + '/src/css/',
                        outputStyle: 'nested', 
                        //Type: String Default: nested Values: nested, expanded, compact, compressed
                        sourceMap: true
                    }).on('error', $.sass.logError))
                    /*.pipe($.autoprefixer({
                        browsers: ['ff >= 3','Chrome >= 20','Safari >= 4','ie >= 8']//,
                        //cascade: true, 是否美化属性值 默认：true 像这样：
                        //-webkit-transform: rotate(45deg);
                        //        transform: rotate(45deg);
                        //remove:true //是否去掉不必要的前缀 默认：true 
                    }))*/
                    .pipe($.if(!argv.d, $.csso(), $.csscomb(configs.csscomb)))
                    .pipe($.template({
                        name: path.basename(file.path),
                        author: config.author,
                        date: $.moment().format('YYYY-MM-DD HH:mm:ss')
                    }))
                    .pipe($.convertEncoding({to: 'gbk'}))
                    .pipe($.if(argv.d, $.sourcemaps.write('./maps', {
                        includeContent: false,
                        sourcemaps: './'
                    })))
                    .pipe(gulp.dest(config.path))
                    .pipe($.livereload())
                    .pipe(message('scss 生成'));
            }
        });
        // js
        $.watch([config.src + '/**/js/*.js'], function(file) {
            if (file.event == 'unlink') {
                var pathRelative = path.relative(config.src, file.path);
                $.del([config.path + '/' + pathRelative], {force: true});
            } else {
                gulp.src(file.path, {base: config.src })
                    .pipe($.plumber())
                    .pipe($.if(argv.d, $.sourcemaps.init()))
                    .pipe($.jshint(configs.jshint))
                    .pipe($.jshint.reporter())
                    // .pipe($.jslint())
                    .pipe($.uglify(configs.uglify))
                    .pipe($.template({
                        name: path.basename(file.path),
                        author: config.author,
                        date: $.moment().format('YYYY-MM-DD HH:mm:ss')
                    }))
                    .pipe($.convertEncoding({
                        to: 'gbk'
                    }))
                    .pipe($.if(argv.d, $.sourcemaps.write('./maps', {
                        includeContent: false,
                        sourcemaps: './'
                    })))
                    .pipe(gulp.dest(config.path))
                    .pipe(message('处理'));
            }
        });
        // concat js
        $.watch([
            config.src + '/**/js/*/*.js',
            '!' + config.src + '/**/js/{static,plugin}/*.js'
        ], function(file) {
            var pathRelative = path.relative(config.src, file.dirname),
                    fName = path.basename(file.dirname);
            // return false;
            gulp.src(file.dirname + '/*.js', {base: config.src })
                .pipe($.plumber())
                .pipe($.if(argv.d, $.sourcemaps.init()))
                .pipe($.jshint(configs.jshint))
                .pipe($.jshint.reporter())
                // .pipe($.jslint())
                .pipe($.concat(pathRelative + '.js'))
                // .pipe($.uglify(configs.uglify))
                .pipe($.template({
                    name: fName,
                    author: config.author,
                    date: $.moment().format('YYYY-MM-DD HH:mm:ss')
                }))
                .pipe($.convertEncoding({
                    to: 'gbk'
                }))
                .pipe($.if(argv.d, $.sourcemaps.write('./maps', {
                    includeContent: false,
                    sourcemaps: './'
                })))
                .pipe(gulp.dest(config.path))
                .pipe(message('合并 压缩'));
        });
        // 将项目中的atsui文件复制回atsui库中
        if (argv.r) {
            $.watch([
                config.src + '/**/*'
            ], function(file) {
                var oSrc = config.tpl + '/src';
                if (file.event == 'unlink') {
                    var pathRelative = path.relative(config.src, file.path);
                    $.del([oSrc + '/' + pathRelative], {force: true});
                } else {
                    var fileExt = path.extname(file.path);
                    gulp.src(file.path, {base: config.src })
                        .pipe($.if(fileExt == '.js', $.jshint(configs.jshint)))
                        .pipe($.if(fileExt == '.js', $.jshint.reporter()))
                        /*.pipe($.if(
                            fileExt == '.js' || fileExt == '.scss', 
                            $.template({
                                author: config.author,
                                date: $.moment().format('YYYY-MM-DD HH:mm:ss')
                            })
                        ))*/
                        .pipe(gulp.dest(oSrc))
                        .pipe(message('到 ' + oSrc))
                        .pipe(gulp.dest(config.path));
                }
            });
            $.watch('./gulp/**/*.js', function(file) {
                gulp.src(file.path)
                    .pipe($.jshint(configs.jshint))
                    .pipe($.jshint.reporter());
            });
        }
        if (argv.s) {
            gulp.start('connect');
        }
    });
    // build
    gulp.task('build', ['init', 'copy', 'pack', 'sprites', 'fonts', 'scss']);
    // 复制全部ats
    gulp.task('copy', ['init'], function (cb) {
        gulp.src([
                config.tpl + '/**/*',
                '!' + config.tpl + '/**/units/**/*'
            ], {base: config.tpl})
            .pipe($.if(function(file) {
                        return path.extname(file.path) === '.html';
                    }, $.convertEncoding({
                        to: 'gbk'
                    }))
            )
            .pipe(gulp.dest(config.path));

        require('fs').exists(config.src + '/css/units/variables.scss',
            function(exists) {
                if (!exists) {
                    gulp.src(config.tpl + '/src/css/units/variables.scss', {
                            base: config.tpl
                        })
                        .pipe(gulp.dest(config.path));
                };
                cb();
            })
    });
    // 处理杂项可异步
    gulp.task('pack', ['copy'], function(cb) {   
        var nSrc = !argv.all ? config.tpl + '/src' : config.src;

        // 处理自定义的img
        gulp.src([nSrc + '/**/images/*.{png,gif,jpg,jpeg}'], {base: nSrc})
            .pipe($.imagemin(configs.imagemin))
            .pipe(gulp.dest(config.path));

        // concat js
        $.glob(nSrc + '/**/js/!(plugin|static)/', function (err, files) {
            $.async.eachLimit(files, 10, function(dir, callback) {
                var pathRelative = path.relative(nSrc, dir);

                gulp.src(dir + '/*.js', {base: nSrc })
                    .pipe($.plumber())
                    .pipe($.if(argv.d, $.sourcemaps.init()))
                    .pipe($.uglify(configs.uglify))
                    .pipe($.concat(pathRelative + '.js'))
                    .pipe($.convertEncoding({
                        to: 'gbk'
                    }))
                    .pipe($.if(argv.d, $.sourcemaps.write('./maps', {
                        includeContent: false,
                        sourcemaps: './'
                    })))
                    .pipe(gulp.dest(config.path));
                    callback();
            }, function(err) {
                if (!err) {
                    cb();
                }
            })
        });
        // 处理自定义的js
        gulp.src([nSrc + '/**/js/*.js'], {base: nSrc})
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            .pipe($.uglify(configs.uglify))
            .pipe($.convertEncoding({
                to: 'gbk'
            }))
            .pipe($.if(argv.d, $.sourcemaps.write('./maps', {
                includeContent: false,
                sourcemaps: './'
            })))
            .pipe(gulp.dest(config.path))
            .pipe(message('压缩'));
        // 直接复制核心
        gulp.src([nSrc + '/**/plugin/*.js'], {base: nSrc})
            .pipe($.uglify(configs.uglify))
            .pipe(gulp.dest(config.path));
        gulp.src([nSrc + '/**/static/*'], {base: nSrc})
            .pipe(gulp.dest(config.path));
    });
    // sprites 异步处理
    gulp.task('sprites', ['pack'], function(cb) {
        var nSrc = !argv.all ? config.tpl + '/src' : config.src;

        $.glob(nSrc + '/**/images/!(static)/', function (err, files) {
            $.async.eachLimit(files, 10, function(dir, callback) {
                var pathRelative = path.relative(nSrc, dir),
                    fName = path.basename(dir),
                    cssPath = path.join(dir, '../../css/' + sign.img);

                var spriteData = gulp.src(dir + '/*.{png,gif,jpg,jpeg}', {base: nSrc})
                    .pipe($.spritesmith({
                        imgName: pathRelative + '.png',
                        cssName: 'sprite.json',
                        // cssName: path.join(dir, cssPath),
                        padding: 10
                    }));

                var dataFun = function(file, cb1) {
                        spriteData.css.pipe($.concatStream(function(jsonArr) {
                            // console.log(JSON.parse(jsonArr[0].contents));
                            cb1(undefined, {
                                cssData   : JSON.parse(jsonArr[0].contents),
                                fUrl      : '../images/' + fName + '.png',
                                sourceUrl : '/',
                                fName     : fName,
                                sign      : sign.img
                            });
                        }));
                    };  

                gulp.src(sourceUrl + 'css/images.scss', {base: sourceUrl + 'css/'})
                    .pipe($.data(dataFun))
                    .pipe($.template())
                    .pipe($.rename(fName + '.scss'))
                    .pipe(gulp.dest(cssPath))
                    .pipe(message('sprites css 生成'));
                    // .pipe($.if(!argv.all, gulp.dest(config.src)));

                // images 预览文件
                gulp.src(sourceUrl + 'html/images.html')
                    .pipe($.data(dataFun))
                    .pipe($.template())
                    .pipe($.rename(pathRelative + '.html'))
                    .pipe(gulp.dest(config.path));

                spriteData.img
                    .pipe(gulp.dest(config.path))
                    .pipe(message('sprites img 生成'));
                callback();
            }, function(err) {
                if (!err) {
                    cb();
                }
            })
        });

    });
    // fonts 异步处理
    gulp.task('fonts', ['sprites'], function(cb) {
        var nSrc = !argv.all ? config.tpl + '/src' : config.src;

        $.glob(nSrc + '/**/fonts/!(static)/', function (err, files) {
            $.async.eachLimit(files, 10, function(dir, callback) {
                var pathRelative = path.relative(nSrc, dir),
                    fName = path.basename(dir),
                    cssPath = path.join(dir, '../../css/' + sign.font);
                
                gulp.src(dir + '/*.svg', {base: nSrc })
                    .pipe($.iconfont({
                        fontName: pathRelative, // required
                        // appendUnicode: true, // recommended option
                        formats: ['eot', 'woff'], // default, 'woff2' and 'svg' are available
                        // timestamp: runTimestamp // recommended to get consistent builds when watching files
                    }))
                    .on('glyphs', function(glyphs, options) {
                        // CSS templating, e.g.
                        var templateData = {
                                sourceUrl : '/',
                                sign      : sign.font,
                                fName     : fName,
                                cssData   : glyphs,
                                fUrl      : '../fonts/'
                            };
                        gulp.src(sourceUrl + 'css/fonts.scss')
                            .pipe($.template(templateData))
                            .pipe($.rename(fName + '.scss'))
                            .pipe(gulp.dest(cssPath))
                            .pipe(message('fonts css 生成'));
                            // .pipe($.if(!argv.all, gulp.dest(config.src)));

                        // 生成字体预览文件
                        gulp.src(sourceUrl + 'html/fonts.html')
                            .pipe($.template(templateData))
                            .pipe($.rename(pathRelative + '.html'))
                            .pipe($.convertEncoding({to: 'gbk'}))
                            .pipe(gulp.dest(config.path))

                        callback();
                    })
                    .pipe(gulp.dest(config.path))
                    .pipe(message('fonts 生成'));
            }, function(err) {
                if (!err) {
                    cb();
                }
            })
        });
    })
    // scss 单独出来，异步处理
    gulp.task('scss', ['fonts'], function(cb) {
        var nSrc = !argv.all ? config.tpl + '/src' : config.src;

        gulp.src([nSrc + '/**/css/*.scss'], {base: nSrc })
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            .pipe($.sass({
                includePaths: config.tpl + '/src/css/',
                outputStyle: 'nested', 
                sourceMap: true
            }).on('error', $.sass.logError))
            .pipe($.autoprefixer({
                browsers: ['ff >= 3','Chrome >= 20','Safari >= 4','ie >= 8'],
            }))
            .pipe($.if(!argv.d, $.csso(), $.csscomb(configs.csscomb)))
            .pipe($.data(function(file) {
                return {
                    name: path.basename(file.path),
                    author: config.author,
                    date: $.moment().format('YYYY-MM-DD HH:mm:ss')
                }
            }))
            .pipe($.template())
            .pipe($.convertEncoding({to: 'gbk'}))
            .pipe($.if(argv.d, $.sourcemaps.write('./maps', {
                includeContent: false,
                sourcemaps: './'
            })))
            .pipe(gulp.dest(config.path))
            .pipe(message('scss 生成'));
        cb();
    })

    // clean
    gulp.task('clean', ['init'], function(cb) {
        $.del([config.path + '/{css,js,images,fonts,maps}'], {force: true}, cb);
    });
};