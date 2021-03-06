module.exports = function(gulp, $, utils, configs) {
    // base
    var path  = require('path'),
        fs         = require('fs-extra'),
        argv       = $.yargs.argv,
        CWD        = process.cwd() + '/',
        SOURCEURL  = path.join(CWD, './tpl/'),
        
        sign       = {
        img        : 'img',
        font       : 'font'
        },
        ftp        = {},
        isBuild    = false,
        oInit      = require('../lib/init')($, argv),
        isMultiple = oInit.isMultiple, // 多目录
        cfgs       = oInit.configs,
        oTasks     = {};

    // 默认项
    argv.d = argv.d === 0 ? false : true;
    // 初始化swig
    $.swig(configs.swig);
    // 扩展fs方法
    fs.removeGlobSync = function(glob) {
        var files = Array.isArray(glob) ? glob : $.glob.sync(glob);
        files.forEach(function(file) {
            if (fs.existsSync(file)) {
                fs.removeSync(file);
                console.log(file + '  deleted!');
            }
        });
    }

    var message = function (msg) {
            return $.notify(function(file) {
                // 不是整站打包 或者 新建项目
                if (!isBuild || argv.all) {
                    return  file.path + ' ' + (msg || '') + ' ok !';
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
        var cfg = getCfgProp(filePath);
        var dist = cfg.dist;
        var src = cfg.src;
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
            var cfg = getCfgProp(file.path)
            var src = cfg.src;
            // src文件到src = dist文件到dist
            var pathRelative = path.relative(path.dirname(file.path), src);
            var pathRelative1 = path.relative(src, file.path);
            // console.log(config.distEx ? '/' : config.rPath);
            return {
                name   : path.basename(file.path, path.extname(file.path)),
                author : cfg.author,
                base   : path.join(pathRelative, cfg.libs)
                            .normal() + '/',
                path   : path.join(cfg.mode == 4 ? 'test/' : '', pathRelative1)
                            .normal(),
                rPath  : getRpath(file.path),
                info   : require('../lib/tasks-info'),
            }
        }
    // gulpMiddleWare
    var gulpMiddleWare = function(stream, filePath) {
        var dist = getCfgProp(filePath, 'dist');
        var s;

        s = stream.pipe($.if(argv.charset == 'gbk', $.convertEncoding({
                to: 'gbk'
            })))
            .pipe($.if(argv.d, sourcemaps(filePath)))

            .pipe($.if(!argv.s, $.through2.obj(function(file2, encoding, done) {
                var cfg = getCfgProp(filePath)
                // 处理sourcemap
                if (/\.(js|css|scss|ts|vue)$/.test(file2.path)) {
                    var relPath = 'http://localhost:8888/' + 
                                    path.relative(cfg.src, path.dirname(filePath))
                                    .normal() + '/';
                    var newContents = file2.contents
                                        .toString().replace(/(sourceMappingURL=)/, '$1' + relPath);
                    file2.contents = new Buffer(newContents);   
                };           
                this.push(file2);
                done();
            })))
            .pipe(gulp.dest(dist))
            .pipe($.through2.obj(function(file, encoding, done) {
                if (path.extname(file.path) != '.map') {
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
    oTasks.sprites = function(dir, cb) {
        var cfg = getCfgProp(dir);
        var src = cfg.src;
        var dist = cfg.dist;

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

    oTasks.fonts = function(dir, cb) {
        var cfg = getCfgProp(dir);
        var src = cfg.src;
        var dist = cfg.dist;

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
                formats: ['eot', 'woff', 'svg'], // default, 'woff2' and 'svg' are available
                normalize: true, // 兼容不同大小的字体图标合成
                // fontHeight: 32,
                fontHeight: 1001,
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
            // 两次压缩svg
            /*.pipe($.if(function(file) {
                return path.extname(file.path) == '.svg';
            }, $.imagemin(configs.imagemin)))*/
            .pipe(gulp.dest(dist))
            .pipe(message('font 生成'));
            stream.add(stream1)
        return stream;
    }
    // scss
    oTasks.scss = function(filePath, cb) {
        var cfg = getCfgProp(filePath);
        var src = cfg.src;

        // var scssPaths = [path.dirname(filePath)];
        var scssPaths = [];
        if (cfg.scssPaths) {
            cfg.scssPaths.split(',').forEach(function(p) {
                scssPaths.push(p);
            })
        };
        
        scssPaths.push(cfg.tpl + cfg.libs + '/css/');

        var stream = gulp.src(filePath, {base: src})
            // .pipe($.changed(cfg.dist, {extension: '.css'}))
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            .pipe($.sass({
                includePaths: scssPaths,
                indentWidth: 4,
                // includePaths: [path.dirname(filePath), cfg.tpl + cfg.libs + '/css/'],
                outputStyle: 'expanded',
                //Type: String Default: nested Values: nested, expanded, compact - 属性在一行, compressed
                // sourceMap: true
            }).on('error', $.sass.logError))
            .pipe($.swig({
                data: {
                    name: path.basename(filePath, path.extname(filePath)),
                    author: cfg.author
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
                /*if (file1.sourceMap) {
                    $.vinylSourcemapsApply(file1, file1.sourceMap);
                }*/
                this.push(file1);
                done();
            })))
            .pipe($.if(!argv.d,
                // $.csscomb('../lib/csscomb.json'),
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
    oTasks.concatJS = function(dir, cb) {
        var cfg = getCfgProp(dir);
        var src = cfg.src;

        var pathRelative = path.relative(src, dir).replace('_', '');
            // fName        = path.basename(dir).slice(1);
        // 按首数字排序
        var aFiles = $.glob.sync(dir + '/*.js').sortByPreNumbers();
        // var stream = gulp.src(dir + '/*.js', {base: src })
        var stream = gulp.src(aFiles, {base: src })
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            .pipe($.if(argv.j, $.jshint(configs.jshint)))
            .pipe($.if(argv.j, $.jshint.reporter()))
            .pipe($.data(function(file) {
                return {
                    name   : path.basename(file.path).slice(0, -3),
                    author : cfg.author,
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
        
        // cb && cb();
        return gulpMiddleWare(stream, dir);
    }

    // js
    oTasks.JS = function(filePath, cb) {
        var cfg = getCfgProp(filePath);
        var src = cfg.src;
        var dist = cfg.dist;

        var stream = gulp.src(filePath, {base: src})
            // build时全部生成
            .pipe($.changed(dist))
            .pipe($.plumber())
            .pipe($.if(argv.d, $.sourcemaps.init()))
            .pipe($.if(argv.j, $.jshint(configs.jshint)))
            .pipe($.if(argv.j, $.jshint.reporter()))
            .pipe($.data(tplData))
            .pipe($.swig({ext: '.js'}))
            .pipe($.if(function(file1) {
                return utils.inArray('babel', utils.getRequires(file1.contents));
            }, $.babel({
                presets: ['babel-preset-env'].map(require.resolve)
            })))
            // .pipe($.through2.obj(function(file2, encoding, done) {
            //     console.log(file2.contents.toString());
            // }))
            .pipe($.if(!argv.d, $.uglify(configs.uglify)))
        
        // cb && cb();

        return gulpMiddleWare(stream, filePath);
    }
    // html
    oTasks.html = function(filePath) {
        var cfg = getCfgProp(filePath);
        var src = cfg.src;
        var dist = cfg.dist;

        return gulp.src(filePath, {
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
    // image
    oTasks.image = function(filePath) {
        var cfg = getCfgProp(filePath);
        var src = cfg.src;
        var dist = cfg.dist;

        return gulp.src(filePath, {
                base: src
            })                    
            .pipe($.changed(dist))
            .pipe($.imagemin(configs.imagemin))
            .pipe(gulp.dest(dist))
            .pipe(message('复制并压缩'));
    }
    oTasks.ts = function(filePath) {
        var cfg = getCfgProp(filePath);
        var src = cfg.src;
        var dist = cfg.dist;

        return gulp.src(filePath, {
                base: src
            })
            .pipe($.plumber())
            .pipe($.typescript({
                isolatedModules: true,
                noImplicitAny: false,
            }))
            .pipe($.rename({extname: '.js'}))
            .pipe($.if(function(file1) {
                return utils.inArray('babel', utils.getRequires(file1.contents));
            }, $.babel({
                presets: ['babel-preset-env'].map(require.resolve)
            })))
            .pipe(gulp.dest(dist))
            .pipe(message('ts!'));
    }
    oTasks.concatTs = function(dir) {
        var cfg = getCfgProp(dir);
        var src = cfg.src;
        var dist = cfg.dist;
        var pathRelative = path.relative(src, dir).replace('_', '');
        // scss

        return gulp.src(dir + '/*.ts', {
                base: src
            })
            .pipe($.plumber())
            .pipe($.typescript({
                isolatedModules: true,
                noImplicitAny: false,
            }))
            .pipe($.rename(pathRelative + '.js'))
            .pipe($.if(function(file1) {
                return utils.inArray('babel', utils.getRequires(file1.contents));
            }, $.babel({
                presets: ['babel-preset-env'].map(require.resolve)
            })))
            .pipe(gulp.dest(dist))
            .pipe(message('ts!'));
    }
    oTasks.vue = function(filePath) {
        var cfg = getCfgProp(filePath);
        var src = cfg.src;
        var dist = cfg.dist;

        return gulp.src(filePath, {
                base: src
            })
            .pipe($.plumber())
            .pipe($.vueModule2({
                CWD                : CWD,
                debug              : false,            // Debug mode
                amd                : true,            // AMD style, Define module name and deps
                define             : true,             // Using define() wrapper the module, false for Node.js (CommonJS style)
                defineName         : true,            // Define the module name
                indent             : '    ',           // Indent whitespace
                headerComment      : true,             // Using <header-comment> Insert the header comments
                loadCSSMethod      : '$.loadCSS' // define the load css method for require
            }))
            .pipe($.rename({extname: '.js'}))
            .pipe($.if(function(file1) {
                return utils.inArray('babel', utils.getRequires(file1.contents));
            }, $.babel({
                presets: ['babel-preset-env'].map(require.resolve)
            })))
            .pipe(gulp.dest(dist))
            .pipe(message('vueify!'));
    }
    oTasks.concatVue = function(dir) {
        var cfg = getCfgProp(dir);
        var src = cfg.src;
        var dist = cfg.dist;
        var pathRelative = path.relative(src, dir).replace('_', '');
        // scss

        return gulp.src(dir + '/*.vue', {
                base: src
            })
            .pipe($.plumber())
            .pipe($.vueModule2({
                CWD                : CWD,
                debug              : false,            // Debug mode
                amd                : true,            // AMD style, Define module name and deps
                define             : true,             // Using define() wrapper the module, false for Node.js (CommonJS style)
                defineName         : true,            // Define the module name
                indent             : '    ',           // Indent whitespace
                headerComment      : true,             // Using <header-comment> Insert the header comments
                loadCSSMethod      : '$.loadCSS' // define the load css method for require
            }))
            .pipe($.rename(pathRelative + '.js'))
            .pipe($.if(function(file1) {
                return utils.inArray('babel', utils.getRequires(file1.contents));
            }, $.babel({
                presets: ['babel-preset-env'].map(require.resolve)
            })))
            .pipe(gulp.dest(dist))
            .pipe(message('vueify!'));
    }
    /**
     * getCfgProp
     * @description 获取对应配置的属性，主要处理多目录监控里的目录
     * @param  {String} file 文件路径或目录
     * @param  {String} [key=dist]  要获取配置的key， `dist` `src` `path` `distEx` `mode`
     * @return {String}      返回配置对应value, key为空时返回整个配置
     */
    var getCfgProp = function(file, key) {
        var prop; 
        for (p in cfgs) {
            // 当前文件的path 与其配置里相同时
            if (path.normalize(file).normal().indexOf(p.normal()) == 0) {
                if (key) {
                    prop = cfgs[p][key];
                } else {
                    prop = cfgs[p]
                }
            }
        }
        return prop;
    }
    /**
     * 生成监听字串
     * @param  {String} str   要监听的字串
     * @param  {String} dir   要监听的相对目录
     * @param  {String} noStr 要排除的字串，不需要监听的
     * @return {String}       返回完整的字串
     * @example
     * getWatchDir('**\/*', 'dist', '*.html') // [ 'C:\\Users\\Administrator\\Desktop\\test/**\/*',  ]
     *
     */
    var getWatchDir = function(str, dir, noStr) {
        var dir = dir || 'src';
        var aWatchDir = [];
        var aWatchDirNo = [];
        for (p in cfgs) {
            var curConfig = cfgs[p];
            aWatchDir.push(path.join(curConfig[dir], str));
            if (noStr) {
                aWatchDirNo.push(path.join('!' + curConfig[dir], noStr));
                // 排除掉src
                aWatchDirNo.push(path.join('!' + curConfig[dir], '/src/**/*'));
            }
        }

        return aWatchDir.concat(aWatchDirNo);
    }
    // 转化后dist目录，相对目录
    var getRpath = function(file) {
        var rPath;
        for (p in cfgs) {
            // 当前文件路径 和 p 相等
            if (path.normalize(file).normal().indexOf(p.normal()) == 0) {
                var curConfig = cfgs[p];
                rPath = curConfig.dist != curConfig.libs ?
                    path.relative(p, curConfig.dist + curConfig.libs + '/') : '';

                rPath = curConfig.distEx ? '/' : rPath;
            }
        }

        return rPath.normal() || '';
    }
    // watch

    utils.browserSync = $.browserSync.create();

    gulp.task('watch', function() {

        // 自动刷新 静态服务器使用
        if (argv.s) {
            var toolsbar = fs.readFileSync(SOURCEURL + 'html/toolsbar.html', 'utf8');
            utils.browserSync.init({
                notify: false,
                server: Object.keys(cfgs).concat([CWD + 'src/libs/css']),
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
                root: Object.keys(cfgs).concat([CWD + 'src/libs/css']),
                // index: 'a.html',
                port: 8888
            });

            console.log();
            console.log('请在要刷新的模板上加入下列代码：');
            console.log(`<script id="__bs_script__">//<![CDATA[
        document.write("<script async src='http://HOST:3000/browser-sync/browser-sync-client.js?v=2.18.12'><\/script>".replace("HOST", location.hostname));
//]]></script>`);
            console.log();
        };

        if (argv.f) {
            if (!config.ftp) {
                console.log('请先设置ftp相关配置!');
                return false;
            }
            ftp = $.ftp.create(config.ftp);
        }
        // 扩展dist 直接将生成好的文件复制过去, 排除map
        var aDist = getWatchDir('/**/*', 'dist', '/**/*.map');

        if (isMultiple || oInit.config.distEx) {
            $.watch(aDist, {
                read: false
            }, function(file) {
                var cfg = getCfgProp(file.path)

                var pathRelative = path.relative(cfg.dist, file.path);
                if (file.event == 'unlink') {
                    fs.removeGlobSync([path.join(cfg.distEx, pathRelative)]);
                    /*$.del([cfg.distEx + '/' + pathRelative], {
                        force: true
                    });*/
                } else if (cfg.distEx && path.basename(file.path) != 'config.json') {
                    // 排除程序配置文件config.json
                    gulp.src(file.path, {
                            base: cfg.dist
                        })
                        .pipe($.changed(cfg.distEx))
                        .pipe(gulp.dest(cfg.distEx))
                        .pipe(utils.browserSync.stream())
                        .pipe(message());
                }
            })
        }
        // 监控src
        $.watch(getWatchDir('/**/*.{js,scss,css,gif,jpg,jpeg,png,html,htm,svg,vue,ts}'), {
            read: false,
            usePolling: true
        }, function(file) {
            var cfg         = getCfgProp(file.path);
            var dist        = cfg.dist;
            var src         = cfg.src;
            var ext         = file.extname;
            // _common
            var baseDirname = path.basename(file.dirname);
            var isDir = baseDirname[0] == '_' ;
            // 处理扩展src 同步更新
            if (cfg.srcEx) {
                gulp.src(file.path, {
                        base: cfg.src
                    })
                    .pipe($.changed(cfg.srcEx))
                    .pipe(gulp.dest(cfg.srcEx))
                    .pipe(utils.browserSync.stream())
                    .pipe(message());
            }

            if (file.event == 'unlink') {
                // src/js/a.js
                var srcFile   = ext == '.scss' ? 
                                    path.basename(file.path, ext) + '.css' : 
                                    file.path;
                // 相对src的filepath  js/a.js                 
                var srcToFile = path.relative(src, srcFile);
                // 目标文件路径 dist/js/a.js
                var distFile  = path.join(dist, srcToFile); 
                var delFile   = [distFile];

                if (/\.(scss|js)$/.test(ext)) {
                    // 同时删除map文件
                    delFile.push(distFile + '.map');
                } else if (ext == '.svg') {
                    // 如果是删除小图片，需要重新合并其它图片
                    if (isDir) {
                        oTasks.fonts(file.dirname);
                    }
                } else if (/\.(png|gif|jpe?g)$/.test(ext)) {
                    // 如果是删除小图片，需要重新合并其它图片
                    if (isDir) {
                        oTasks.sprites(file.dirname);
                    }
                }

                /*$.del.sync(delFile, {
                    force: true
                });*/
                fs.removeGlobSync(delFile)
                // dist目录 dist/js/_common
                // dist目录 dist/images/_common
                var fDirname = path.dirname(distFile);

                if (isDir) {
                    // 删除合并的js,images,fonts及map
                    // [js/_common/a.js, js/_common/b.js]
                    var hasFile = $.glob.sync(file.dirname + '/**/*').length;

                    if (!hasFile) {
                        fDirname = fDirname.replace('_', '');
                        fs.removeGlobSync(fDirname + '.*');
                        /*$.del.sync([fDirname + '.*', oDirname + '.js.map'], {
                            force: true
                        })*/
 
                    }
                } else {
                    // 删除文件夹 dist/iamges/face/1.gif, dist/iamges/face/2.gif,
                    // fDirname = dist/images/face
                    var hasFile = $.glob.sync(fDirname + '/**/*').length;
                    if (!hasFile) {
                        fs.removeGlobSync([fDirname])
                        /*$.del.sync([fDirname], {
                            force: true
                        })*/
                    }
                }

                // 同步删除srcEx对应的文件
                if (cfg.srcEx) {
                    fs.removeGlobSync([path.join(cfg.srcEx, path.relative(cfg.src, file.path))])
                }
            } else if (/\.(vue)$/.test(ext)) {
                if (isDir) {
                    oTasks.concatVue(file.dirname);
                } else {
                    oTasks.vue(file.path);
                }
            } else if (/\.(ts)$/.test(ext)) {
                if (isDir) {
                    oTasks.concatTs(file.dirname);
                } else {
                    oTasks.ts(file.path);
                }
            } else if (/\.(png|gif|jpe?g)$/.test(ext)) {
                if (isDir) {
                    oTasks.sprites(file.dirname);
                } else {
                    oTasks.image(file.path);
                }
            } else if (ext == '.svg') {
                if (isDir) {
                    oTasks.fonts(file.dirname);
                } else {
                    oTasks.image(file.path);
                }
            } else if (ext == '.js') {
                if (isDir) {
                    oTasks.concatJS(file.dirname);
                } else {
                    oTasks.JS(file.path);
                }
            } else if (/\.(html?|twig|scss)$/.test(ext)) {
                var fileName = file.stem;
                // 要处理的文件
                var _oFiles = {}; 
                var _oOldFiles = {}; 
                // 文件内容缓存
                var oFileCache = {}; 
                // 加入当前的文件
                if (fileName[0] != '_') {
                    _oFiles[file.path] = 1;
                } else {
                    // 所有文件
                    if (ext == '.scss') {
                        var files = $.glob.sync(src + '/**/css/**/!('+ fileName +').scss');
                    } else {
                        var files = $.glob.sync(src + '/**/*.{html,htm,twig}');
                    }
                    var getFiles = function(fileName, ofilePath) {
                        if (ext == '.scss') {
                            var reg = new RegExp("@import\\s+(\'|\")\\s*" + fileName.slice(1) + "\\s*(\'|\")");
                        } else {
                            var reg = new RegExp("(extends|include|import)\\s+(\'|\")(.*\\/)?" + fileName + "\\.");
                        }

                        files.forEach(function(filePath) {
                            // 假如当前文件已经在处理的文件里时返回
                            if (_oFiles[filePath]) return;

                            var _fileName = path.basename(filePath, ext);
                            // 缓存内容
                            oFileCache[filePath] = oFileCache[filePath] || 
                                                    fs.readFileSync(filePath, 'utf8');
                            if (reg.test(oFileCache[filePath])) {
                                // 如果包含指定文件，加入要处理的列表
                                if (_fileName[0] != '_') {
                                    _oFiles[filePath] = 1;
                                }
                                // b.html extend a.html exend _base.html a和b都会找到
                                // a.scss @import b.scss @import _base.scss a和b都会找到
                                // 继续找包含当前文件的其它文件
                                getFiles(_fileName, filePath);
                                // 原来的文件又被包含，delete掉，直到顶级文件
                                // delete _oFiles[ofilePath];
                            };

                        });
                    }
                    // 如果包含的层次太多时，就不会执行了
                    try {
                        getFiles(fileName);
                    } catch (err) {
                        console.warn(/Maximum/.test(err) && fileName + '被包含的太多或者层级太深!');
                    }

                    // 清空缓存内容
                    delete oFileCache;
                }

                // console.log(_oFiles);
                // return false;
                // 最后处理模板
                for (p in _oFiles) {
                    oTasks[ext == '.scss' ? 'scss' : 'html'](p);
                }
            }
        });
    });
    // build
    gulp.task('build', [
        'copy',
        'pack:sprites-font-js-html',
        'pack:scss'
    ], function() {
        console.log('Build ok!');
    });
    // 复制核心到项目
    gulp.task('copy', function (cb) {
        var stream = $.mergeStream();
        var _copy = function(config) {
            var atsSrc = config.tpl; // e:/nodejs/src/libs/
            var proSrc = config.src; // e:/src/
            var atsFromSrc = path.join(atsSrc, (argv.m == 2 || atsSrc, argv.m == 21) ? config.libs : '');

            // 只重建核心
            isBuild = true;

            if (config.mode == 4) {
                // 如果是核心开发，不复制直接处理代码
                cb();
            } else if (!argv.all) {
                // 只同步项目和核心存在的文件（如果项目已经删除，则不同步）项目录里与核心目录比较
                var atsFromData = $.glob.sync(atsFromSrc + '/**/*'); // ['e:/nodejs/src/libs/js/a.js']
                var proSrcData = $.glob.sync(proSrc + '/**/*'); // ['e:/src/js/a.js']
                stream.add(gulp.src('./src/libs/demo.html'));
                // console.log(proSrcData);
                atsFromData.forEach(function(from) {
                    proSrcData.forEach(function(pro) {
                        // 项目录里与核心目录比较，存在的文件再同步
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

            } else if (argv.all) {
                // 强制覆盖核心文件
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
                stream.add(gulp.src(sss, {
                        base: atsSrc
                    })
                    .pipe($.changed(proSrc))
                    .pipe($.if(utils.hasProp(['_variables.scss', '_utilities.scss', 'ats.scss']), $.rename({
                        suffix: '_demo'
                    })))
                    .pipe(gulp.dest(proSrc)));
            }
        }

        for (p in cfgs) {
            _copy(cfgs[p])
        }

        return stream;
    });
    // 打包
    gulp.task('pack:sprites-font-js-html', ['copy'], function(cb) {
        var stream = $.mergeStream();
        var _pack = function(config) {
            var proSrc = config.src;
            var proDist = config.dist;
            var oFiles = {};
            oTasks.copy = function(file) {
                return gulp.src(file, {
                    base: proSrc
                })
                // .pipe($.changed(proSrc))
                .pipe(gulp.dest(proDist))
                .pipe(message('copyed!'));
            }

            var files = $.glob.sync(path.join(proSrc, '/**/*.{gif,jpg,jpeg,png,svg,html,htm,js,vue,swf}'));
            // 先整理
            files.forEach(function(file) {
                var fileName = path.basename(file);
                var dirName = path.dirname(file);
                var dirNameBase = path.basename(dirName);

                if (dirNameBase == 'static' || /\.swf$/.test(file)) {
                        oFiles[file] = 'copy';
                } else if (/\.vue$/.test(file)) {
                    if (dirNameBase[0] != '_') {
                    // 单个文件
                        oFiles[file] = 'vue';
                    } else if (!utils.inArray(dirName, oFiles.fonts)) {
                    // 合并
                        oFiles[dirName] = 'concatVue';
                    }
                } else if (/\.svg$/.test(file)) {
                    if (dirNameBase[0] != '_') {
                    // 单个文件
                        oFiles[file] = 'image';
                    } else if (!utils.inArray(dirName, oFiles.fonts)) {
                    // 合并
                        oFiles[dirName] = 'fonts';
                    }
                } else if (/\.(gif|jpe?g|png)$/.test(file)) {
                    if (dirNameBase[0] != '_') {
                    // 单个文件
                        oFiles[file] = 'image';
                    } else if (!utils.inArray(dirName, oFiles.sprites)) {
                    // 合并
                        oFiles[dirName] = 'sprites';
                    }
                } else if (/\.js$/.test(file)) {

                    if (dirNameBase[0] != '_') {
                    // 单个文件
                        oFiles[file] = 'JS';
                    } else if (!utils.inArray(dirName, oFiles.concatJS)) {
                    // 合并
                        oFiles[dirName] = 'concatJS';
                    }
                } else if (/\.(html?|twig)$/.test(file)) {
                    if (fileName[0] != '_') {
                    // 单个文件
                        oFiles[file] = 'html';
                    }
                }
            });
            // 再处理
            for (p in oFiles) {
                var res = (oTasks[oFiles[p]])(p);
                // if (/fonts|sprites|copy/.test(oFiles[p])) {
                    stream.add(res);
                // };
            }
        }

        for (p in cfgs) {
            _pack(cfgs[p])
        }

        return stream;
    });
    // 打包scss
    gulp.task('pack:scss', ['pack:sprites-font-js-html'], function(cb) {
        var stream = $.mergeStream();
        var _pack = function(config) {
            var proSrc = config.src;

            var files = $.glob.sync(path.join(proSrc, '/**/*.scss'));

            files.forEach(function(file) {
                var fileName = path.basename(file);
                
                if (fileName[0] != '_') {
                // 单个文件
                    stream.add(oTasks.scss(file));
                }
            });
        }

        for (p in cfgs) {
            _pack(cfgs[p])
        }

        return stream;
    });
    // add
    gulp.task('add', function() {
        // return false;
        return gulp.src([
                CWD + 'src/libs/**/{static,common,plugin,units,demo}',
                CWD + 'src/libs/**/{demo,s}.*'
            ], {base: CWD + 'src/libs/'})
            .pipe(gulp.dest(config.src + '/' + argv.n));
    })
    // clean
    gulp.task('clean', function(cb) {
        // console.log(config.path);
        // return false;
        for (p in cfgs) {
            $.del([
                p + '/**',
                '!' + p,
                '!' + p + '/src/**'
            ], {
                force: true
            }, cb);
        }
    });

    gulp.task('sync', function() {
        for (p in cfgs) {
            var _cfg = cfgs[p];
            var _src = path.join(_cfg.dist, './**/*');
            var _dist = _cfg.distEx;

            if (_dist) {
                gulp.src(_src)
                    .pipe($.changed(_dist))
                    .pipe(gulp.dest(_dist));
            }
        }
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