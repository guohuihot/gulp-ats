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
        config;

    var processBase = function(taskName, cb) {
        var base = jsonFile.sync('./gulp/base.json'),
            args  = require('yargs').alias('c', 'config').argv.c,
            argsK = ['dir','dist', 'name'];                                      

        config = base.data.web;
        if (args) {
            args.split(',').forEach(function(v, i) {
                if (v) config[argsK[i]] = v;
            })
        }

        if (config.dir) {
            config.dir = path.normalize(config.dir) + '/';
            console.log('\n当前项目目录:' + config.dir + '\n');
        } else {
            return cb('命令：gulp '+ taskName +' -c "' + tasksInfo[taskName]['argv'] + '"\n');
        };

        if (!config.dist) {
            config.dist = config.dir;
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
        
        utils.mkdir(config.dir, config.src);
        gulp.start('connect', 'server:watch');
        require('child_process').exec('start http://localhost:8080/');
    });
    // connect 
    gulp.task('connect', function() {
        $.connect.server({
            root: config.dir,
            port: 8080/*,
            livereload: true*/
        });
    })
    // watch

    gulp.task('server:watch', function() {
        if (isLocal) {
            $.livereload.listen();

            $.watch(config.dir + '**/*.html', function () {
                gulp.src(config.dir + '**/*.html', {read: false})
                .pipe($.livereload());
            });
        } else {
            gulp.watch(config.dir + '**/*.{html,css,min.js}', function(cssFile) {
                if (cssFile.type != 'changed') return false;
                var relativeDir = path.dirname(path.relative(config.dir, cssFile.path).replace(/\\/g,'/'));
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

        gulp.watch(config.dir + '**/*.{js,scss}', function(file) {
            if (file.type != 'changed') return false;
            config.filePath = file.path;
            config.nDir = path.join(path.dirname(config.filePath), '../');
            var pathRelative = path.relative(config.dir, config.nDir);
            config.nDist = path.join(config.dist, pathRelative) + '/';

            config.banner = ['/**',
                ' * @name ' + path.basename(file.path).replace(/.scss/, '.css'),
                ' * @author ' + config.name,
                ' * @link 08cms.com',
                ' * @date ' + $.moment().format("YYYY-MM-DD HH:mm:ss"),
                ' */\n',
                ''
            ].join('\n'); 

            if (path.extname(file.path) == '.scss') {           
                gulp.start('compass');
            } else {
                gulp.start('js');
            };
        });
    })


    // js
    gulp.task('js', function() {
        gulp.src(config.filePath)
            .pipe($.jshint(jshintConfig))
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
            .pipe($.header(config.banner))
            .pipe($.convertEncoding({to: 'gbk'}))
            .pipe(gulp.dest(config.nDist + 'js/'))
            .pipe($.notify({
                message: 'js 压缩 ok !'
            }))
    });

    // compass

    gulp.task('compass', function() {
// return false;
        return gulp.src(config.filePath)
            .pipe($.compass({
                project: config.nDir,
                // style: 'compact',
                // comments: true,
                css: config.nDist + 'css/',
                image: 'images',
                sass: 'scss',
                // sourcemap: true, // 生成sourcemap
                time: true
            }))
            .pipe($.header(config.banner))
            .pipe(gulp.dest(config.nDist + 'css/'))
            .pipe($.if(isLocal, $.livereload()))
            .pipe($.notify({
                message: 'css compass ok !'
            }));
    });

    // csscomb

    gulp.task('csscomb', function() {
        processBase('csscomb', cb);
        return gulp.src(config.dir + '**/*.css')
            .pipe(csscomb('csscomb.json'))
            .pipe(gulp.dest(config.dir))
            .pipe(notify({
                message: 'csscomb ok !'
            }));
    });

};