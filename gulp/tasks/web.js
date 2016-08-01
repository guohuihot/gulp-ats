module.exports = function(gulp, $, utils) {
    // base
    var path  = require('path'),
        configs   = require('../configs'),
        fs        = require('fs'),
        argv      = $.yargs
        .alias({
            path      : 'p',
            author    : 'a',
            custom    : 'c',
            libs      : 'l',
            dev       : 'd',
            server    : 's',
            open      : 'o',
            ftp       : 'f',
            reverse   : 'r',
            mode      : 'm',
            tpl       : 't'
        }).argv,
        cwd       = process.cwd() + '/',
        sourceUrl = path.join(cwd, './gulp/'),
        
        sign      = {
        img       : 'img',
        font      : 'font'
        },
        ftp       = {},
        config    = {},
        _dir,
        _timer,
        pExt;

    var message = function (msg) {
            return $.notify(function(file) {
                // console.log(path.extname(file.path));
                if (!config.isBuild) {
                    return msg || path.relative(config.path, file.path) + ' ok !';
                };
            })
        };

    var sourcemaps = function(filePath) {
            // filePath 源文件path, 整个过程从生成文件目录找到src目录
            // 相对对src目录
            var fileRelative = path.relative(config.src, filePath)
            var distDir = path.dirname(path.join(config.distEx || config.dist, fileRelative))
            var relativePath = path.relative(distDir, config.src);
            // 一定要写入src目录
            return $.sourcemaps.write(config.src, {
                includeContent: false,
                // 相对dist目录
                sourceMappingURL: function(file) {
                    var srcMapURL = path.join(relativePath, file.relative + '.map')
                    return srcMapURL;
                },
                // 相对dist目录
                sourceRoot: relativePath.split(path.sep).join('/'),
                // addComment: false,
            });
    }
    // 复制时替换的数据
    var tplData = function(file) {
            // src文件到src = dist文件到dist
            var pathRelative = path.relative(path.dirname(file.path), config.src);
            var pathRelative1 = path.relative(config.src, file.path);
            var sExtLen = path.extname(file.path).length;
            // console.log(config.distEx ? '/' : config.rPath);
            return {
                name   : path.basename(file.path).slice(0, -sExtLen),
                author : config.author,
                date   : $.moment().format('YYYY-MM-DD HH:mm:ss'),
                base   : path.join(pathRelative, config.libs)
                            .split(path.sep).join('/') + '/',
                path   : path.join(config.mode == 4 ? 'test/' : '', pathRelative1)
                            .split(path.sep).join('/'),
                rPath  : config.distEx ? '/' : config.rPath,
                info   : config.info,
            }
        }
    // gulpMiddleWare
    var gulpMiddleWare = function(stream, filePath) {
        var s;

        s = stream.pipe($.if(argv.charset == 'gbk', $.convertEncoding({
                to: 'gbk'
            })))
            .pipe($.if(argv.d, sourcemaps(filePath)))
            .pipe(gulp.dest(config.dist))
            .pipe($.through2.obj(function(file, encoding, done) {
                if (file.extname != '.map') {
                    file.contents = new Buffer(file.contents);
                    this.push(file);
                }
                done();
            }))

        if (argv.f) {
            s.pipe(ftp.dest(config.ftp.remotePath))
                .pipe($.if(argv.s, $.connect.reload(), $.livereload()))
                .pipe(message())
        } else {
            s.pipe($.if(argv.s, $.connect.reload(), $.livereload()))
                .pipe(message());
        }
        
        return s;
    }

    var sprites = function(dir, cb) {
        var stream = $.mergeStream();
        var pathBase = path.relative(config.src, dir + '/../../')
                            .split(path.sep).join('/') + './';

        var fName    = path.basename(dir).slice(1),
            cssPath  = path.join(pathBase, 'css/_' + sign.img + '-' + fName + '.scss');
        // console.log(pathBase);
        // return false;
        var spriteData = gulp.src(dir + '/*.{png,gif,jpg,jpeg}')
            .pipe($.changed(config.dist, {extension: fName + '.png'}))
            .pipe($.spritesmith({
                imgName: pathBase + 'images/' + fName + '.png',
                cssName: 'sprite.json',
                // cssName: path.join(dir, '../../css/img/' + fName + '.scss'),
                padding: 10
            }));

            // console.log(spriteData.css);
        var dataFun = function(file, cb1) {
                spriteData.css.pipe($.concatStream(function(jsonArr) {
                    // console.log(jsonArr, 2222);
                    if (!jsonArr[0].contents) {
                        console.error('错误：' + file);
                        cb1()
                    };
                    var dataJSON = JSON.parse(jsonArr[0].contents),
                        maxH = 0,
                        maxW = 0;
                    for (item in dataJSON) {
                        maxH = Math.max(dataJSON[item].height, maxH);
                        maxW = Math.max(dataJSON[item].width, maxW);
                    }
                    cb1(undefined, {
                        cssData : dataJSON,
                        fUrl    : '../images/' + fName + '.png',
                        path    : pathBase + 'images/' + fName + '.html',
                        rPath   : config.distEx ? '/' : config.rPath,
                        fName   : fName,
                        sign    : sign.img,
                        W       : maxW,
                        H       : maxH,
                    });
                }));
            };

        stream.add(gulp.src([sourceUrl + 'css/images.scss'])
            .pipe($.changed(config.src, {extension: cssPath}))
            .pipe($.plumber())
            .pipe($.data(dataFun))
            .pipe($.template())
            .pipe($.rename(cssPath))
            .pipe(gulp.dest(config.src))
            .pipe(message()));
        gulp.src([sourceUrl + 'html/images.html'])
            .pipe($.changed(config.dist, {extension: 'images/' + fName + '.html'}))
            .pipe($.plumber())
            .pipe($.data(dataFun))
            .pipe($.template())
            .pipe($.rename(pathBase + 'images/' + fName + '.html'))
            .pipe(gulp.dest(config.dist))
            .pipe(message());
        stream.add(spriteData.img
            .pipe(gulp.dest(config.dist))
            .pipe(message('sprites img 生成')));
        // cb && cb();
        return stream;
    }

    var fonts = function(dir, cb) {
        var stream = $.mergeStream();
        var pathBase = path.relative(config.src, dir + '/../../')
                            .split(path.sep).join('/') + '/',
            fName    = path.basename(dir).slice(1),
            cssPath  = path.join(pathBase, 'css/_' + sign.font + '-' + fName + '.scss');

        var stream1 = gulp.src(dir + '/*.svg', {base: config.src })
            .pipe($.changed(config.dist))
            .pipe($.iconfont({
                fontName: pathBase + 'fonts/' + fName, // required
                // appendUnicode: true, // recommended option
                formats: ['eot', 'woff'], // default, 'woff2' and 'svg' are available
                normalize: true, // 兼容不同大小的字体图标合成
                // timestamp: runTimestamp // recommended to get consistent builds when watching files
            }))
            .on('glyphs', function(glyphs, options) {
                // console.log(glyphs, options);

                var templateData = {
                        cssData : glyphs,
                        fUrl    : '../fonts/',
                        path    : pathBase + 'fonts/' + fName + '.html',
                        rPath   : config.distEx ? '/' : config.rPath,
                        sign    : sign.font,
                        fName   : fName
                    };

                stream.add(gulp.src([sourceUrl + 'css/fonts.scss'])
                    .pipe($.changed(config.src))
                    .pipe($.template(templateData))
                    .pipe($.rename(cssPath))
                    .pipe(gulp.dest(config.src))
                    .pipe(message()));
                gulp.src([sourceUrl + 'html/fonts.html'])
                    .pipe($.changed(config.dist))
                    .pipe($.template(templateData))
                    .pipe($.rename(pathBase + 'fonts/' + fName + '.html'))
                    .pipe(gulp.dest(config.dist))
                    .pipe(message());
                cb && cb();
            })
            .pipe(gulp.dest(config.dist))
            .pipe(message('font 生成'));
            stream.add(stream1)
        return stream;
    }
    // scss
    var scss = function(filePath, cb) {
        var stream = gulp.src(filePath, {base: config.src})
            // .pipe($.changed(config.dist, {extension: '.css'}))
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            .pipe($.sass({
                includePaths: [path.dirname(filePath), config.tpl + config.libs + '/css/'],
                // includePaths: [path.dirname(filePath), config.tpl + config.libs + '/css/'],
                outputStyle: 'nested',
                //Type: String Default: nested Values: nested, expanded, compact, compressed
                sourceMap: true
            }).on('error', $.sass.logError))
            .pipe($.if(argv.d,
                $.csscomb(sourceUrl + 'css/csscomb.json'),
                $.csso()
            ))
            .pipe($.template({
                name: path.basename(filePath).slice(0, -5),
                author: config.author,
                date: $.moment().format('YYYY-MM-DD HH:mm:ss')
            }))
            .pipe($.autoprefixer({
                browsers: ['ff >= 3','Chrome >= 20','Safari >= 4','ie >= 8'],
                cascade: true, // 是否美化属性值 默认：true 像这样：
                //-webkit-transform: rotate(45deg);
                //        transform: rotate(45deg);
                //remove:true //是否去掉不必要的前缀 默认：true
            }))

        
        // cb && cb();
        return gulpMiddleWare(stream, filePath);
    }
    // concatjs
    var concatJS = function(dir, cb) {
        var pathRelative = path.relative(config.src, dir).replace('_', ''),
            fName        = path.basename(dir).slice(1);
        
        var stream = gulp.src(dir + '/*.js', {base: config.src })
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            // .pipe($.if(!config.isBuild, $.jshint(configs.jshint)))
            // .pipe($.if(!config.isBuild, $.jshint.reporter()))
            .pipe($.data(function(file) {
                return {
                    name   : path.basename(file.path).slice(0, -3),
                    author : config.author,
                    date   : $.moment().format('YYYY-MM-DD HH:mm:ss'),
                    // base   : host,
                    rPath  : config.distEx ? '../' : config.rPath,
                }
            }))
            .pipe($.template())
            .pipe($.if(!argv.d, $.uglify(configs.uglify)))
            // .pipe($.uglify(configs.uglify))
            .pipe($.concat(pathRelative + '.js'))
        
        cb && cb();
        return gulpMiddleWare(stream, dir);
    }
    // js
    var JS = function(filePath, cb) {
        var stream = gulp.src(filePath, {base: config.src})
            .pipe($.changed(config.dist))
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init(), $.uglify(configs.uglify)))
            // .pipe($.if(!config.isBuild, $.jshint(configs.jshint)))
            // .pipe($.if(!config.isBuild, $.jshint.reporter()))
            // .pipe($.uglify(configs.uglify))
            .pipe($.data(tplData))
            .pipe($.template())
        
        
        cb && cb();

        return gulpMiddleWare(stream, filePath);
    }

    var buildCB = function(fun, files, cb0, isLast) {
        var stream = $.mergeStream();
        stream.add(gulp.src('./src/libs/demo.html'));
        
        files.forEach(function(file) {
            stream.add(fun(file, function() {
                if (config.isBuild && isLast) {
                    if (config.distEx) {
                        gulp.src([
                                config.dist + '/**/*',
                                '!' + config.dist + '/src/**/*'
                            ])
                            .pipe($.changed(config.distEx))
                            .pipe(gulp.dest(config.distEx));
                    }
                    gulp.src('./package.json', {
                            read: false
                        })
                        .pipe($.notify('build ok'));
                }
            }));
        });

        return stream;
    }
    // tasks start

    gulp.task('init', function(cb) {
        var base, customConfig;

        if (!fs.existsSync(sourceUrl + 'base.json')) {
            fs.writeFileSync(sourceUrl + 'base.json', '');
        }

        base = $.jsonFilePlus.sync(sourceUrl + 'base.json');

        if (base.data) {
            if (argv.p) {
                // 有路径时直接保存配置及时间戳
                config = base.data[argv.p] || {};
            } else {
                // 没有时直接从base里找最后一次配置
                for (p in base.data) {
                    if (base.data[p].t > (config.t || 0)) {
                        config = base.data[p];
                    }
                }
            }
        } else {
            base.data = {};
        }
        // 默认项
        argv.d = argv.d === 0 ? false : true;
        argv.m = argv.m || config.mode;

        switch (argv.m) {
            case 11:
                customConfig = {
                    libs   : '',
                    tpl    : './src/libs/', // ats源目录
                    dist   : '', // 项目的dist
                    src    : 'src', // 项目的src
                };
                break;
            case 2:
            case 21:
                customConfig = {
                    libs   : 'libs',
                    tpl    : './src/',
                    dist   : '',
                    src    : 'src',
                };
                break;
            case 3:
                customConfig = {
                    libs   : 'mobile',
                    tpl    : './src/',
                    dist   : '',
                    src    : 'src',
                };
                break;
            case 4:
                customConfig = {
                    path   : cwd,
                    libs   : 'libs',
                    tpl    : './src/',
                    dist   : 'test/',
                    distEx : '',
                    src    : 'src',
                };
                break;
            case 'c':
                customConfig = {
                    libs   : '',
                    tpl    : './src/libs/',
                };
                break;
        }

        // console.log(config);
        config = $.extend({
                author: 'author',
                distEx: '',
                libs: '',
                tpl: './src/libs/', // ats源目录
                dist: '', // 项目的dist
                src: 'src', // 项目的src
                mode: 1
            },
            config, {
                path: argv.p,
                author: argv.a,
                dist: argv.dist,
                distEx: argv.distEx,
                src: argv.src,
                mode: argv.m
            }, customConfig);

        // 目录不存在时直接返回
        if (!config.path) {
            console.log('error: 请设置项目目录path!');
            return false;
        };

        // 设置时间下次直接用
        config.t = parseInt(new Date().getTime() / 1000);
        base.data[config.path] = config;
        base.saveSync();
        // 固定配置不用保存
        // config.src = 'src'; // 项目src目录
        // config.sourcemap = './maps/';

        console.log('\n');
        console.log('当前配置:\n');
        console.log(config);
        console.log('\n');

        // 转化后
        config.rPath = config.dist != config.libs ?
                            config.dist + config.libs + '/' :
                            '';
        config.src  = path.join(config.path, config.src);
        config.dist = path.join(config.path, config.dist);
        // config.tpl  = path.join(config.path, config.tpl);

        // console.log(config);
        // getInfo
        config.info = utils.getInfo();
        cb();
    });
    // connect
    gulp.task('connect', function() {
            $.connect.server({
                root: config.path,
                port: 8888,
                // 静态服务器使用
                livereload: true,
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
                require('child_process').exec('start http://localhost:8888/' + demoUrl);
            }
        });
    // watch

    gulp.task('watch', ['init'], function() {
        if (argv.f) {
            if (!config.ftp) {
                console.log('请先在gulp/base.json里设置ftp相关配置!');
                return false;
            }
            ftp = $.ftp.create(config.ftp);
        } else {
            // 只刷新html
            $.watch([
                config.dist + '/**/*.{html,htm}',
                '!' + config.dist + '/**/{fonts,images,src}/*.{html,htm}'
            ], {read: false}, function(file) {
                gulp.src(file.path, {
                        read: false
                    })                
                    // .pipe($.changed(config.dist))
                    .pipe(gulp.dest(config.dist))
                    .pipe($.if(argv.s, $.connect.reload(), $.livereload()))
                    .pipe(message('livereload'));
            });
        }
            
        // 扩展dist 直接将生成好的文件复制过去
        if (config.distEx) {
            $.watch([
                config.dist + '/**/*',
                '!' + config.dist + '/src/**/*'
            ], {
                read: false
            }, function(file) {
                if (file.event == 'unlink') {
                    var pathRelative = path.relative(config.dist, file.path);
                    $.del([config.distEx + '/' + pathRelative], {
                        force: true
                    });
                } else {
                    gulp.src(file.path, {
                            base: config.dist
                        })
                        .pipe($.changed(config.distEx))
                        .pipe(gulp.dest(config.distEx))
                        .pipe($.if(argv.s, $.connect.reload(), $.livereload()));
                }
            })
        }
        // html
        // $.watch([
        //     config.src + '/**/*.{html,htm}',
        //     '!' + config.dist + '/**/_*.{html,htm}'
        // ], {
        //     read: false
        // }, function(file) {
        //     if (file.event == 'unlink') {
        //         var pathRelative = path.relative(config.src, file.path);
        //         $.del([config.dist + '/' + pathRelative], {
        //             force: true
        //         });
        //     } else {
        //         gulp.src(file.path, {
        //                 base: config.src
        //             })
        //             .pipe($.changed(config.dist))
        //             .pipe($.plumber())
        //             .pipe($.fileInclude())
        //             .pipe($.if(argv.charset == 'gbk', $.convertEncoding({
        //                 to: 'gbk'
        //             })))
        //             .pipe(gulp.dest(config.dist))
        //             .pipe(message('html处理ok'));
        //     }
        // });
        // images
        // $.watch([config.src + '/**/{images,pic}/**/*.{png,gif,jpg,jpeg}'], {
        //     read: false,
        //     usePolling: true
        // }, function(file) {
        //     if (file.event == 'unlink') {
        //         var pathRelative = path.relative(config.src, file.path);
        //         $.del([config.dist + '/' + pathRelative], {
        //             force: true
        //         });
        //     } else {
        //         var tag = path.basename(file.dirname)[0];
        //         if (tag != '_') {
        //             gulp.src(file.path, {
        //                     base: config.src
        //                 })                    
        //                 .pipe($.changed(config.dist))
        //                 .pipe($.imagemin(configs.imagemin))
        //                 .pipe(gulp.dest(config.dist))
        //                 .pipe(message('复制并压缩'));
        //         } else {
        //             sprites(file.dirname);
        //         }
        //     }
        // });
        // fonts
        // $.watch(config.src + '/**/fonts/_*/*.svg', {
        //     read: false,
        //     usePolling: true
        // }, function(file) {
        //     return fonts(file.dirname);
        // });
        // scss
        // $.watch([config.src + '/**/css/*.scss'], {
        //             read: false
        //         }, function(file) {
        //     if (file.basename.slice(0, 1) === '_') {
        //         var fileName = file.stem.slice(1),
        //             files = $.glob.sync(config.src + '/**/css/!(_*).scss'),
        //             reg = new RegExp('(\'|\")\s*' + fileName + '\s*(\'|\")');
                
        //         files.forEach(function(filePath) {
        //             // console.log(fs.readFileSync(p).toString().search(reg));
        //             // 处理所有包括当前'_base'的scss
        //             if (fs.readFileSync(filePath).toString().search(reg) != -1) {
        //                 scss(filePath);      
        //             }
        //         });
        //     } else {
        //         if (file.event == 'unlink') {
        //             var pathRelative = path.relative(config.src, file.path.slice(0, -5) + '.css');
        //             $.del([config.dist + '/' + pathRelative], {force: true});
        //         } else {
        //             scss(file.path);
        //         }
        //     }
        // });
        // js
        // $.watch([
        //     config.src + '/**/js/**/*.js',
        //     '!' + config.src + '/**/js/_*/*.js'
        // ], {
        //     read: false
        // }, function(file) {
        //     if (file.event == 'unlink') {
        //         var pathRelative = path.relative(config.src, file.path);
        //         $.del([config.dist + '/' + pathRelative], {
        //             force: true
        //         });
        //     } else {
        //         JS(file.path);
        //     }
        // });
        // 直接复制
        $.watch([
                config.src + '/**/*'
            ], {
            read: false,
            usePolling: true
        }, function(file) {
            if (file.event == 'unlink') {
                var pathRelative = path.relative(config.src, file.path);
                $.del([config.dist + '/' + pathRelative], {
                    force: true
                });
            } else if (file.extname == '.scss') {
                if (file.basename.slice(0, 1) === '_') {
                    var fileName = file.stem.slice(1),
                        files = $.glob.sync(config.src + '/**/css/!(_*).scss'),
                        reg = new RegExp('(\'|\")\s*' + fileName + '\s*(\'|\")');
                    
                    files.forEach(function(filePath) {
                        // console.log(fs.readFileSync(p).toString().search(reg));
                        // 处理所有包括当前'_base'的scss
                        if (fs.readFileSync(filePath).toString().search(reg) != -1) {
                            scss(filePath);      
                        }
                    });
                } else {
                    if (file.event == 'unlink') {
                        var pathRelative = path.relative(config.src, file.path.slice(0, -5) + '.css');
                        $.del([config.dist + '/' + pathRelative], {force: true});
                    } else {
                        scss(file.path);
                    }
                }
            } else if (file.extname == 'png,gif,jpg,jpeg') {
                var tag = path.basename(file.dirname)[0];
                if (tag != '_') {
                    gulp.src(file.path, {
                            base: config.src
                        })                    
                        .pipe($.changed(config.dist))
                        .pipe($.imagemin(configs.imagemin))
                        .pipe(gulp.dest(config.dist))
                        .pipe(message('复制并压缩'));
                } else {
                    sprites(file.dirname);
                }
            } else if (file.extname == '.svg') {
               return fonts(file.dirname);
            } else if (file.extname == '.js') {
                JS(file.path);
            } else if (file.extname == '.jpg') {
                var tag = path.basename(file.dirname)[0];
                if (tag != '_') {
                    gulp.src(file.path, {
                            base: config.src
                        })                    
                        .pipe($.changed(config.dist))
                        .pipe($.imagemin(configs.imagemin))
                        .pipe(gulp.dest(config.dist))
                        .pipe(message('复制并压缩'));
                } else {
                    sprites(file.dirname);
                }
            } else if (file.extname == '.html') {
                gulp.src(file.path, {
                        base: config.src
                    })
                    .pipe($.changed(config.dist))
                    .pipe($.plumber())
                    .pipe($.fileInclude())
                    .pipe($.if(argv.charset == 'gbk', $.convertEncoding({
                        to: 'gbk'
                    })))
                    .pipe(gulp.dest(config.dist))
                    .pipe(message('html处理ok'));
            } else {
                gulp.src(file.path, {
                        base: config.src
                    })
                    .pipe($.changed(config.dist))
                    .pipe(gulp.dest(config.dist))
                    .pipe(message('直接复制'));
            }
        });
        // concat js
        $.watch([
            config.src + '/**/js/_*/*.js',
        ], {
            read: false
        }, function(file) {
            concatJS(file.dirname);
        });
        if (argv.s) {
            gulp.start('connect');
        } else {
        // 动态使用
            $.livereload.listen({
                port: 35729, // Server port
                // host: host, // Server host
                basePath: config.distEx || config.path, // Path to prepend all given paths
                start: true, // Automatically start
                quiet: true//, // Disable console logging
                //reloadPage: 'index.html' // Path to the browser's current page for a full page reload
            });
        };
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
        var atsFromSrc = path.join(atsSrc, (argv.m == 2 || atsSrc, argv.m == 21) ? config.libs : '');

        // 只重建核心
        config.isBuild = true;

        if (config.mode == 4) {
            // 如果是核心开发，不复制直接处理代码
            cb();
        } else if (!argv.all) {
            var stream = $.mergeStream();
            var atsFromData = $.glob.sync(atsFromSrc + '/**/*');
            var proSrcData = $.glob.sync(proSrc + '/**/*');
            stream.add(gulp.src('./src/libs/demo.html'));
            // console.log(proSrcData);
            atsFromData.forEach(function(from) {
                proSrcData.forEach(function(pro) {
                    if (path.relative(config.tpl, from) == path.relative(proSrc, pro)) {
                        stream.add(gulp.src(from, {
                                base: atsSrc
                            })
                            .pipe($.changed(proSrc))
                            .pipe($.if(utils.hasProp(['_variables.scss', '_utilities.scss', 'ats.scss']), $.rename({
                                suffix: '_demo'
                            })))
                            .pipe(gulp.dest(proSrc)));
                    };
                });
            });

            return stream;
        } else {
            // 内容字串
            var sss = (argv.m == 11 || argv.m == 21) ? [
                path.join(atsFromSrc, '/css/**/*'),
                path.join(atsFromSrc, '/images/**/*'),
                path.join(atsFromSrc, '/fonts/**/*'),
                path.join(atsFromSrc, '/pic/**/*'),
                path.join(atsFromSrc, '/**/{jquery,duang,demo}.js'),
                path.join(atsFromSrc, '/**/*.html'),
            ] : [
                atsFromSrc + '/**/*',
            ];
            // 复制核心代码
            return gulp.src(sss, {
                    base: atsSrc
                })
                .pipe($.changed(proSrc))
                .pipe($.if(utils.hasProp(['_variables.scss', '_utilities.scss', 'ats.scss']), $.rename({
                    suffix: '_demo'
                })))
                .pipe(gulp.dest(proSrc));
        }
    });
    // 打包项目文件
    gulp.task('pack', ['copy'], function(cb) {
        var proSrc = config.src;
        var proDist = config.dist;
        var stream = $.mergeStream();

        stream.add(gulp.src('./src/libs/demo.html'));
        // 处理img
        stream.add(gulp.src([
                proSrc + '/**/images/*/**.{png,gif,jpg,jpeg}',
                '!' + proSrc + '/**/images/_*/**.{png,gif,jpg,jpeg}',
            ], {
                base: proSrc
            })
            .pipe($.imagemin(configs.imagemin))
            .pipe(gulp.dest(proDist)));

        stream.add(gulp.src(proSrc + '/**/demo*.html', {base: proSrc })
            .pipe($.data(tplData))
            .pipe($.template())
            .pipe(gulp.dest(proDist)));
            // return false;
        // 处理正常的js
        stream.add(buildCB(JS, $.glob.sync(proSrc + '/**/js/*.js').concat($.glob.sync(proSrc + '/**/js/!(_*)/*.js')), cb));

        return stream;
    });
    // concatjs 异步处理
    gulp.task('concat', ['pack'], function(cb) {
        return buildCB(concatJS, $.glob.sync(config.src + '/**/js/_*/'), cb);
    });
    // sprites 异步处理
    gulp.task('sprites', ['concat'], function(cb) {
        return buildCB(sprites, $.glob.sync(config.src + '/**/images/_*/'), cb);
    });
    // fonts 异步处理
    gulp.task('fonts', ['sprites'], function(cb) {
        return buildCB(fonts, $.glob.sync(config.src + '/**/fonts/_*/'), cb);
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