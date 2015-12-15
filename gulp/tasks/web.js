module.exports = function(gulp, $, utils) {
    // banner
    var http       = require('http'),
        path      = require('path'),
        isLocal   = true,
        jsonFile  = require('json-file-plus'),
        tasksInfo = jsonFile.sync('./gulp/tasks.json').data,
        jshintConfig = {
            bitwise: false, //禁用位运算符，位运算符在 JavaScript 中使用较少，经常是把 && 错输成 &
            curly: false, //循环或者条件语句必须使用花括号包围
            camelcase: true, // 使用驼峰命名(camelCase)或全大写下划线命名(UPPER_CASE)
            eqeqeq: false, //强制使用三等号
            indent: 4,// 代码缩进
            latedef: "nofunc", // 禁止定义之前使用变量，忽略 function 函数声明
            newcap: true, // 构造器函数首字母大写
            quotmark: true, // 为 true 时，禁止单引号和双引号混用
            undef: true, // 变量未定义
            unused: true, // 变量未使用
            strict: false, // 严格模式
            maxparams: 4, //最多参数个数
            immed: true, //匿名函数调用必须 (function() { // body }()); 而不是 (function() { // body })();
            maxdepth: 4, //最大嵌套深度
            maxcomplexity:true, // 复杂度检测
            maxlen: 100, // 最大行数
            asi: false,
            boss: true, //控制“缺少分号”的警告
            lastsemic: true, // 检查一行代码最后声明后面的分号是否遗漏
            laxcomma: true, //检查不安全的折行，忽略逗号在最前面的编程风格
            loopfunc: true, //检查循环内嵌套 function
            multistr: true, // 检查多行字符串
            notypeof: true, // 检查无效的 typeof 操作符值
            sub: true, // person['name'] vs. person.name
            supernew: true, // new function () { ... } 和 new Object ;
            validthis: true, // 在非构造器函数中使用 this 
            globals: {
                $: false,
                uri2MVC: false
            }
        },
        argv  = require('yargs').alias('c', 'config').argv,
        banner = ['/**',
                ' * @name <%= name%>',
                ' * @author <%= author%>',
                ' * @link 08cms.com',
                ' * @date <%= time%>',
                ' */\n',
                ''
            ].join('\n'),
        config;

    var processBase = function(taskName, cb) {
        var base = jsonFile.sync('./gulp/base.json'),
            args  = argv.c,
            argsK = ['baseurl','src','dist', 'author'];                                      

        config = base.data.web;
        if (args) {
            args.split(',').forEach(function(v, i) {
                if (v) {
                    config[argsK[i]] = v;
                }
            })
        }

        if (config.baseurl) {
            config.src = path.join(config.baseurl, config.src);
            config.dist = path.join(config.baseurl, config.dist);
            console.log('\n当前配置:');
            console.log(config);
            console.log('\n');
        } else {
            return cb('命令：gulp '+ taskName +' -c "' + tasksInfo[taskName]['argv'] + '"\n');
        };

        if (!config.dist) {
            config.dist = config.src;
        }

        base.saveSync();
    }
    // server
    gulp.task('server', function(cb) {
        processBase('server', cb);
        gulp.start('server:watch');
    });
    // server:remote
    gulp.task('server:remote', function(cb) {
        isLocal = false;
        processBase('server:remote', cb);
        gulp.start('server:watch');
    });
    // server:web
    gulp.task('server:web', function (cb) {
        processBase('server:web', cb);
        
        utils.mkdir(config.baseurl, config.tpl);
        gulp.start('connect', 'server:watch');
        if (argv.o) {
            require('child_process').exec('start http://localhost:8080/');
        };
    });
    // connect 
    gulp.task('connect', function() {
        $.connect.server({
            root: config.dist,
            port: 8080/*,
            livereload: true*/
        });
    })

    // watch

    gulp.task('server:watch', function() {
        if (isLocal) {
            $.livereload.listen();

            $.watch(config.src + '/**/*.html', function () {
                gulp.src(config.src + '/**/*.html', {read: false})
                .pipe($.livereload());
            });
        } else {
            $.watch(config.src + '/**/*.{html,css,js}', function(cssFile) {
                var relativeDir = path.dirname(path.relative(config.src, cssFile.path).replace(/\\/g,'/'));
                console.log('本地：' + cssFile.path);
                console.log('远程：' + '/housev7.08cms.com/template/blue/' + relativeDir + '/');
                return gulp.src(cssFile.path)
                    .pipe($.ftp({
                        host: '183.129.245.7',
                        user: '08house',
                        pass: '8UdGu9V61',
                        port: '621',
                        remotePath: '/housev7.08cms.com/template/blue/' + relativeDir + '/'
                    }))
                    .pipe($.livereload())
                    .pipe($.notify({
                        message: 'ftp ok !'
                    }));
            })
        };
        // scss
        $.watch([config.src + '/**/*.scss', '!' + config.src + '/**/part-*.scss'], function (file) {
            gulp.src(file.path, {base: config.src})
                .pipe($.sass({
                    outputStyle: 'nested', //Type: String Default: nested Values: nested, expanded, compact, compressed
                    sourceMap: true
                }).on('error', $.sass.logError))
                .pipe($.autoprefixer({
                    browsers: ['ff >= 3','Chrome >= 20','Safari >= 4','ie >= 8'],
                    //cascade: true, 是否美化属性值 默认：true 像这样：
                    //-webkit-transform: rotate(45deg);
                    //        transform: rotate(45deg);
                    //remove:true //是否去掉不必要的前缀 默认：true 
                }))
                // .pipe($.csso())
                .pipe($.csscomb('./src/css/csscomb.json'))
                .pipe($.header(banner, {
                    name: file.basename.replace(/scss/, 'css'), 
                    author: config.author,
                    time: $.moment().format("YYYY-MM-DD HH:mm:ss")
                }))
                // .pipe($.convertEncoding({to: 'gbk'}))
                .pipe(gulp.dest(config.dist))
                .pipe($.notify({
                    message: 'css 处理 ok !'
                }))
        });
        // sprite
        $.watch(config.src + '/**/*.{gif,png}', function (file) {
            var fDirname = path.join(file.dirname, '../../'),
            nBasename = file.dirname.split('\\').pop(),
            baseDir =path.join(config.dist, path.relative(config.src, fDirname));

            gulp.src(file.dirname + '/*', { base: config.src })
                .pipe($.spritesmith({
                    imgName: 'images/sprite-'+ nBasename +'.png',
                    imgPath: '../images/sprite-'+ nBasename +'.png',
                    cssName: fDirname + '/css/part-'+ nBasename +'.scss',
                    // cssTemplate: './src/css/scss.template.handlebars',
                    cssSpritesheetName: 'ico',
                    cssOpts: {cssOpts: {functions: false}},
                    padding: 10
                }))
                .pipe(gulp.dest(baseDir))
                .pipe($.notify({
                    message: 'sprite 生成 ok !'
                }));
        });
        // js
        $.watch(config.src + '/**/*.js', function (file) {
            gulp.src(file.path, {base: config.src})
            // file.pipe($.jshint(jshintConfig))
            .pipe($.jshint.reporter())
            // .pipe($.jslint())
            .pipe($.uglify({
                compress: {
                    loops: true,//优化循环
                    sequences: true,//连续使用多个逗号
                    if_return: true,//优化if else
                    unused: true,//删除没使用的变量、函数
                    evaluate: true,//优化常量表达式
                    hoist_funs: true,//函数声明至于顶端
                    comparisons: true,//优化逻辑操作符
                    hoist_vars: true,//变量声明至于顶端
                    conditionals: true,//优化条件表达式(转换成二元)
                    dead_code: true,//删除运行不到的代码
                    booleans: true,//优化布尔表达式
                    // source_map: true,//source_map
                    properties: false,//类似a["foo"] 智能优化为 a.foo
                    unsafe: false,//不安全的优化
                    join_vars: true//合并多个变量声明
                }
            }))
            /*.pipe(rename({
                suffix: '.min'
            }))*/
            .pipe($.header(banner, {
                name: file.basename, 
                author: config.author,
                time: $.moment().format("YYYY-MM-DD HH:mm:ss")
            }))
            .pipe($.convertEncoding({to: 'gbk'}))
            .pipe(gulp.dest(config.dist))
            .pipe($.notify({
                message: 'js 压缩 ok !'
            }))
        });
    })

    // csscomb
    gulp.task('csscomb', function() {
        processBase('csscomb', cb);
        return gulp.src(config.dist + '/**/*.css')
            .pipe(csscomb('csscomb.json'))
            .pipe(gulp.dest(config.dist))
            .pipe(notify({
                message: 'csscomb ok !'
            }));
    });

};