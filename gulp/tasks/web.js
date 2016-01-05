module.exports = function(gulp, $) {
    // banner
    var path = require('path'),
            jsonFile     = require('json-file-plus'),
            del          = require('del'),
            extend       = require('node.extend'),
            concatStream = require('concat-stream'),
            argv         = require('yargs').argv,
            async        = require('async'),
            jshintConfig = {
            bitwise       : false, //禁用位运算符，位运算符在 js 中使用较少，经常是把 && 错输成 &
            curly         : false, //循环或者条件语句必须使用花括号包围
            camelcase     : true, // 使用驼峰命名(camelCase)或全大写下划线命名(UPPER_CASE)
            eqeqeq        : false, //强制使用三等号
            indent        : 4,// 代码缩进
            latedef       : 'nofunc', // 禁止定义之前使用变量，忽略 function 函数声明
            newcap        : true, // 构造器函数首字母大写
            quotmark      : true, // 为 true 时，禁止单引号和双引号混用
            undef         : true, // 变量未定义
            unused        : true, // 变量未使用
            strict        : false, // 严格模式
            maxparams     : 4, //最多参数个数
            immed         : true, 
            //匿名函数调用必须 (function() { // body }()); 而不是 (function() { // body })();
            maxdepth      : 4, //最大嵌套深度
            maxcomplexity : 4, // 复杂度检测
            maxlen        : 100, // 最大行数
            asi           : false,
            boss          : true, //控制“缺少分号”的警告
            lastsemic     : true, // 检查一行代码最后声明后面的分号是否遗漏
            laxcomma      : true, //检查不安全的折行，忽略逗号在最前面的编程风格
            loopfunc      : true, //检查循环内嵌套 function
            multistr      : true, // 检查多行字符串
            notypeof      : true, // 检查无效的 typeof 操作符值
            sub           : true, // person['name'] vs. person.name
            supernew      : true, // new function () { ... } 和 new Object ;
            validthis     : true, // 在非构造器函数中使用 this 
            node          : true,
            jquery        : true,
            globals: {
                seajs   : false,
                uri2MVC : false
            }
        },
        uglifyConfig = {
            compress: {
                loops         : true, //优化循环
                sequences     : true, //连续使用多个逗号
                if_return     : true, //优化if else
                unused        : true, //删除没使用的变量、函数
                evaluate      : true, //优化常量表达式
                hoist_funs    : true, //函数声明至于顶端
                comparisons   : true, //优化逻辑操作符
                hoist_vars    : true, //变量声明至于顶端
                conditionals  : true, //优化条件表达式(转换成二元)
                dead_code     : true, //删除运行不到的代码
                booleans      : true, //优化布尔表达式
                // source_map : true,//source_map
                properties    : false, //类似a["foo"] 智能优化为 a.foo
                unsafe        : false, //不安全的优化
                join_vars     : true //合并多个变量声明
            },
            mangle: {
                except: ['$', 'require', 'exports']
            }
        },
        imageminConfig = {
            optimizationLevel : 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive       : true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced        : true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass         : true //类型：Boolean 默认：false 多次优化svg直到完全优化
        },
        config,
        message = function (info) {
            return $.notify(function(file) {
                return path.relative(config.path, file.path) + ' ' + info + ' ok !';
            })
        };

    argv.d = argv.d === 0 ? false : true;

    gulp.task('init', function(cb) {
        var base = jsonFile.sync('./gulp/base.json'),
        baseConfig = base.data.web;

        config = extend(baseConfig, {
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

            $.watch(config.path + '/**/*.html', function () {
                gulp.src(config.path + '/**/*.html', {read: false})
                    .pipe(gulp.dest(config.path))
                    .pipe($.livereload())
                    .pipe(message('livereload'));
            });
        }
        // images
        $.watch([config.src + '/**/images/*.{png,gif,jpg,jpeg}'], function(file) {
            if (file.event == 'unlink') {
                var pathRelative = path.relative(config.src, file.path);
                del([config.path + '/' + pathRelative], {force: true});
            } else {
                gulp.src(file.path, {base: config.src})
                    .pipe($.imagemin(imageminConfig))
                    .pipe(gulp.dest(config.path))
                    .pipe(message('复制并压缩'));
            }
        });
        // sprites
        $.watch(config.src + '/**/images/*/*.{png,gif,jpg,jpeg}', function(file) {

            var pathRelative = path.relative(config.src, file.dirname),
                sName = path.basename(file.dirname),
                cssPath = path.join(pathRelative, '../../css/img/' + sName + '.scss');

            var spriteData = gulp.src(file.dirname + '/*.{png,gif,jpg,jpeg}')
                .pipe($.spritesmith({
                    imgName: pathRelative + '.png',
                    cssName: 'sprite.json',
                    // cssName: path.join(file.dirname, '../../css/img/' + sName + '.scss'),
                    padding: 10
                }))

            gulp.src('./gulp/css/images.scss', {base: './gulp/css/'})
                .pipe($.data(function(file, cb) {
                    spriteData.css.pipe(concatStream(function(jsonArr) {
                        // console.log(JSON.parse(jsonArr[0].contents));
                        cb(undefined, {
                            glyphs: JSON.parse(jsonArr[0].contents),
                            imgPath: '../images/' + sName + '.png',
                            sName: sName,
                            prefix: 'img'
                        });
                    }));
                }))
                .pipe($.template())
                .pipe($.rename(cssPath))
                .pipe(gulp.dest(config.src))
                .pipe(message('sprites scss 生成'));

            spriteData.img
                .pipe(gulp.dest(config.path))
                .pipe(message('sprites img 生成'));
        });
        // fonts
        $.watch(config.src + '/**/fonts/*/*.svg', function(file) {
            var pathRelative = path.relative(config.src, file.dirname),
                    sName = path.basename(file.dirname),
                    cssPath = path.join(file.dirname, '../../css/font/');
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
                    gulp.src('./gulp/css/fonts.scss')
                        .pipe($.template({
                            glyphs: glyphs,
                            fontPath: '../fonts/',
                            sName: sName,
                            prefix: 'font'
                        }))
                        .pipe($.rename(sName + '.scss'))
                        .pipe(gulp.dest(cssPath))
                        .pipe(message('font scss 生成'));
                })
                // .pipe($.plumber())
                .pipe(gulp.dest(config.path))
                .pipe(message('font 生成'));
        });
        // scss
        $.watch([config.src + '/**/css/*.scss'], function (file) {
            if (file.event == 'unlink') {
                var pathRelative = path.relative(config.src, file.path.replace(/.scss/,'.css'));
                del([config.path + '/' + pathRelative], {force: true});
            } else {
                gulp.src(file.path, {base: config.src})
                    .pipe($.plumber())
                    .pipe($.if(argv.d, $.sourcemaps.init()))
                    .pipe($.sass({
                        outputStyle: 'nested', 
                        //Type: String Default: nested Values: nested, expanded, compact, compressed
                        sourceMap: true
                    }).on('error', $.sass.logError))
                    .pipe($.autoprefixer({
                        browsers: ['ff >= 3','Chrome >= 20','Safari >= 4','ie >= 8'],
                        //cascade: true, 是否美化属性值 默认：true 像这样：
                        //-webkit-transform: rotate(45deg);
                        //        transform: rotate(45deg);
                        //remove:true //是否去掉不必要的前缀 默认：true 
                    }))
                    .pipe($.if(!argv.d, $.csso(), $.csscomb('./gulp/css/csscomb.json')))
                    /*.pipe($.wrap(banner, {
                        author: config.author,
                        time: $.moment().format('YYYY-MM-DD HH:mm:ss')
                    }))*/
                    .pipe($.template({
                        name: path.basename(file.path),
                        author: config.author,
                        date: $.moment().format('YYYY-MM-DD HH:mm:ss')
                    }))
                    .pipe($.convertEncoding({to: 'gbk'}))
                    .pipe(gulp.dest(config.path))
                    .pipe($.livereload())
                    .pipe(message('scss 生成'))
                    .pipe($.if(argv.d, $.sourcemaps.write('./maps', {
                        includeContent: false,
                        sourcemaps: './'
                    })));
            }
        });
        // js
        $.watch([config.src + '/**/js/*.js'], function(file) {
            if (file.event == 'unlink') {
                var pathRelative = path.relative(config.src, file.path);
                del([config.path + '/' + pathRelative], {force: true});
            } else {
                gulp.src(file.path, {base: config.src })
                    .pipe($.jshint(jshintConfig))
                    .pipe($.jshint.reporter())
                    // .pipe($.jslint())
                    // .pipe($.if(!argv.d, $.uglify(uglifyConfig)))
                    /*.pipe($.wrap(banner, {
                        author: config.author,
                        time: $.moment().format('YYYY-MM-DD HH:mm:ss')
                    }))*/
                    .pipe($.template({
                        name: path.basename(file.path),
                        author: config.author,
                        date: $.moment().format('YYYY-MM-DD HH:mm:ss')
                    }))
                    .pipe($.convertEncoding({
                        to: 'gbk'
                    }))
                    .pipe(gulp.dest(config.path))
                    .pipe(message('处理'));
            }
        });
        // concat js
        $.watch([
            config.src + '/**/js/*/*.js',
            '!' + config.src + '/**/js/{static,plugin}/*.js'
        ], function(file) {
            var fileDir = path.dirname(file.path),
            pathRelative = path.relative(config.src, fileDir);
            // return false;
            gulp.src(fileDir + '/*.js', {base: config.src })
                .pipe($.plumber())
                .pipe($.jshint(jshintConfig))
                .pipe($.jshint.reporter())
                // .pipe($.jslint())
                .pipe($.concat(pathRelative + '.js'))
                // .pipe($.uglify(uglifyConfig))
                /*.pipe($.wrap(banner, {
                    author: config.author,
                    time: $.moment().format('YYYY-MM-DD HH:mm:ss')
                }))*/
                .pipe($.template({
                    name: path.basename(file.path),
                    author: config.author,
                    date: $.moment().format('YYYY-MM-DD HH:mm:ss')
                }))
                .pipe($.convertEncoding({
                    to: 'gbk'
                }))
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
                    del([oSrc + '/' + pathRelative], {force: true});
                } else {
                    var fileExt = path.extname(file.path);
                    gulp.src(file.path, {base: config.src })
                        .pipe($.if(fileExt == '.js', $.jshint(jshintConfig)))
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
                    .pipe($.jshint(jshintConfig))
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
        gulp.src(config.tpl + '/**/*', {base: config.tpl})
            .pipe($.if(function(file) {
                        return path.extname(file.path) === '.html';
                    }, $.convertEncoding({
                        to: 'gbk'
                    }))
            )
            .pipe(gulp.dest(config.path));
        cb();
    });
    // 处理杂项可异步
    gulp.task('pack', ['copy'], function(cb) {   
        var glob = require('glob'),
            nSrc = !argv.all ? config.tpl + '/src' : config.src;

        // 处理自定义的img
        gulp.src([nSrc + '/**/images/*.{png,gif,jpg,jpeg}'], {base: nSrc})
            .pipe($.imagemin(imageminConfig))
            .pipe(gulp.dest(config.path));

        // concat js
        glob(nSrc + '/**/js/!(plugin|static)/', function (err, files) {
            async.eachLimit(files, 10, function(dir, callback) {
                var pathRelative = path.relative(nSrc, dir);
                gulp.src(dir + '/*.js', {base: nSrc })
                    .pipe($.concat(pathRelative + '.js'))
                    .pipe($.uglify(uglifyConfig))
                    .pipe($.convertEncoding({
                        to: 'gbk'
                    }))
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
            .pipe($.uglify(uglifyConfig))
            .pipe($.convertEncoding({
                to: 'gbk'
            }))
            .pipe(gulp.dest(config.path))
            .pipe(message('压缩'));
        // 直接复制核心
        gulp.src([nSrc + '/**/{plugin,static}/*.js'], {base: nSrc})
            // .pipe($.uglify(uglifyConfig))
            .pipe(gulp.dest(config.path));
    });
    // sprites 异步处理
    gulp.task('sprites', ['pack'], function(cb) {
        var glob = require('glob'),
            nSrc = !argv.all ? config.tpl + '/src' : config.src;

        glob(nSrc + '/**/images/!(static)/', function (err, files) {
            async.eachLimit(files, 10, function(dir, callback) {
                var pathRelative = path.relative(nSrc, dir),
                    sName = path.basename(dir),
                    cssPath = path.join(pathRelative, '../../css/img/' + sName + '.scss');

                var spriteData = gulp.src(dir + '/*.{png,gif,jpg,jpeg}', {base: nSrc})
                    .pipe($.spritesmith({
                        imgName: pathRelative + '.png',
                        cssName: 'sprite.json',
                        // cssName: path.join(dir, cssPath),
                        padding: 10
                    }));

                spriteData.img
                    .pipe(gulp.dest(config.path))
                    .pipe(message('sprites img 生成'));

                gulp.src('./gulp/css/images.scss', {base: './gulp/css/'})
                    .pipe($.data(function(file, cb1) {
                        spriteData.css.pipe(concatStream(function(jsonArr) {
                            // console.log(JSON.parse(jsonArr[0].contents));
                            cb1(undefined, {
                                glyphs: JSON.parse(jsonArr[0].contents),
                                imgPath: '../images/' + sName + '.png',
                                sName: sName,
                                prefix: 'img'
                            });
                        }));
                    }))
                    .pipe($.template())
                    .pipe($.rename(cssPath))
                    .pipe(gulp.dest(nSrc))
                    .pipe(message('sprites css 生成'))
                    .pipe($.if(!argv.all, gulp.dest(config.src)));
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
        var glob = require('glob'),
            nSrc = !argv.all ? config.tpl + '/src' : config.src;

        glob(nSrc + '/**/fonts/!(static)/', function (err, files) {
            async.eachLimit(files, 10, function(dir, callback) {
                var pathRelative = path.relative(nSrc, dir),
                    sName = path.basename(dir),
                    cssPath = path.join(pathRelative, '../../css/font/' + sName + '.scss');
                
                gulp.src(dir + '/*.svg', {base: nSrc })
                    .pipe($.iconfont({
                        fontName: pathRelative, // required
                        // appendUnicode: true, // recommended option
                        formats: ['eot', 'woff'], // default, 'woff2' and 'svg' are available
                        // timestamp: runTimestamp // recommended to get consistent builds when watching files
                    }))
                    .on('glyphs', function(glyphs, options) {
                        // CSS templating, e.g.
                        // console.log(glyphs, options);
                        gulp.src('./gulp/css/fonts.scss')
                            .pipe($.template({
                                glyphs: glyphs,
                                fontPath: '../fonts/',
                                sName: sName,
                                prefix: 'font'
                            }))
                            .pipe($.rename(cssPath))
                            .pipe(gulp.dest(nSrc))
                            .pipe(message('fonts css 生成'))
                            .pipe($.if(!argv.all, gulp.dest(config.src)));
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
        var glob = require('glob'),
            nSrc = !argv.all ? config.tpl + '/src' : config.src;

        gulp.src([nSrc + '/**/css/*.scss'], {base: nSrc })
            .pipe($.plumber())
            .pipe($.if(!argv.d, $.sourcemaps.init()))
            .pipe($.sass({
                outputStyle: 'nested', 
                sourceMap: true
            }).on('error', $.sass.logError))
            .pipe($.autoprefixer({
                browsers: ['ff >= 3','Chrome >= 20','Safari >= 4','ie >= 8'],
            }))
            .pipe($.if(argv.d, $.csso(), $.csscomb('./gulp/css/csscomb.json')))
            /*.pipe($.data(function(file) {
                return {
                    name: path.basename(file.path),
                    author: config.author,
                    date: $.moment().format('YYYY-MM-DD HH:mm:ss')
                }
            }))
            .pipe($.template())*/
            .pipe($.if(!argv.d, $.sourcemaps.write('./maps', {
                includeContent: false,
                sourcemaps: './'
            })))
            .pipe($.convertEncoding({to: 'gbk'}))
            .pipe(gulp.dest(config.path))
            .pipe(message('scss 生成'));
        cb();
    })

    // clean
    gulp.task('clean', ['init'], function(cb) {
        del([config.path + '/{css,js,images,fonts,maps}'], {force: true}, cb);
    });
};