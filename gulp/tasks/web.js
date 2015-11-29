module.exports = function(gulp, $, config) {
    // banner
    var http       = require('http'),
        argv       = require('yargs').argv,
        path       = require('path'),
        pathConfig = {}, webConfig, baseDir;

    // default
    gulp.task('server', ['base', 'server:watch']);
    gulp.task('server:remote', ['base', 'remote:watch']);
    gulp.task('server:web', ['base', 'mkdir', 'connect', 'server:watch'], function () {
        require('child_process').exec('start http://localhost:8080/');
    });

    gulp.task('base', function(cb) {
        var base = require('json-file-plus').sync('./gulp/base.json');
        webConfig = base.data.web;
        var args = argv.config,
            argsK = ['dir', 'name'];

        if (args) {
            // 保存参数
            if (args.indexOf('{') != -1) {
                var obj = JSON.parse(args);

                for (var v in obj) {
                    webConfig[v] = obj[v];
                }
            } else {
                args.split(',').forEach(function(v, i) {
                    webConfig[argsK[i]] = v;
                })
            }
        }

        if (webConfig.dir) {
            baseDir = path.normalize(webConfig.dir) + '/';
            console.log('\n当前项目目录:' + baseDir + '\n');
        } else {
            return cb('第一次请输入项目目录!,命令 gulp <task> --config="你的项目目录"\n');
        };
        pathConfig = {
            css: baseDir + 'css/',
            sass: baseDir + 'sass/',
            js: baseDir + 'js/',
            image: baseDir + 'image/',
            tpl: 'src/html/'
        }
        base.saveSync();
    })
    // watch

    gulp.task('server:watch', function() {
        $.livereload.listen();

        gulp.watch(baseDir + '**/*.html', function () {
            gulp.src(baseDir + '**/*.html')
            .pipe($.livereload());
        });

        gulp.watch('**/' + baseDir + '**/*.scss', function(cssFile) {
            baseDir = path.join(path.dirname(cssFile.path), '../');
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

    gulp.task('remote:watch', function() {
        gulp.watch('**/' + baseDir + '**/*.scss', function(cssFile) {
            baseDir = path.join(path.dirname(cssFile.path), '../');
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

    // mkdir
    gulp.task('mkdir', function(cb) {
        config.mkdir(baseDir, pathConfig.tpl);
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

        var banner = ['/**',
            // ' * @name < %= filename %>',
            ' * @name ${filename}',
            ' * @author ' + webConfig.name,
            ' * @link 08cms.com',
            ' * @date ${date}',
            ' */\n',
            ''
        ].join('\n');

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