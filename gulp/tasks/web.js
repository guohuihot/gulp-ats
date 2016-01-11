module.exports = function(gulp, $) {
    // base
    var path = require('path'),
        configs   = require('../configs');
        argv      = $.yargs
                        .alias({
                            path    : "p",
                            author  : "a",
                            libs    : "l",
                            dev     : "d",
                            server  : "s",
                            open    : "o",
                            ftp     : "f",
                            reverse : "r",
                            tpl     : "t"
                        }).argv,
        sourceUrl = path.join(process.cwd(), './gulp/'),
        config    = {},
        sign      = {
                    img: 'img',
                    font: 'font'
                };
    // functions
    var message = function (info) {
            return $.notify(function(file) {
                return path.relative(config.path, file.path) + ' ' + info + ' ok !';
            })
        };

    var sprites = function(dir, cb) {
        var isBuild      = cb && !argv.all,
            src          = isBuild ? config.tpl : config.src,
            dist         = path.join(config.dist, isBuild ? config.libs : './'),

            pathRelative = path.relative(src, dir),
            fName        = path.basename(dir),
            cssPath      = path.join(dir, '../../css/' + sign.img);

        var spriteData = gulp.src(dir + '/*.{png,gif,jpg,jpeg}')
            .pipe($.spritesmith({
                imgName: pathRelative + '.png',
                cssName: 'sprite.json',
                // cssName: path.join(dir, '../../css/img/' + fName + '.scss'),
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
            .pipe(gulp.dest(dist));

        spriteData.img
            .pipe(gulp.dest(dist))
            .pipe(message('sprites img 生成'));
        cb && cb();
    }

    var fonts = function(dir, cb) {
        var isBuild      = cb && !argv.all,
            src          = isBuild ? config.tpl : config.src,
            dist         = path.join(config.dist, isBuild ? config.libs : './'),
            
            pathRelative = path.relative(src, dir),
            fName        = path.basename(dir),
            cssPath      = path.join(dir, '../../css/' + sign.font);

        gulp.src(dir + '/*.svg', {base: src })
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
                    .pipe(gulp.dest(dist))
                // console.log(111);
                cb && cb();
            })
            // .pipe($.plumber())
            .pipe(gulp.dest(dist))
            .pipe(message('font 生成'));
    }
    // scss
    var scss = function(filePath, cb) {
        var isBuild      = cb && !argv.all,
            src          = isBuild ? config.tpl : config.src,
            dist         = path.join(config.dist, isBuild ? config.libs : './');
        gulp.src(filePath, {base: src})
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            .pipe($.sass({
                includePaths: config.tpl + '/css/',
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
            .pipe($.if(!argv.d, $.csso(), $.csscomb(sourceUrl + 'css/csscomb.json')))
            .pipe($.template({
                name: path.basename(filePath),
                author: config.author,
                date: $.moment().format('YYYY-MM-DD HH:mm:ss')
            }))
            .pipe($.convertEncoding({to: 'gbk'}))
            .pipe($.if(argv.d, $.sourcemaps.write('./maps', {
                includeContent: false,
                sourcemaps: './'
            })))
            .pipe(gulp.dest(dist))
            .pipe($.livereload())
            .pipe(message('scss 生成'));
        cb && cb();
    }
    // concatjs
    var concatJS = function(dir, cb) {
        var isBuild      = cb && !argv.all,
            src          = isBuild ? config.tpl : config.src,
            dist         = path.join(config.dist, isBuild ? config.libs : './'),

            pathRelative = path.relative(src, dir),
            fName        = path.basename(dir);
        // return false;
        gulp.src(dir + '/*.js', {base: src })
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            .pipe($.if(!cb, $.jshint(configs.jshint)))
            .pipe($.if(!cb, $.jshint.reporter()))
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
            .pipe(gulp.dest(dist))
            .pipe(message('合并 压缩'));
        cb && cb();
    }
    // js
    var JS = function(filePath, cb) {
        var isBuild      = cb && !argv.all,
            src          = isBuild ? config.tpl : config.src,
            dist         = path.join(config.dist, isBuild ? config.libs : './');
        gulp.src(filePath, {base: src})
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            .pipe($.if(!cb, $.jshint(configs.jshint)))
            .pipe($.if(!cb, $.jshint.reporter()))
            // .pipe($.jslint())
            .pipe($.uglify(configs.uglify))
            .pipe($.template({
                name: path.basename(filePath),
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
            .pipe(gulp.dest(dist))
            .pipe(message('处理'));
        cb && cb();
    }

    var buildCB = function(fun, files, cb0) {
        $.async.eachLimit(files, 10, function(file, callback) {
                fun(file, callback);
            }, function(err) {
                if (!err) {
                    cb0();
                }
            })
    }

    argv.d = argv.d === 0 ? false : true;

    gulp.task('init', function(cb) {
        var base = $.jsonFilePlus.sync(sourceUrl + 'base.json'),
        baseConfig = base.data.web;

        config = $.extend(baseConfig, {
            path   : argv.p,
            author : argv.a,
            libs   : argv.l,
            src    : argv.src,
            dist   : argv.dist
        });
        base.saveSync();
        config.libs = path.relative(config.src, config.libs);
        config.src = path.join(config.path, config.src);
        config.dist = path.join(config.path, config.dist);
        
        console.log('\n');
        if (config.path) {
            console.log('当前配置:\n');
            console.log(config);
        } else {
            cb('err: 请指定项目目录！');
        }
        console.log('\n');

        config.oSrc = !argv.all && config.tpl || config.src;

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
                require('child_process').exec('start http://localhost:8080/' + config.libs + '/demo.html');
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
                $.del([config.dist + '/' + pathRelative], {force: true});
            } else {
                gulp.src(file.path, {base: config.src})
                    .pipe($.imagemin(configs.imagemin))
                    .pipe(gulp.dest(config.dist))
                    .pipe(message('复制并压缩'));
            }
        });
        // sprites
        $.watch(config.src + '/**/images/*/*.{png,gif,jpg,jpeg}', function(file) {
            sprites(file.dirname);
        });
        // fonts
        $.watch(config.src + '/**/fonts/*/*.svg', function(file) {
            fonts(file.dirname)
        });
        // scss
        $.watch([config.src + '/**/css/*.scss'], function (file) {
            if (file.event == 'unlink') {
                var pathRelative = path.relative(config.src, file.path.replace(/.scss/,'.css'));
                $.del([config.dist + '/' + pathRelative], {force: true});
            } else {
                scss(file.path);
            }
        });
        // js
        $.watch([config.src + '/**/js/*.js'], function(file) {
            if (file.event == 'unlink') {
                var pathRelative = path.relative(config.src, file.path);
                $.del([config.dist + '/' + pathRelative], {force: true});
            } else {
                JS(file.path);
            }
        });
        // concat js
        $.watch([
            config.src + '/**/js/*/*.js',
            '!' + config.src + '/**/js/{static,plugin}/*.js'
        ], function(file) {
            concatJS(file.dirname);
        });
        // 将项目中的atsui文件复制回atsui库中
        if (argv.r) {
            $.watch([
                config.src + '/**/*'
            ], function(file) {
                if (file.event == 'unlink') {
                    var pathRelative = path.relative(config.src, file.path);
                    $.del([config.tpl + '/' + pathRelative], {force: true});
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
                        .pipe(gulp.dest(config.tpl))
                        .pipe(message('到 ' + config.tpl))
                        .pipe(gulp.dest(config.dist));
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
    gulp.task('build', ['init', 'copy', 'pack', 'concat', 'sprites', 'fonts', 'scss']);
    // 复制核心到项目
    gulp.task('copy', ['init'], function (cb) {
        var dist = path.join(config.src, config.libs);
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
            .pipe(gulp.dest(dist));

        require('fs').exists(config.src + '/css/units/variables.scss',
            function(exists) {
                if (!exists) {
                    gulp.src(config.tpl + '/css/units/variables.scss', {
                            base: config.tpl
                        })
                        .pipe(gulp.dest(dist));
                };
                cb();
            })
    });
    // 打包项目文件
    gulp.task('pack', ['copy'], function(cb) {
        var dist = path.join(config.dist, argv.all ? './' : config.libs);
        // 处理自定义的img
        gulp.src([config.oSrc + '/**/images/*.{png,gif,jpg,jpeg}'], {base: config.oSrc})
            .pipe($.imagemin(configs.imagemin))
            .pipe(gulp.dest(dist));

        // 直接复制核心
        gulp.src([config.oSrc + '/**/plugin/*.js'], {base: config.oSrc})
            .pipe($.uglify(configs.uglify))
            .pipe(gulp.dest(dist));
        gulp.src([config.oSrc + '/**/static/*'], {base: config.oSrc})
            .pipe(gulp.dest(dist));
        gulp.src(config.oSrc + '/**/*/*.html', {base: config.oSrc })
            .pipe(gulp.dest(dist));
        // 处理自定义的js
        $.glob(config.oSrc + '/**/js/*.js', function (err, files) {
            buildCB(JS, files, cb);
        });
    });
    // concatjs 异步处理
    gulp.task('concat', ['pack'], function(cb) {
        $.glob(config.oSrc + '/**/js/!(plugin|static)/', function (err, files) {
            buildCB(concatJS, files, cb);
        });

    });

    // sprites 异步处理
    gulp.task('sprites', ['concat'], function(cb) {
        $.glob(config.oSrc + '/**/images/!(static)/', function (err, files) {
            buildCB(sprites, files, cb);
        });

    });
    // fonts 异步处理
    gulp.task('fonts', ['sprites'], function(cb) {
        $.glob(config.oSrc + '/**/fonts/!(static)/', function (err, files) {
            buildCB(fonts, files, cb);
        });
    })
    // scss 单独出来，异步处理
    gulp.task('scss', ['fonts'], function(cb) {
        $.glob(config.oSrc + '/**/css/*.scss', function (err, files) {
            buildCB(scss, files, cb);
        });
    })

    // clean
    gulp.task('clean', ['init'], function(cb) {
        $.del([config.dist + '/**/{css,js,images,fonts,maps}'], {force: true}, cb);
    });
};