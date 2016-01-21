module.exports = function(gulp, $) {
    // base
    var path      = require('path'),
        configs   = require('../configs'),
        argv      = $.yargs
                        .alias({
                            path    : 'p',
                            author  : 'a',
                            all     : 'al',
                            libs    : 'l',
                            dev     : 'd',
                            server  : 's',
                            open    : 'o',
                            ftp     : 'f',
                            reverse : 'r',
                            mode    : 'm',
                            tpl     : 't'
                        }).argv,
        cwd       = process.cwd() + '/',
        sourceUrl = path.join(cwd, './gulp/'),
        sign      = {
            img: 'img',
            font: 'font'
        },
        config    = {};
    // functions
    var message = function (info) {
            return $.notify(function(file) {
                // console.log(path.extname(file.path));
                if (path.extname(file.path) != '.map') {
                    return path.relative(config.path, file.path) + ' ' + info + ' ok !';
                };
            })
        };
    var getSourceRoot = function (filePath) {
        return path.relative(path.dirname(filePath), config.path) + '/src/';
    };

    var sprites = function(dir, cb) {
        var pathRelative = path.relative(config.src, dir),
            fName        = path.basename(dir),
            cssPath      = path.join(pathRelative, '../../css/' + sign.img + '/' + fName + '.scss');

        var spriteData = gulp.src(dir + '/*.{png,gif,jpg,jpeg}')
            .pipe($.spritesmith({
                imgName: pathRelative + '.png',
                cssName: 'sprite.json',
                // cssName: path.join(dir, '../../css/img/' + fName + '.scss'),
                padding: 10
            }));

            // console.log(spriteData.css);
        var dataFun = function(file, cb1) {
                spriteData.css.pipe($.concatStream(function(jsonArr) {
                    // console.log(jsonArr);
                    // console.log(jsonArr[0].contents);
                    cb1(undefined, {
                        cssData : JSON.parse(jsonArr[0].contents),
                        fUrl    : '../images/' + fName + '.png',
                        // base    : path.relative(config.dist + pathRelative, config.dist) + '/',
                        path    : config.rPath,
                        fName   : fName,
                        sign    : sign.img
                    });
                }));
            };  

        gulp.src(sourceUrl + 'css/images.scss')
            .pipe($.data(dataFun))
            .pipe($.template())
            .pipe($.rename(cssPath))
            .pipe(gulp.dest(config.dist))
            .pipe(message('sprites scss 生成'));
        // images 预览文件
        gulp.src(sourceUrl + 'html/images.html')
            .pipe($.data(dataFun))
            .pipe($.template())
            .pipe($.rename(pathRelative + '.html'))
            .pipe(gulp.dest(config.dist));

        spriteData.img
            .pipe(gulp.dest(config.dist))
            .pipe(message('sprites img 生成'));
        cb && cb();
    }

    var fonts = function(dir, cb) {
        var pathRelative = path.relative(config.src, dir),
            fName        = path.basename(dir),
            cssPath      = path.join(pathRelative, '../../css/' + sign.font + '/' + fName + '.scss');

        gulp.src(dir + '/*.svg', {base: config.src })
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
                        cssData : glyphs,
                        fUrl    : '../fonts/',
                        // base    : path.relative(config.dist + pathRelative, config.dist) + '/',
                        path    : config.rPath,
                        sign    : sign.font,
                        fName   : fName
                    };

                gulp.src(sourceUrl + 'css/fonts.scss')
                    .pipe($.template(templateData))
                    .pipe($.rename(cssPath))
                    .pipe(gulp.dest(config.dist))
                    .pipe(message('font scss 生成'));

                gulp.src(sourceUrl + 'html/fonts.html')
                    .pipe($.template(templateData))
                    .pipe($.rename(pathRelative + '.html'))
                    // .pipe($.convertEncoding({to: 'gbk'}))
                    .pipe(gulp.dest(config.dist))
                cb && cb();
            })
            // .pipe($.plumber())
            .pipe(gulp.dest(config.dist))
            .pipe(message('font 生成'));
    }
    // scss
    var scss = function(filePath, cb) {
        gulp.src(filePath, {base: config.src})
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            .pipe($.sass({
                includePaths: config.tpl + config.libs + 'css/',
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
            .pipe($.if(!argv.d || (config.isBuild && !argv.all),
                $.csso(),
                $.csscomb(sourceUrl + 'css/csscomb.json')
            ))
            .pipe($.template({
                name: path.basename(filePath),
                author: config.author,
                date: $.moment().format('YYYY-MM-DD HH:mm:ss')
            }))
            // .pipe($.convertEncoding({to: 'gbk'}))
            .pipe($.if(argv.d, $.sourcemaps.write(config.sourcemap, {
                sourceRoot: getSourceRoot(filePath),
                includeContent: false
            })))
            .pipe(gulp.dest(config.dist))
            .pipe($.if(argv.s, $.connect.reload(), $.livereload()))
            .pipe(message('scss 生成'));
        cb && cb();
    }
    // concatjs
    var concatJS = function(dir, cb) {
        var pathRelative = path.relative(config.src, dir),
            fName        = path.basename(dir);

        gulp.src(dir + '/*.js', {base: config.src })
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            // .pipe($.if(!config.isBuild, $.jshint(configs.jshint)))
            // .pipe($.if(!config.isBuild, $.jshint.reporter()))
            .pipe($.data(function(file) {
                return {
                    name   : path.basename(file.path),
                    author : config.author,
                    date   : $.moment().format('YYYY-MM-DD HH:mm:ss'),
                    // base   : host,
                    path   : config.rPath
                }
            }))
            .pipe($.template())
            .pipe($.uglify(configs.uglify))
            .pipe($.concat(pathRelative + '.js'))
            // .pipe($.convertEncoding({to: 'gbk'}))
            .pipe($.if(argv.d, $.sourcemaps.write(config.sourcemap, {
                // C:\Users\Administrator\Desktop\test\map\js\seajs
                // C:\Users\Administrator\Desktop\test\src\
                sourceRoot: getSourceRoot(dir),
                destPath: './',
                includeContent: false
            })))
            .pipe(gulp.dest(config.dist))
            .pipe(message('合并 压缩'));
        cb && cb();
    }
    // js
    var JS = function(filePath, cb) {
        gulp.src(filePath, {base: config.src})
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            // .pipe($.if(!config.isBuild, $.jshint(configs.jshint)))
            // .pipe($.if(!config.isBuild, $.jshint.reporter()))
            .pipe($.uglify(configs.uglify))
            .pipe($.template({
                name   : path.basename(filePath),
                author : config.author,
                date   : $.moment().format('YYYY-MM-DD HH:mm:ss')
            }))
            // .pipe($.convertEncoding({to: 'gbk'}))
            .pipe($.if(argv.d, $.sourcemaps.write(config.sourcemap, {
                sourceRoot: getSourceRoot(filePath),
                includeContent: false
            })))
            .pipe(gulp.dest(config.dist))
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
    // tasks start

    gulp.task('init', function(cb) {
        var base       = $.jsonFilePlus.sync(sourceUrl + 'base.json'),
            baseConfig = base.data.web;
        // 默认为开发模式
        argv.d = argv.d === 0 ? false : true;

        // 原始
        baseConfig.src = './src/'; // 项目src目录
        baseConfig.sourcemap = './maps/';

        if (argv.m == 1) {
            config = $.extend(baseConfig, {
                path   : argv.p,
                author : argv.a,
                libs   : './',
                tpl    : './src/libs/',
                dist   : './',
                mode   : argv.m
            });
        } else if (argv.m == 2 || argv.m == 3) {
            config = $.extend(baseConfig, {
                path   : argv.p,
                author : argv.a,
                libs   : './libs/',
                tpl    : './src/',
                dist   : './',
                mode   : argv.m
            });
        } else if (argv.m == 'd') {
            config = $.extend(baseConfig, {
                path   : cwd,
                author : argv.a,
                libs   : './libs/',
                tpl    : './src/',
                dist   : './test/',
                mode   : argv.m
            });
        } else {
            config = $.extend(baseConfig, {
                path   : argv.p,
                author : argv.a
            });
        };

        base.saveSync();

        console.log('\n');
        console.log('当前配置:\n');
        console.log(config);
        console.log('\n');

        // 转化后
        config.rPath = config.dist != config.libs ?
                            path.join(config.dist, config.libs) : 
                            '';
        config.src   = path.join(config.path, config.src);
        config.dist  = path.join(config.path, config.dist);

        cb();
    });
    // connect
    gulp.task('connect', function() {
            $.connect.server({
                root: config.path,
                port: 8080,
                // 静态服务器使用
                livereload: argv.s ? true : false,
                /*middleware: function(connect, opt) {
                    return [function(req, res, next) {
                        console.log(req);
                        console.log('Hello from middleware');
                        next();
                      }]
                }*/
            });
            if (argv.o) {
                var demoUrl = config.rPath + 'demo.html'
                require('child_process').exec('start http://localhost:8080/' + demoUrl);
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
            // 动态使用
            if (!argv.s) {
                $.livereload.listen({
                    port: 35729, // Server port
                    // host: host, // Server host
                    basePath: config.path, // Path to prepend all given paths
                    start: true, // Automatically start
                    quiet: false//, // Disable console logging
                    //reloadPage: 'index.html' // Path to the browser's current page for a full page reload
                });
            };

            $.watch([
                config.dist + '/**/*.html',
                '!' + config.dist + '/**/{fonts,images}/*.html'
            ], function(file) {
                gulp.src(file.path, {
                        read: false
                    })
                    .pipe(gulp.dest(config.dist))
                    .pipe($.if(argv.s, $.connect.reload(), $.livereload()))
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
        $.watch([config.src + '/**/js/*.js', config.src + '/**/js/plugin/*.js'], function(file) {
            if (file.event == 'unlink') {
                var pathRelative = path.relative(config.src, file.path);
                $.del([config.dist + '/' + pathRelative], {force: true});
            } else {
                JS(file.path);
            }
        });
        // 直接复制
        $.watch([config.src + '/**/static/*'], function(file) {
            if (file.event == 'unlink') {
                var pathRelative = path.relative(config.src, file.path);
                $.del([config.dist + '/' + pathRelative], {force: true});
            } else {
                gulp.src(file.path, {base: config.src})
                    .pipe(gulp.dest(config.dist))
                    .pipe(message('直接复制'));
            }
        });
        // concat js
        $.watch([
            config.src + '/**/js/*/*.js',
            '!' + config.src + '/**/js/{static,plugin}/*.js'
        ], function(file) {
            concatJS(file.dirname);
        });
        if (argv.s) {
            gulp.start('connect');
        }
    });
    // build
    gulp.task('build', ['init', 'copy', 'pack', 'concat', 'sprites', 'fonts', 'scss']);
    // 复制核心到项目
    gulp.task('copy', ['init'], function (cb) {
        var toSrc = config.src;
        // 只重建核心
        // config.isBuild = !argv.all;

        if (config.isBuild) {
            config.src = path.join(config.path, config.tpl);
        }
        // return false;
        if (config.mode == 'd') {
            // 如果是核心开发，不复制直接处理代码
            cb();
        } else {
            var isNeedTpl = function(file) {
                    return path.basename(file.path) === 'seajs.config.js' || 
                            path.extname(file.path) === '.html';
                };
            // 复制核心代码
            gulp.src([
                    config.src + '/**/*',
                    '!' + config.src + '/**/units/**/*'
                ], {base: config.src})
                .pipe(
                    $.if(isNeedTpl, 
                        $.data(function(file) {
                            return {
                                base : path.relative(path.dirname(file.path), config.src) + '/',
                                path : config.rPath
                            }
                        }))
                )
                .pipe($.if(isNeedTpl, $.template()))
                .pipe(gulp.dest(toSrc));

            gulp.src(config.src + '/**/variables.scss', {
                    base: config.src
                })
                .pipe(gulp.dest(toSrc));

            /*if (!argv.all) {
                // 只重建核心 == 直接复制核心生成代码 --all,不生成
            } else {
                cb();
                // 全部重建 == 不复制核心生成代码 --all 1，往下走重新生成项目的内容
            }*/
            cb();
        }
    });
    // 打包项目文件
    gulp.task('pack', ['copy'], function(cb) {
        // 处理自定义的img
        gulp.src([config.src + '/**/images/*.{png,gif,jpg,jpeg}'], {base: config.src})
            .pipe($.imagemin(configs.imagemin))
            .pipe(gulp.dest(config.dist));

        // 直接复制核心
        gulp.src([config.src + '/**/plugin/*.js'], {base: config.src})
            .pipe($.uglify(configs.uglify))
            .pipe(gulp.dest(config.dist));
        gulp.src([config.src + '/**/static/*'], {base: config.src})
            .pipe(gulp.dest(config.dist));
        gulp.src(config.src + '/**/demo*.html', {base: config.src })
            .pipe($.data(function(file) {
                return {
                    base : $.url.parse(path.relative(path.dirname(file.path), config.path) + '/').href,
                    path : config.rPath
                }
            }))
            .pipe($.template())
            .pipe(gulp.dest(config.dist));
            // return false;
        // 处理自定义的js
        $.glob(config.src + '/**/js/*.js', function (err, files) {
            buildCB(JS, files, cb);
        });
    });
    // concatjs 异步处理
    gulp.task('concat', ['pack'], function(cb) {
        $.glob(config.src + '/**/js/!(plugin|static)/', function (err, files) {
            buildCB(concatJS, files, cb);
        });

    });

    // sprites 异步处理
    gulp.task('sprites', ['concat'], function(cb) {
        $.glob(config.src + '/**/images/!(static)/', function (err, files) {
            buildCB(sprites, files, cb);
        });

    });
    // fonts 异步处理
    gulp.task('fonts', ['sprites'], function(cb) {
        $.glob(config.src + '/**/fonts/!(static)/', function (err, files) {
            buildCB(fonts, files, cb);
        });
    })
    // scss 单独出来，异步处理
    gulp.task('scss', ['fonts'], function(cb) {
        $.glob(config.src + '/**/css/*.scss', function (err, files) {
            buildCB(scss, files, cb);
        });
    })
    // add
    gulp.task('add', ['init'], function () {
        // return false;
        return gulp.src([
                cwd + 'src/libs/**/{static,common,plugin,units,demo}',
                cwd + 'src/libs/**/{demo,s}.*'
            ], {base: cwd + 'src/libs/'})
            .pipe(gulp.dest(config.src + '/' + argv.n));
    })
    // clean
    gulp.task('clean', ['init'], function(cb) {
        // return false;
        $.del([
            config.path, '/**',
            '!' + config.path,
            '!' + config.path + '/src/**'
        ], {
            force: true
        }, cb);
    });
};