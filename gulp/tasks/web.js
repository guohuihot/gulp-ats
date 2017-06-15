module.exports = function(gulp, $, utils, configs) {
    // base
    var path  = require('path'),
        fs        = require('fs'),
        argv      = $.yargs
        .alias({
            path      : 'p',
            author    : 'au',
            alias     : 'a',
            custom    : 'c',
            libs      : 'l',
            dev       : 'd',
            server    : 's',
            open      : 'o',
            src      : 'src',
            ftp       : 'f',
            reverse   : 'r',
            mode      : 'm',
            type      : 't'
        }).argv,
        CWD       = process.cwd() + '/',
        SOURCEURL = path.join(CWD, './gulp/'),
        
        sign      = {
        img       : 'img',
        font      : 'font'
        },
        ftp       = {},
        config    = {},
        _dir,
        _timer,
        _base,
        pExt;

    // 初始化swig
    $.swig(configs.swig);

    var message = function (msg) {
            return $.notify(function(file) {
                // console.log(path.extname(file.path));
                if (!config.isBuild) {
                    return msg || file.path + ' ok !';
                };
            })
        };

    var sourcemaps = function(filePath) {
        // 如果是目录，合并js时
        var isDir = !path.extname(filePath);
        if (isDir) {
            // filePath += '/a.js';
            filePath = path.join(filePath, '../a.js');
        };

        var dist = getDir(filePath);
        var src = getDir(filePath, 'src');
        var distPath = path.join(dist, path.relative(src, filePath));    
        // 从dist到src
        var fileRelative = path.relative(distPath, filePath)      
                                .normal();    

        return $.sourcemaps.write('./', {
            includeContent: false,
            // 相对dist目录
            sourceMappingURL: function(file) {
                var srcMapURL = path.basename(file.path) + '.map'
                return srcMapURL;
            },
            mapSources: function(sourcePath) {
                if (sourcePath.indexOf('src/libs/') >= 0) {
                    // ..\..\..\..\..\..\nodejs\src\libs\css\mixins\clearfix.scss => css\mixins\clearfix.scss
                    sourcePath = path.relative(path.join(sourcePath, '../../../'), sourcePath).normal(); 
                }
                // return path.join(path.dirname(fileRelative), '../', sourcePath)
                //         .normal(); 
                return sourcePath; 
            },
            // debug: true,
            // 相对dist目录
            sourceRoot: path.join(path.dirname(fileRelative), '../'),
            // addComment: false, // 不显示sourceMappingURL
        });
    }
    // 复制时替换的数据
    var tplData = function(file) {
            var src = getDir(file.path, 'src');
            // src文件到src = dist文件到dist
            var pathRelative = path.relative(path.dirname(file.path), src);
            var pathRelative1 = path.relative(src, file.path);
            // console.log(config.distEx ? '/' : config.rPath);
            return {
                name   : path.basename(file.path, path.extname(file.path)),
                author : config.author,
                base   : path.join(pathRelative, config.libs)
                            .normal() + '/',
                path   : path.join(config.mode == 4 ? 'test/' : '', pathRelative1)
                            .normal(),
                rPath  : getRpath(file.path) || '',
                info   : config.info,
            }
        }
    // gulpMiddleWare
    var gulpMiddleWare = function(stream, filePath) {
        var dist = getDir(filePath);
        var s;

        s = stream.pipe($.if(argv.charset == 'gbk', $.convertEncoding({
                to: 'gbk'
            })))
            .pipe($.if(argv.d, sourcemaps(filePath)))
            .pipe(gulp.dest(dist))
            .pipe($.through2.obj(function(file, encoding, done) {
                if (path.extname(file.path) != '.map') {
                    file.contents = new Buffer(file.contents);
                    this.push(file);
                }
                done();
            }))

        if (argv.f) {
            s.pipe(ftp.dest(config.ftp.remotePath))
                .pipe(utils.browserSync.stream())
                .pipe(message())
        } else {
            s.pipe(utils.browserSync.stream())
                .pipe(message());
        }
        
        return s;
    }

    var sprites = function(dir, cb) {
        var src = getDir(dir, 'src');
        var dist = getDir(dir);

        var stream = $.mergeStream();
        var pathBase = path.relative(src, dir + '/../../')
                            .normal() + './';

        var fName    = path.basename(dir).slice(1),
            cssPath  = path.join(pathBase, 'css/_' + sign.img + '-' + fName + '.scss');
        // console.log(pathBase);
        // return false;
        var spriteData = gulp.src(dir + '/*.{png,gif,jpg,jpeg}')
            // .pipe($.changed(dist, {extension: fName + '.png'}))
            .pipe($.plumber())
            .pipe($.spritesmith({
                imgName: pathBase + 'images/' + fName + '.png',
                cssName: 'sprite.json',
                // cssName: path.join(dir, '../../css/img/' + fName + '.scss'),
                padding: 10
            }));

            // console.log(spriteData.css);
        var dataFun = function(file, cb1) {
                spriteData.css.pipe($.through2.obj(function(file, encoding, cb) {
                    var dataJSON = JSON.parse(file.contents.toString()),
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
                        rPath   : getRpath(dir),
                        fName   : fName,
                        sign    : sign.img,
                        W       : maxW,
                        H       : maxH,
                    });
                }));
                /*spriteData.css.pipe($.concatStream(function(jsonArr) {
                    // console.log(jsonArr, 2222);
                    if (!jsonArr[0] || !jsonArr[0].contents) {
                        console.error('错误：没有sprites内容');
                        cb1()
                        return;
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
                        rPath   : getRpath(dir),
                        fName   : fName,
                        sign    : sign.img,
                        W       : maxW,
                        H       : maxH,
                    });
                }));*/
            };

        stream.add(gulp.src([SOURCEURL + 'css/images.scss'])
            // .pipe($.changed(src, {extension: cssPath}))
            .pipe($.plumber())
            .pipe($.data(dataFun))
            .pipe($.swig())
            .pipe($.rename(cssPath))
            .pipe(gulp.dest(src))
            .pipe(message()));
        gulp.src([SOURCEURL + 'html/images.html'])
            .pipe($.changed(dist, {extension: 'images/' + fName + '.html'}))
            .pipe($.plumber())
            .pipe($.data(dataFun))
            .pipe($.swig())
            .pipe($.rename(pathBase + 'images/' + fName + '.html'))
            .pipe(gulp.dest(dist))
            .pipe(utils.browserSync.stream())
            .pipe(message());
        stream.add(spriteData.img
            .pipe(gulp.dest(dist))
            .pipe(message('sprites img 生成')));
        // cb && cb();
        return stream;
    }

    var fonts = function(dir, cb) {
        var src = getDir(dir, 'src');
        var dist = getDir(dir);

        var stream = $.mergeStream();
        var pathBase = path.relative(src, dir + '/../../')
                            .normal() + '/',
            fName    = path.basename(dir).slice(1),
            cssPath  = path.join(pathBase, 'css/_' + sign.font + '-' + fName + '.scss');

        var stream1 = gulp.src(dir + '/*.svg', {base: src })
            // 压缩
            .pipe($.imagemin(configs.imagemin))
            // .pipe($.changed(dist))
            .pipe($.iconfont({
                fontName: pathBase + 'fonts/' + fName, // required
                // appendUnicode: true, // recommended option
                formats: ['eot', 'woff'], // default, 'woff2' and 'svg' are available
                normalize: true, // 兼容不同大小的字体图标合成
                // fontHeight: 32,
                centerHorizontally: true,
                // timestamp: Math.round(Date.now()/1000) // recommended to get consistent builds when watching files
            }))
            .on('glyphs', function(glyphs, options) {
                // console.log(glyphs, options);

                var templateData = {
                    data: {
                        cssData : glyphs,
                        fUrl    : '../fonts/',
                        path    : pathBase + 'fonts/' + fName + '.html',
                        rPath   : getRpath(dir),
                        sign    : sign.font,
                        fName   : fName
                    }
                };

                stream.add(gulp.src([SOURCEURL + 'css/fonts.scss'])
                    // .pipe($.changed(src))
                    .pipe($.swig(templateData))
                    .pipe($.rename(cssPath))
                    .pipe(gulp.dest(src))
                    .pipe(message()));
                gulp.src([SOURCEURL + 'html/fonts.html'])
                    // .pipe($.changed(dist))
                    .pipe($.swig(templateData))
                    .pipe($.rename(pathBase + 'fonts/' + fName + '.html'))
                    .pipe(gulp.dest(dist))
                    .pipe(utils.browserSync.stream())
                    .pipe(message());
                cb && cb();
            })
            .pipe(gulp.dest(dist))
            .pipe(message('font 生成'));
            stream.add(stream1)
        return stream;
    }
    // scss
    var scss = function(filePath, cb) {
        var src = getDir(filePath, 'src');

        // var scssPaths = [path.dirname(filePath)];
        var scssPaths = [];
        if (config.scssPaths) {
            config.scssPaths.split(',').forEach(function(p) {
                scssPaths.push(p);
            })
        };
        
        scssPaths.push(config.tpl + config.libs + '/css/');

        var stream = gulp.src(filePath, {base: src})
            // .pipe($.changed(config.dist, {extension: '.css'}))
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            .pipe($.sass({
                includePaths: scssPaths,
                // includePaths: [path.dirname(filePath), config.tpl + config.libs + '/css/'],
                outputStyle: 'expanded',
                //Type: String Default: nested Values: nested, expanded, compact - 属性在一行, compressed
                // sourceMap: true
            }).on('error', $.sass.logError))
            .pipe($.swig({
                data: {
                    name: path.basename(filePath, path.extname(filePath)),
                    author: config.author
                },
                ext: '.css'
            }))
            .pipe($.if(!argv.d, $.through2.obj(function(file1, encoding, done) {
                // console.log(file1.sourceMap);
                var contents = String(file1.contents);
                // sass去不掉，/** */, 手动去掉jsdoc的注释
                var newContents = contents.replace(/\/\*\*([\s\S]*?)\*\//g, '');
                // var newContents = contents;
                file1.contents = new Buffer(newContents);
                this.push(file1);
                done();
            })))
            .pipe($.if(!argv.d,
                // $.csscomb(SOURCEURL + 'css/csscomb.json'),
                $.csso()
            ))
            .pipe($.if(!argv.d, $.autoprefixer({
                browsers: ['ff >= 3','Chrome >= 20','Safari >= 4','ie >= 8'],
                cascade: true, // 是否美化属性值 默认：true 像这样：
                map: false,
                //-webkit-transform: rotate(45deg);
                //        transform: rotate(45deg);
                //remove:true //是否去掉不必要的前缀 默认：true
            })))

        
        // cb && cb();
        return gulpMiddleWare(stream, filePath);
    }
    // concatjs
    var concatJS = function(dir, cb) {
        var src = getDir(dir, 'src');

        var pathRelative = path.relative(src, dir).replace('_', ''),
            fName        = path.basename(dir).slice(1);
/*        var aFiles = $.glob.sync(dir + '/*.js');
        var dependsMap = {};
        var filesMap = {};
        var depends = []

        aFiles.forEach(file => {
            var basename = path.basename(file, '.js')
            aFiles.forEach(function(file2) {
                var sCon = fs.readFileSync(file2).toString();
                if (utils.getDepends(sCon).includes(basename)) {
                    depends.push(basename);
                };
            });

        });
       
        console.log(depends);
        return false;*/
        var stream = gulp.src(dir + '/*.js', {base: src })
        // var stream = gulp.src(files, {base: src })
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            // .pipe($.if(!config.isBuild, $.jshint(configs.jshint)))
            // .pipe($.if(!config.isBuild, $.jshint.reporter()))
            .pipe($.data(function(file) {
                return {
                    name   : path.basename(file.path).slice(0, -3),
                    author : config.author,
                    // base   : host,
                    rPath  : getRpath(dir),
                }
            }))
            .pipe($.swig({ext: '.js'}))
            .pipe($.if(function(file1) {
                return utils.inArray('babel', utils.getRequires(file1.contents));
            }, $.babel({
                presets: ['babel-preset-env'].map(require.resolve)
            })))
            .pipe($.if(!argv.d, $.uglify(configs.uglify)))
            .pipe($.concat(pathRelative + '.js'))
        
        cb && cb();
        return gulpMiddleWare(stream, dir);
    }
    // js
    var JS = function(filePath, cb) {
        var src = getDir(filePath, 'src');
        var dist = getDir(filePath);

        var stream = gulp.src(filePath, {base: src})
            // build时全部生成
            .pipe($.if(!config.isBuild,$.changed(dist)))
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            // .pipe($.if(!config.isBuild, $.jshint(configs.jshint)))
            // .pipe($.if(!config.isBuild, $.jshint.reporter()))
            .pipe($.data(tplData))
            .pipe($.if(utils.hasProp(['template.js'], true), $.swig({ext: '.js'})))
            .pipe($.if(function(file1) {
                return utils.inArray('babel', utils.getRequires(file1.contents));
            }, $.babel({
                presets: ['babel-preset-env'].map(require.resolve)
            })))
            .pipe($.if(!argv.d, $.uglify(configs.uglify)))
        
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

    /**
     * getDir
     * @description 获取对应的目录，主要处理多目录监控里的目录
     * @param  {String} file 文件路径
     * @param  {String} [dir=dist]  要获取目录的标记， `dist` `src` `path` `distEx`
     * @return {String}      对应的绝对目录
     */
    var getDir = function(file, dir) {
        var dir = dir || 'dist';
        var _dir = config[dir]; 

        if (config.multiple) {
            config.path.split(',').forEach(function(p) {
                if (path.normalize(file).indexOf(p) == 0) {
                    if (_base.data[p]) {
                        var curConfig = _base.data[p];
                        _dir = dir == 'distEx' ? 
                                        curConfig[dir] : 
                                        (dir != 'path' && path.join(p, curConfig[dir]) || curConfig[dir]);
                    } else {
                        console.log('目录没有预先配置！' + p);
                        return false;
                    }
                }
            });
        }

        return _dir;
    }
    /**
     * 生成监听字串
     * @param  {String} str   要监听的字串
     * @param  {String} dir   要监听的相对目录
     * @param  {String|Array} noStr 要排序的字串，不需要监听的
     * @return {String}       返回完整的字串
     * @example
     * getWatchDir('**\/*', 'dist', '*.html') // [ 'C:\\Users\\Administrator\\Desktop\\test/**\/*',  ]
     *
     */
    var getWatchDir = function(str, dir, noStr) {
        var dir = dir || 'src';
        var aWatchDir = [];
        var aWatchDirNo = [];
        if (config.multiple) {
            config.path.split(',').forEach(function(p) {
                if (_base.data[p]) {
                    var curConfig = _base.data[p];
                    aWatchDir.push(path.join(curConfig.path, curConfig[dir], str));
                    if (noStr) {
                        aWatchDirNo.push(path.join('!' + curConfig.path, curConfig[dir], noStr));
                        aWatchDirNo.push(path.join('!' + curConfig.path, curConfig[dir], '/src/**/*'));
                    }
                } else {
                    console.log('目录没有预先配置！' + p);
                    return false;
                };
            });
        } else {
            aWatchDir.push(config[dir] + str);
            if (noStr) {
                aWatchDirNo.push(path.join('!' + config[dir], noStr));
            }
        }

        return aWatchDir.concat(aWatchDirNo);
    }
    // 转化后dist目录，相对目录
    var getRpath = function(file) {
        var rPath;
        var _getRpath = function(p) {

                if (path.normalize(file).indexOf(p) == 0) {
                    if (_base.data[p]) {
                        var curConfig = _base.data[p];
                        rPath = config.dist != config.libs ?
                            config.dist + config.libs + '/' : '';

                        rPath = curConfig.distEx ? '/' : rPath;
                    } else {
                        console.log('目录没有预先配置！' + p);
                        return false;
                    }
                }

            };

        if (config.multiple) {
            if (file) {
                config.path.split(',').forEach(_getRpath);
            } else {
                _getRpath(config.path.split(',')[0]);
            }
        } else {
            rPath = config.dist != config.libs ?
                            // config.dist + config.libs + '/' : '';
                            path.join(config.libs, '/') : '';
            rPath = config.distEx ? '/' : rPath;
        }

        return rPath.replace(/\\/g, '/');
    }
    // tasks start

    gulp.task('init', function(cb) {
        var customConfig;

        if (!fs.existsSync(SOURCEURL + 'base.json')) {
            // 不存在时 创建一个空的文件 保证不报错
            fs.writeFileSync(SOURCEURL + 'base.json', '');
        }

        _base = $.jsonFilePlus.sync(SOURCEURL + 'base.json');

        if (_base.data) {
            if (argv.path) {
                // 按路径找配置
                // 有路径时直接保存配置及时间戳
                config = _base.data[argv.alias || argv.path] || {};
            } else if (argv.alias) {
                // 按别名找配置
                for (p in _base.data) {
                    if (_base.data[p].alias == argv.alias) {
                        config = _base.data[p];
                    }
                }
            } else {
                // 按时间找配置
                // 没有时直接从_base里找最后一次配置
                for (p in _base.data) {
                    if (_base.data[p].t > (config.t || 0)) {
                        config = _base.data[p];
                    }
                }
            }
        } else {
            _base.data = {};
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
                        path   : CWD,
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
                config, 
                {
                    path: argv.path,
                    author: argv.author,
                    dist: argv.dist,
                    distEx: argv.distEx,
                    src: argv.src,
                    scssPaths: argv.scssPaths,
                    alias: argv.alias,
                    mode: argv.m
                }, customConfig);

            // 目录不存在时直接返回
            if (!config.path) {
                console.log('error: 请设置项目目录path!');
                return false;
            };

        // 设置时间下次直接用
        config.t = parseInt(new Date().getTime() / 1000);
        _base.data[config.path] = config;
        _base.saveSync();

        console.log('\n');
        console.log('当前配置:\n');
        console.log(config);
        console.log('\n');
        
        if (config.path.indexOf(',') != -1) {
            config.multiple = 1;

            config.path = path.normalize(config.path);

        } else {
            config.src  = path.join(config.path, config.src);
            config.dist = path.join(config.path, config.dist);
            // config.tpl  = path.join(config.path, config.tpl);
        }

        // getInfo
        config.info = utils.getInfo();
        cb();
    });
    // watch

    utils.browserSync = $.browserSync.create();
    gulp.task('watch', ['init'], function() {
        // delete
        $.del([
            path.join(config.path, 'src/**/*.map')
        ], {
            force: true
        });
        if (argv.debug) {
            // $.watch(path.join(CWD, 'gulp/**/*'), $.restart)
            $.watch(SOURCEURL + '**/*', $.restart)
            // gulp.watch(['./gulp/**/*'], require('gulp-restart'));
        };
        // 自动刷新 静态服务器使用
        if (argv.s) {
            var toolsbar = fs.readFileSync(SOURCEURL + 'html/toolsbar.html').toString();
            utils.browserSync.init({
                notify: false,
                server: [config.path, CWD + 'src/libs/css'],
                open: argv.o,
                port: 8888,
                directory: true,
                index: 'demo.html',
                logFileChanges: false, // 控制台文件提示
                logLevel: 'silent', // debug | info
                snippetOptions: {
                    // blacklist: [SOURCEURL + 'html/toolsbar.html'],
                    rule: {
                        match: /<\/body>/i,
                        fn: function (snippet, match) {
                            return snippet + toolsbar + match;
                        }
                    }
                }
            });
        } else {
            utils.browserSync.init({
                notify: false,
                logFileChanges: false, // 控制台文件提示
                logLevel: 'silent', // debug | info
            });
            // 创建静态服务器，sourceMap 使用
            $.connect.server({
                root: config.path.split(',').concat([CWD + 'src/libs/css']),
                port: 8888
            });
        };

        if (argv.f) {
            if (!config.ftp) {
                console.log('请先在gulp/base.json里设置ftp相关配置!');
                return false;
            }
            ftp = $.ftp.create(config.ftp);
        }
        // 扩展dist 直接将生成好的文件复制过去

        if (config.multiple || config.distEx) {
            // console.log(getWatchDir('/**/*', 'dist', '/**/*.map'));
            $.watch(getWatchDir('/**/*', 'dist', '/**/*.map'), {
                read: false
            }, function(file) {
                var dist = getDir(file.path);
                var distEx = getDir(file.path, 'distEx');

                var pathRelative = path.relative(dist, file.path);
                if (file.event == 'unlink') {
                    $.del([distEx + '/' + pathRelative], {
                        force: true
                    });
                } else {
                    gulp.src(file.path, {
                            base: dist
                        })
                        .pipe($.changed(distEx))
                        .pipe($.through2.obj(function(file2, encoding, done) {
                            var ext = path.extname(file.path);
                            // 处理sourcemap
                            if ({'.js': 1, '.css': 1}[ext]) {
                                var relPath = 'http://localhost:8888/' + 
                                                path.relative(getDir(file.path, 'path'), path.dirname(file.path))
                                                .normal() + '/';
                                var newContents = file2.contents
                                                    .toString().replace(/(sourceMappingURL=)/, '$1' + relPath);
                                file2.contents = new Buffer(newContents);   
                            };           
                            this.push(file2);
                            done();
                        }))
                        .pipe(gulp.dest(distEx))
                        .pipe(utils.browserSync.stream());
                }
            })
        }
        
        $.watch(getWatchDir('/**/*.{js,scss,css,gif,jpg,jpeg,png,html,htm,svg}'), {
            read: false,
            usePolling: true
        }, function(file) {
            var dist = getDir(file.path);
            var src = getDir(file.path, 'src');

            if (file.event == 'unlink') {
                var nFile        = file.extname == '.scss' ? path.basename(file.path, '.scss') + '.css' : file.path;
                var pathRelative = path.relative(src, nFile);
                var uFile        = dist + '/' + pathRelative;
                var delFile      = [uFile];
                var tag          = path.basename(file.dirname)[0];

                if ({'.scss': 1, '.js': 1}[file.extname]) {
                    // 同时删除map文件
                    delFile.push(nFile + '.map');
                } else if ({'.svg': 1}[file.extname]) {
                    fonts(path.dirname(nFile));
                } else if ({".png": 1, ".gif": 1, ".jpg": 1, ".jpeg": 1}[file.extname]) {
                    var _dirname = path.dirname(nFile);
                    // 如果是删除小图片，需要重新合并其它图片
                    if (_dirname[0] == '_') {
                        sprites(_dirname);
                    }
                }

                $.del.sync(delFile, {
                    force: true
                });

                // 目标目录
                var fDirname = path.dirname(uFile);

                if (tag == '_') {
                    // 删除合并文件夹
                    var aFiles = $.glob.sync(file.dirname + '/**/*');
                    // 原目录
                    var oDirname = path.dirname(nFile).replace('_', '');

                    fDirname = fDirname.replace('_', '');
                    if (!aFiles.length) {
                        $.del.sync([fDirname + '.*', oDirname + '.js.map'], {
                            force: true
                        })
                    }
                } else {
                    // 删除文件夹
                    var aFiles = $.glob.sync(fDirname + '/**/*');
                    if (!aFiles.length) {
                        $.del.sync([fDirname], {
                            force: true
                        })
                    }
                }
            } else if (file.extname == '.scss') {
                var fileName = file.stem;
                // 文件内容缓存
                var oFileCache = {}; 
                var _oFiles = {};
                // 加入当前的文件
                if (fileName[0] != '_') {
                    _oFiles[file.path] = 1;
                } else {
                    var files = $.glob.sync(src + '/**/css/**/!('+ fileName +').scss');
                    var getFiles = function(fileName) {
                        var reg = new RegExp('(\'|\")\\s*' + fileName.slice(1) + '\\s*(\'|\")');
                        files.forEach(function(filePath) {
                            var _fileName = path.basename(filePath, '.scss');
                            // 处理所有包括当前'_base'的scss
                            oFileCache[filePath] = oFileCache[filePath] || 
                                                    fs.readFileSync(filePath).toString();
                            if (reg.test(oFileCache[filePath])) {
                                if (_fileName[0] != '_') {
                                    _oFiles[filePath] = 1;
                                } else{
                                    getFiles(_fileName);
                                }
                            };
                        });
                    }
                    getFiles(fileName);
                    
                    // 清空缓存内容
                    delete oFileCache;
                }

                // console.log(_oFiles);
                // return false;
                for (p in _oFiles) {
                    if (_oFiles.hasOwnProperty(p)) {
                        scss(p);
                    }
                }

            } else if ({".png": 1, ".gif": 1, ".jpg": 1, ".jpeg": 1}[file.extname]) {
                var tag = path.basename(file.dirname)[0];
                if (tag != '_') {
                    gulp.src(file.path, {
                            base: src
                        })                    
                        .pipe($.changed(dist))
                        .pipe($.imagemin(configs.imagemin))
                        .pipe(gulp.dest(dist))
                        .pipe(message('复制并压缩'));
                } else {
                    sprites(file.dirname);
                }
            } else if (file.extname == '.svg') {
                var tag = path.basename(file.dirname)[0];
                if (tag != '_') {
                    gulp.src(file.path, {
                            base: src
                        })                    
                        .pipe($.changed(dist))
                        .pipe(gulp.dest(dist))
                        .pipe(message('复制'));
                } else {
                    fonts(file.dirname);
                }
            } else if (file.extname == '.js') {
                var tag = path.basename(file.dirname)[0];
                if (tag != '_') {
                    JS(file.path);
                } else {
                    concatJS(file.dirname);
                }
            } else if ({".html": 1, ".htm": 1}[file.extname]) {
                var fileName = file.stem;
                // 所有文件
                var files = $.glob.sync(src + '/**/*.{html,htm}');
                // 要处理的文件
                var _oFiles = {}; 
                // 文件内容缓存
                var oFileCache = {}; 
                // 加入当前的文件
                if (fileName.slice(0, 1) != '_') {
                    _oFiles[file.path] = 1;
                };

                var getFiles = function(fileName, ofilePath) {
                    var reg = new RegExp("(extends|include|import)\\s+(\'|\")\\S*"+ fileName +".(html\'|htm\")");

                    files.forEach(function(filePath) {
                        var _fileName = path.basename(filePath, '.html');
                        // 缓存内容
                        oFileCache[filePath] = oFileCache[filePath] || 
                                                fs.readFileSync(filePath).toString();
                        if (reg.test(oFileCache[filePath])) {
                            // 如果包含指定文件，加入要处理的列表
                            if (_fileName.slice(0, 1) != '_') {
                                _oFiles[filePath] = 1;
                            };
                            // 继续遍历，当前文件
                            getFiles(_fileName, filePath);
                            // 原来的文件又被包含，delete掉，直到顶级文件
                            // delete _oFiles[ofilePath];
                        }
                    });
                }

                getFiles(fileName);

                // 清空缓存内容
                delete oFileCache;

                // console.log(_oFiles);
                // return false;
                // 最后处理模板
                for (p in _oFiles) {
                    if (_oFiles.hasOwnProperty(p)) {
                        gulp.src(p, {
                                base: src
                            })
                            // .pipe($.changed(dist))
                            .pipe($.plumber())
                            .pipe($.data(tplData))
                            .pipe($.swig({ext: '.html'}))
                            .pipe($.if(argv.charset == 'gbk', $.convertEncoding({
                                to: 'gbk'
                            })))
                            .pipe(gulp.dest(dist))
                            .pipe(utils.browserSync.stream())
                            .pipe(message());
                    }
                }
            }/* else {
                gulp.src(file.path, {
                        base: config.src
                    })
                    .pipe($.changed(dist))
                    .pipe(gulp.dest(dist))
                    .pipe(message('直接复制'));
            }*/
        });
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
            .pipe($.plumber())
            .pipe($.imagemin(configs.imagemin))
            .pipe(gulp.dest(proDist)));
        // 处理html
        stream.add(gulp.src(proSrc + '/**/demo*.html', {base: proSrc })
            .pipe($.plumber())
            .pipe($.data(tplData))
            .pipe($.swig())
            .pipe(gulp.dest(proDist)));
            // return false;
        // 处理正常的js
        stream.add(buildCB(JS,  $.glob.sync(proSrc + '/**/js/*.js').concat($.glob.sync(proSrc + '/**/js/!(_*|static*)/*.js')), cb));
        // 处理其它 以及第三方js
        stream.add(gulp.src([proSrc + '/**/static/*.*', '!' + proSrc + '/**/static/*.scss'], {base: proSrc })
            .pipe(gulp.dest(proDist)));
        
        // stream.add(gulp.src(proSrc + '/**/*.swf', {base: proSrc })
        //     .pipe(gulp.dest(proDist)));

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
                CWD + 'src/libs/**/{static,common,plugin,units,demo}',
                CWD + 'src/libs/**/{demo,s}.*'
            ], {base: CWD + 'src/libs/'})
            .pipe(gulp.dest(config.src + '/' + argv.n));
    })
    // clean
    gulp.task('clean', ['init'], function(cb) {
        // console.log(config.path);
        // return false;
        $.del([
            config.path + '/**',
            '!' + config.path,
            '!' + config.path + '/src/**'
        ], {
            force: true
        }, cb);
    });
    // php copy
    gulp.task('php-copy', function(cb) {
        argv.path = argv.path || 'E:/wwwroot/newcore';
        var _path = argv.path.normal() + '/';
        console.log('执行' + 'php ' + _path + 'app/console assets:install ' + _path + 'web');
        return require('child_process').exec('php ' + _path + 'app/console assets:install ' + _path + 'web');
    });

    gulp.task('sync', ['init'], function() {
        if (!_base.data) {
            console.log('没有配置');
            return;
        }
        var aPaths = config.path.split(',');
        aPaths.forEach(function(p) {
            var _data = _base.data
            var _cfg = _data[p];
            var _src = path.join(p, _cfg.dist, './**/*');
            var _dist = _cfg.distEx;

            // console.log(_src, _dist);
            // return false;
            if (_dist) {
                gulp.src(_src, {
                        // base: _src
                    })
                    .pipe($.changed(_dist))
                    .pipe(gulp.dest(_dist));
            }
        });
    });

    gulp.task('sync-ats', function() {
        var _dist = 'E:/wwwroot/ats08';
        gulp.src([
            'E:/nodejs/**/*', 
            'E:/nodejs/.gitignore', 
            '!E:/nodejs/{node_modules,.git}/**/*',
            '!E:/nodejs/node_modules'
            ], {
                // base: _src
            })
            .pipe($.changed(_dist))
            .pipe(gulp.dest(_dist));
    });
};