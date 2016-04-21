module.exports = function(gulp, $) {
    // base
    var path      = require('path'),
        configs   = require('../configs'),
        argv      = $.yargs
                        .alias({
                            path    : 'p',
                            author  : 'a',
                            custom  : 'c',
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
        config;
    // functions
    var message = function (info) {
            return $.notify(function(file) {
                // console.log(path.extname(file.path));
                if (path.extname(file.path) != '.map' && !config.isBuild) {
                    return path.relative(config.path, file.path) + ' ' + info + ' ok !';
                };
            })
        };

    var sourcemaps = function (filePath) {
        var relativePath; 
        if (config.distEx) {
            relativePath = path.relative(config.distEx + '/a.css', config.src);
        } else {
            relativePath = path.relative(argv.dist + '/a.css', config.src);
        };
        return $.sourcemaps.write(config.src, {
                    sourceRoot: relativePath,
                    sourceMappingURL: function(file) {
                        return relativePath + '\\' + file.relative + '.map';
                      },
                    includeContent: false
                });
    }
    // 复制时替换的数据
    var tplData = function(file) {
            // 处理demo
            var tasks = require('../tasks'), taskInfo = '', params;

            taskInfo += [
                '\n',
                '例：',
                'gulp build -p \'C:\\Users\\Administrator\\Desktop\\test\' -a \'ahuing\' -m 1',
                '显示帮助信息(参数一个字母一个中线，大于一个字母两个中线)',
                '\n'
            ].join('\n');

            for(var i in tasks) {
                params = '';
                for (var j in tasks[i]['argv']) {
                    params += j + '\t' + tasks[i]['argv'][j] + '\n\n\t';
                }
                taskInfo += 'gulp ' + i + '\t' + tasks[i]['title'] + '\n\t' + params + '\n';
            }
            // src文件到src = dist文件到dist
            var pathRelative = path.relative(path.dirname(file.path), config.src);
            var pathRelative1 = path.relative(config.src, file.path);
            return {
                name : path.basename(file.path),
                base  : path.join(pathRelative, config.libs)
                            .split(path.sep).join('/') + '/',
                path  : path.join(config.mode == 4 ? 'test/' : '', pathRelative1)
                            .split(path.sep).join('/'),
                rPath : config.distEx ? '/' : config.rPath,
                info  : taskInfo,
            }
        }

    var sprites = function(dir, cb) {
        var pathBase = path.relative(config.src, dir + '/../../')
                            .split(path.sep).join('/') + './',
            fName    = path.basename(dir),
            cssPath  = path.join(pathBase, 'css/_' + sign.img + '-' + fName + '.scss');
        var spriteData = gulp.src(dir + '/*.{png,gif,jpg,jpeg}')
            .pipe($.spritesmith({
                imgName: pathBase + 'images/' + fName + '.png',
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
                        path    : pathBase + 'images/' + fName + '.html',
                        rPath   : config.distEx ? '/' : config.rPath,
                        fName   : fName,
                        sign    : sign.img
                    });
                }));
            };

        gulp.src(sourceUrl + 'css/images.scss')
            .pipe($.data(dataFun))
            .pipe($.template())
            .pipe($.rename(cssPath))
            .pipe(gulp.dest(config.src))
            .pipe(message('sprites scss 生成'));
        // images 预览文件
        gulp.src(sourceUrl + 'html/images.html')
            .pipe($.data(dataFun))
            .pipe($.template())
            .pipe($.rename(pathBase + 'images/' + fName + '.html'))
            .pipe(gulp.dest(config.dist));
        spriteData.img
            .pipe(gulp.dest(config.dist))
            .pipe(message('sprites img 生成'));
        cb && cb();
        return spriteData;
    }

    var fonts = function(dir, cb) {
        var pathBase = path.relative(config.src, dir + '/../../')
                            .split(path.sep).join('/') + '/',
            fName    = path.basename(dir),
            cssPath  = path.join(pathBase, 'css/_' + sign.font + '-' + fName + '.scss');

        var stream = gulp.src(dir + '/*.svg', {base: config.src })
            .pipe($.iconfont({
                fontName: pathBase + 'fonts/' + fName, // required
                // appendUnicode: true, // recommended option
                formats: ['eot', 'woff'], // default, 'woff2' and 'svg' are available
                normalize: true, // 兼容不同大小的字体图标合成
                // timestamp: runTimestamp // recommended to get consistent builds when watching files
            }))
            .on('glyphs', function(glyphs, options) {
                // CSS templating, e.g.
                // console.log(glyphs, options);

                var templateData = {
                        cssData : glyphs,
                        fUrl    : '../fonts/',
                        path    : pathBase + 'fonts/' + fName + '.html',
                        rPath   : config.distEx ? '/' : config.rPath,
                        sign    : sign.font,
                        fName   : fName
                    };

                gulp.src(sourceUrl + 'css/fonts.scss')
                    .pipe($.template(templateData))
                    .pipe($.rename(cssPath))
                    .pipe(gulp.dest(config.src))
                    .pipe(message('font scss 生成'));
                gulp.src(sourceUrl + 'html/fonts.html')
                    .pipe($.template(templateData))
                    .pipe($.rename(pathBase + 'fonts/' + fName + '.html'))
                    .pipe($.if(argv.charset == 'gbk', $.convertEncoding({to: 'gbk'})))
                    .pipe(gulp.dest(config.dist))
                    .pipe(message('font html 生成'));
                cb && cb();
            })
            // .pipe($.plumber())
            .pipe(gulp.dest(config.dist))
            .pipe(message('font 生成'));

        return stream;
    }
    // scss
    var scss = function(filePath, cb) {
        // console.log(config.tpl + config.libs + '/css/');
        // return false;
        var stream = gulp.src(filePath, {base: config.src})
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            .pipe($.sass({
                includePaths: [path.dirname(filePath), config.tpl + config.libs + '/css/'],
                outputStyle: 'nested',
                //Type: String Default: nested Values: nested, expanded, compact, compressed
                sourceMap: true
            }).on('error', $.sass.logError))
            .pipe($.autoprefixer({
                browsers: ['ff >= 3','Chrome >= 20','Safari >= 4','ie >= 8'],
                cascade: true, // 是否美化属性值 默认：true 像这样：
                //-webkit-transform: rotate(45deg);
                //        transform: rotate(45deg);
                //remove:true //是否去掉不必要的前缀 默认：true
            }))
            .pipe($.if(argv.d,
                $.csscomb(sourceUrl + 'css/csscomb.json'),
                $.csso()
            ))
            .pipe($.template({
                name: path.basename(filePath),
                author: config.author,
                date: $.moment().format('YYYY-MM-DD HH:mm:ss')
            }))
            .pipe($.if(argv.charset == 'gbk', $.convertEncoding({to: 'gbk'})))
            .pipe($.if(argv.d, sourcemaps(filePath)))
            .pipe(gulp.dest(config.dist))
            .pipe($.if(argv.s, $.connect.reload(), $.livereload()))
            .pipe(message('scss 生成'));
        cb && cb();
        return stream;
    }
    // concatjs
    var concatJS = function(dir, cb) {
        var pathRelative = path.relative(config.src, dir),
            fName        = path.basename(dir);

        var stream = gulp.src(dir + '/*.js', {base: config.src })
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
                    rPath  : config.rPath
                }
            }))
            .pipe($.template())
            .pipe($.if(!argv.d, $.uglify(configs.uglify)))
            .pipe($.concat(pathRelative + '.js'))
            .pipe($.if(argv.charset == 'gbk', $.convertEncoding({to: 'gbk'})))
            .pipe($.if(argv.d, sourcemaps(dir)))
            .pipe(gulp.dest(config.dist))
            .pipe($.if(argv.s, $.connect.reload(), $.livereload()))
            .pipe(message('合并 压缩'));
        cb && cb();
        return stream;
    }
    // js
    var JS = function(filePath, cb) {
        var stream = gulp.src(filePath, {base: config.src})
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            // .pipe($.if(!config.isBuild, $.jshint(configs.jshint)))
            // .pipe($.if(!config.isBuild, $.jshint.reporter()))
            .pipe($.if(!argv.d, $.uglify(configs.uglify)))
            .pipe($.template({
                name   : path.basename(filePath),
                author : config.author,
                date   : $.moment().format('YYYY-MM-DD HH:mm:ss')
            }))
            .pipe($.if(argv.charset == 'gbk', $.convertEncoding({to: 'gbk'})))
            .pipe($.if(argv.d, sourcemaps(filePath)))
            .pipe(gulp.dest(config.dist))
            .pipe($.if(argv.s, $.connect.reload(), $.livereload()))
            .pipe(message('处理'));
        cb && cb();

        return stream;
    }

    var buildCB = function(fun, files, cb0, isLast) {
        var stream = $.mergeStream();
        files.forEach(function(file) {
            stream.add(fun(file, function() {
                if (config.isBuild && isLast) {
                    if (config.distEx) {
                        gulp.src([config.dist + '/**/*', '!' + config.dist + '/src/**/*'])
                            .pipe(gulp.dest(config.distEx));
                    }
                    gulp.src('./package.json', {read: false })
                        .pipe($.notify('build ok'));
                }
            }));
        });
        // $.async.eachLimit(files, 10, function(file, callback) {
        //         stream.add(fun(file, callback));
        //     }, function(err) {
        //         if (!err) {
        //             if (config.isBuild && isLast) {
        //                 if (config.distEx) {
        //                     gulp.src([config.dist + '/**/*', '!' + config.dist + '/src/**/*'])
        //                         .pipe(gulp.dest(config.distEx));
        //                 }
        //                 gulp.src('./package.json', {read: false })
        //                     .pipe($.notify('build ok'));
        //             }
        //             cb0();
        //         }
        //     })
        return stream;
    }
    // tasks start

    gulp.task('init', function(cb) {
        var base = $.jsonFilePlus.sync(sourceUrl + 'base.json');
        if (base.data == undefined) {
            base.data = {
                web: {}
            };
        };
        config = base.data.web;
        // 默认为开发模式
        argv.d = argv.d === 0 ? false : true;

        if (argv.m == 1) {
            customConfig = {
                path   : argv.p,
                author : argv.a,
                libs   : '',
                tpl    : './src/libs/',
                dist   : '',
                src    : 'src',
                mode   : argv.m
            };
        } else if (argv.m == 2 || argv.m == 3) {
            customConfig = {
                path   : argv.p,
                author : argv.a,
                libs   : 'libs',
                tpl    : './src/',
                dist   : '',
                src    : 'src',
                mode   : argv.m
            };
        } else if (argv.m == 4) {
            customConfig = {
                path   : cwd,
                author : argv.a,
                libs   : 'libs',
                tpl    : './src/',
                dist   : 'test/',
                distEx : '',
                src    : 'src',
                mode   : argv.m
            };
        } else if (argv.m == 'c') {
            customConfig = {
                path   : argv.p,
                author : argv.a,
                libs   : '',
                tpl    : './src/libs/',
                dist   : argv.dist,
                distEx : argv.distEx,
                src    : argv.src,
                mode   : argv.m
            };
        } else {
            customConfig = {
                path   : argv.p,
                author : argv.a
            };
        };
        // console.log(config);
        base.data.web = config = $.extend({
                author    : 'author',
                libs      : '',
                tpl       : './src/libs/',
                dist      : '',
                src    : 'src',
                mode      : 1
            }, $.extend(config, customConfig));
        base.saveSync();
        // 固定配置不用保存
        // config.src = 'src'; // 项目src目录
        // config.sourcemap = './maps/';

        if (config.path) {
            console.log('\n');
            console.log('当前配置:\n');
            console.log(config);
            console.log('\n');
        } else {
            console.log('error: 请设置项目目录path!');
        };
        // 转化后
        config.rPath = config.dist != config.libs ?
                            config.dist + config.libs + '/' :
                            '';
        config.src  = path.join(config.path, config.src);
        config.dist = path.join(config.path, config.dist);
        // config.tpl  = path.join(config.path, config.tpl);

        // console.log(config);

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
                var demoUrl = config.rPath + 'demo.html';
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
                config.dist + '/**/*.{html,htm}',
                '!' + config.dist + '/**/{fonts,images,src}/*.{html,htm}'
            ], function(file) {
                gulp.src(file.path, {
                        read: false
                    })
                    .pipe(gulp.dest(config.dist))
                    .pipe($.if(argv.s, $.connect.reload(), $.livereload()))
                    .pipe(message('livereload'));
            });
        }
        // 扩展dist
        if (config.distEx) {
            $.watch([config.dist + '/**/*', '!' + config.dist + '/src/**/*'], function (file) {
                if (file.event == 'unlink') {
                    var pathRelative = path.relative(config.dist, file.path);
                    $.del([config.distEx + '/' + pathRelative], {force: true});
                } else {
                    gulp.src(file.path, {base: config.dist})
                        .pipe(gulp.dest(config.distEx));
                }
            })
        }
        // html
        $.watch([
                config.src + '/**/*.{html,htm}',
                '!' + config.dist + '/**/_*.{html,htm}'
            ], function(file) {
                if (file.event == 'unlink') {
                    var pathRelative = path.relative(config.src, file.path);
                    $.del([config.dist + '/' + pathRelative], {force: true});
                } else {
                    gulp.src(file.path, {base: config.src})
                        .pipe($.plumber())
                        .pipe($.fileInclude())
                        .pipe($.if(argv.charset == 'gbk', $.convertEncoding({to: 'gbk'})))
                        .pipe(gulp.dest(config.dist))
                        .pipe(message('html处理ok'));
                }
            });
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
    gulp.task('build', [
        'init',
        'copy',
        'pack',
        'concat',
        'sprites',
        'fonts',
        'scss'
    ]);
    // 复制核心到项目
    gulp.task('copy', ['init'], function (cb) {
        var atsSrc = config.tpl;
        var proSrc = config.src;
        var isNeedTpl = function(file) {
                return path.basename(file.path) === 'seajs.config.js' ||
                        path.extname(file.path) === '.html';
            };
        var isVariables = function(file) {
                return path.basename(file.path) === '_variables.scss';
            };
        // 只重建核心
        config.isBuild = true;

        if (config.mode == 4) {
            // 如果是核心开发，不复制直接处理代码
            cb();
        } else {
            // 复制核心代码
            return gulp.src([
                    // atsSrc + '/**/*.html',
                    // atsSrc + '/**/*.config.js',
                    // atsSrc + '/**/demo*.*',
                    // atsSrc + '/**/demo/**',
                    atsSrc + '/**/*',
                    '!' + atsSrc + '/libs/**/*.config.js'
                ], {base: atsSrc})
                // .pipe($.if(isNeedTpl, $.data(tplData)))
                // .pipe($.if(isNeedTpl, $.template()))
                .pipe($.if(isVariables, $.rename({basename: '__variables'})))
                .pipe(gulp.dest(proSrc));
        }
    });
    // 打包项目文件
    gulp.task('pack', ['copy'], function(cb) {
        var proSrc = config.src;
        var proDist = config.dist;
        var stream = $.mergeStream();
        // 处理自定义的img
        stream.add(gulp.src([proSrc + '/**/images/*.{png,gif,jpg,jpeg}'], {base: proSrc})
            .pipe($.imagemin(configs.imagemin))
            .pipe(gulp.dest(proDist)));

        // 直接复制核心
        stream.add(gulp.src([proSrc + '/**/plugin/*.js'], {base: proSrc})
            .pipe($.if(!argv.d, $.uglify(configs.uglify)))
            .pipe(gulp.dest(proDist)));

        stream.add(gulp.src([proSrc + '/**/static/*'], {base: proSrc})
            .pipe(gulp.dest(proDist)));

        stream.add(gulp.src(proSrc + '/**/demo*.html', {base: proSrc })
            .pipe($.data(tplData))
            .pipe($.template())
            .pipe(gulp.dest(proDist)));
            // return false;
        stream.add(buildCB(JS, $.glob.sync(proSrc + '/**/js/*.js'), cb));
        // 处理自定义的js
        return stream;
    });
    // concatjs 异步处理
    gulp.task('concat', ['pack'], function(cb) {
        return buildCB(concatJS, $.glob.sync(config.src + '/**/js/!(plugin|static)/'), cb);
    });

    // sprites 异步处理
    gulp.task('sprites', ['concat'], function(cb) {
        return buildCB(sprites, $.glob.sync(config.src + '/**/images/!(static)/'), cb);
    });
    // fonts 异步处理
    gulp.task('fonts', ['sprites'], function(cb) {
        return buildCB(fonts, $.glob.sync(config.src + '/**/fonts/!(static)/'), cb);
    })
    // scss 单独出来，异步处理
    gulp.task('scss', ['fonts'], function(cb) {
        return buildCB(scss, $.glob.sync(config.src + '/**/css/*.scss'), cb);
    })
    // add
    gulp.task('add', ['init'], function() {
        // return false;
        return gulp.src([
                cwd + 'src/libs/**/{static,common,plugin,units,demo}',
                cwd + 'src/libs/**/{demo,s}.*'
            ], {base: cwd + 'src/libs/'})
            .pipe(gulp.dest(config.src + '/' + argv.n));
    })
    // clean
    gulp.task('clean', ['init'], function(cb) {
        // console.log(config.path);
        // return false;
        $.del([
            config.path, '/**',
            '!' + config.path,
            '!' + config.path + '/src/**'
        ], {
            force: true
        }, cb);
    });
    // php copy
    gulp.task('php-copy', function(cb) {
        argv.p = argv.p || 'E:/wwwroot/newcore';
        var _path = argv.p.split(path.sep).join('/') + '/';
        console.log('执行' + 'php ' + _path + 'app/console assets:install ' + _path + 'web');
        return require('child_process').exec('php ' + _path + 'app/console assets:install ' + _path + 'web');
    });
};