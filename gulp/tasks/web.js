module.exports = function(gulp, $, config) {
    // banner
    var baseJson = $.jsonFile.read('./gulp/base.json'),
        banner = ['/**',
            // ' * @name < %= filename %>',
            ' * @name ${filename}',
            ' * @author ' + baseJson.get('name'),
            ' * @link 08cms.com',
            ' * @date ${date}',
            ' */\n',
            ''
        ].join('\n'),
        http = require('http'),
        baseDir , pathConfig = {};

    // default
    gulp.task('server', ['base', 'serverWatch']);
    gulp.task('server:web', ['base', 'build', 'connect', 'serverWatch'], function () {
        require('child_process').exec('start http://localhost:8080/');
    });

    gulp.task('base', function(cb) {
        var args = $.argv.config,
            argsK = ['dir', 'name'];

        if (args) {
            // 保存参数
            if (args.indexOf('{') != -1) {
                var obj = JSON.parse(args);

                for (var v in obj) {
                    baseJson.set(v, obj[v]);
                }
            } else {
                args.split(',').forEach(function(v, i) {
                    baseJson.set(argsK[i], v)
                })
            }
            baseJson.writeSync(null, 4);
        }

        if (baseJson.get('dir')) {
            baseDir = $.path.normalize(baseJson.get('dir')) + '/';
            console.log('\n当前项目目录:' + baseDir + '\n');
        } else{
            return cb('第一次请输入项目目录!,命令 gulp <task> --config="你的项目目录"\n');
        };
        pathConfig = {
            css: baseDir + 'css/',
            sass: baseDir + 'sass/',
            js: baseDir + 'js/',
            image: baseDir + 'image/',
            tpl: 'src/html/'
        }
    })
    // watch

    gulp.task('serverWatch', function() {
        $.livereload.listen();

        gulp.watch(baseDir + '**/*.html', function () {
            gulp.src(baseDir + '**/*.html')
            .pipe($.livereload());
        });

        gulp.watch('**/' + baseDir + '**/*.scss', function(cssFile) {
            baseDir = $.path.join($.path.dirname(cssFile.path), '../');
            pathConfig = {
                css: baseDir + 'css/',
                sass: baseDir + 'sass/',
                js: baseDir + 'js/',
                image: baseDir + 'image/'
            }
            gulp.run('compass');
        });

        // gulp.watch([baseDir + 'js/*.js','!' + baseDir + 'js/*.min.js'],['js']);
    })

    // build
    gulp.task('build', function(done) {
        $.fs.stat(baseDir, function(err, stats) {
            if (!stats.isDirectory()) {
                gulp.src(pathConfig.tpl + '**/*')
                    .pipe(gulp.dest(baseDir));
            } else if (!err) {
                $.fs.readdir(baseDir, function(er, files) {
                    var hash = {},
                        needFiles = [];
                    files.forEach(function(file, i) {
                        hash[file] = true;
                    })
                    $.fs.readdir(pathConfig.tpl, function(e, orgFiles) {
                        orgFiles.forEach(function(file, i) {
                            if (!hash[file]) {
                                gulp.src(pathConfig.tpl + file + '/')
                                    .pipe(gulp.dest(baseDir));
                            }
                        })
                    })
                })
            };
        })
            
    });

    // connect
    gulp.task('connect', function() {
        $.connect.server({
            root: baseDir,
            port: 8080/*,
            livereload: true*/
        });
    });

    // js
    gulp.task('js', function() {
        gulp.src([pathConfig.js + '*.js', '!' + pathConfig.js + '*.min.js'])
            // .pipe(watch([baseDir + 'js/*.js','!' + baseDir + 'js/*.min.js']))
            // .pipe(changed(baseDir + 'js/'))
            .pipe(jshint())
            .pipe(jshint.reporter())
            .pipe(uglify())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(pathConfig.js))
            .pipe(reload({
                stream: true
            }))
            .pipe(notify({
                message: 'js ok !'
            }))
    });

    // compass

    gulp.task('compass', function() {

        return gulp.src(pathConfig.sass + '*.scss')
            .pipe($.changed(pathConfig.css, {
                extension: '.css'
            }))
            .pipe($.compass({
                project: baseDir,
                // style: 'compact',
                // comments: true,
                css: 'css',
                image: 'images',
                sass: 'sass',
                // sourcemap: true, // 生成sourcemap
                time: true
            }))
            .pipe($.header(banner, {
                date: $.moment().format("YYYY-MM-DD HH:mm:ss")
            }))
            // .pipe($.csscomb('csscomb.json'))
            .pipe(gulp.dest(pathConfig.css))
            .pipe($.livereload())
            .pipe($.notify({
                message: 'css header ok !'
            }));
    });

    // ftp
    gulp.task('ftp', function() {
        return gulp.src('src/*')
            .pipe(ftp({
                host: 'website.com',
                user: 'johndoe',
                pass: '1234'
            }))
            // you need to have some kind of stream after gulp-ftp to make sure it's flushed
            // this can be a gulp plugin, gulp.dest, or any kind of stream
            // here we use a passthrough stream
            .pipe(gutil.noop());
    });

    /**
     * csscomb css排序
     * gulp csscomb --config="[path]"
     * 例: gulp csscomb --config="E:\wwwroot\08cms\src\bug\house\"
     */

    gulp.task('csscomb', function() {
        return gulp.src(pathConfig.css + '*.css')
            .pipe(csscomb('csscomb.json'))
            .pipe(gulp.dest(pathConfig.css))
            .pipe(notify({
                message: 'csscomb ok !'
            }));
    });

};