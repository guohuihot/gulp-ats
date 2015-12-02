module.exports = function(gulp, $, utils) {
    // banner
    var http       = require('http'),
        path       = require('path'),
        pathConfig = {},
        isLocal = true,
        config;


    var processBase = function(taskName, cb) {
        var base = require('json-file-plus').sync('./gulp/base.json'),
            args  = require('yargs').alias('c', 'config').argv.c,
            argsK = ['dir', 'name'];                                      

        config = base.data.web;
        if (args) {
            args.split(',').forEach(function(v, i) {
                config[argsK[i]] = v;
            })
        }

        if (config.dir) {
            console.log('\n当前项目目录:' + config.dir + '\n');
        } else {
            return cb('命令：gulp '+ taskName +' -c "' + config['tasks'][taskName]['argv'] + '"\n');
        };
        pathConfig = {
            css: config.dir + 'css/',
            sass: config.dir + 'sass/',
            js: config.dir + 'js/',
            image: config.dir + 'image/'
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

            //gulp.watch(config.dir + '**/*.html', function () {
                //gulp.src(config.dir + '**/*.html')
                //.pipe($.livereload());
            //});
        };

        gulp.watch('**/' + config.dir + '**/*.scss', function(cssFile) {
            config.dir = path.join(path.dirname(cssFile.path), '../');
            pathConfig = {
                css: config.dir + 'css/',
                sass: config.dir + 'sass/',
                js: config.dir + 'js/',
                image: config.dir + 'image/'
            }
            gulp.start('compass');
        });

        // gulp.watch([config.dir + 'js/*.js','!' + config.dir + 'js/*.min.js'],['js']);
    })


    // js
    gulp.task('js', function() {
        gulp.src([pathConfig.js + '*.js', '!' + pathConfig.js + '*.min.js'])
            // .pipe(watch([config.dir + 'js/*.js','!' + config.dir + 'js/*.min.js']))
            // .pipe(changed(config.dir + 'js/'))
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
            ' * @author ' + config.name,
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
                project: config.dir,
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