var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    compass = require('gulp-compass'),
    csscomb = require('gulp-csscomb'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    changed = require('gulp-changed'),
    jshint = require('gulp-jshint'),
    header = require('gulp-header'),
    argv = require('yargs').argv,
    moment = require("moment"),
    json = require('json-file'),
    pkg = json.read('./package.json'),
    sftp = require('gulp-sftp'),
    livereload = require('gulp-livereload'),
    fs = require('fs'),
    path = require('path');

// banner
var banner = ['/**',
  // ' * @name <%= filename %>',
  ' * @name ${filename}',
  ' * @author ahuing',
  ' * @link 08cms.com',
  ' * @date ${date}',
  ' */\n',
  ''].join('\n');

var baseDir = path.normalize(argv.config && argv.config.split(',')[0] || pkg.get('baseDir') || __dirname + '/src') + '/';

console.log('项目目录:' + baseDir);

var pathConfig = {
    css: baseDir + 'css/',
    sass: baseDir + 'sass/',
    js: baseDir + 'js/',
    image: baseDir + 'image/'
}

// default
gulp.task('default', ['build', 'setDir', 'watch']);
gulp.task('buildServer', ['setDir', 'watch']);

// watch

gulp.task('watch', function() {
    livereload.listen();
    /*gulp.watch([baseDir + '*.html'], function() {
       gulp.src([baseDir + '*.html'])
           .pipe(reload({stream: true}))
   })*/
   gulp.watch(baseDir + '**/*.scss', function(cssFile) {
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

// build
gulp.task('build', function() {
    if (argv.config) {
        fs.stat(argv.config, function(err, stats) {
            if (!stats.isDirectory()) {
                gulp.src('src/**/*')
                    .pipe(gulp.dest(baseDir));
            } else if (!err) {
                fs.readdir(argv.config, function(er, files) {
                    var hash = {}, needFiles = [];
                    files.forEach(function(file, i) {
                        hash[file] = true;
                    })
                    fs.readdir('src', function(e, orgFiles) {
                        orgFiles.forEach(function(file, i) {
                            if (!hash[file]) {
                                gulp.src('src/' + file + '/')
                                    .pipe(gulp.dest(baseDir));
                            }
                        })
                    })
                })
            };
        })
    } else {
        console.log('error:请输入项目目录!,命令 gulp build --config="你的项目目录"');
    }

});
// config
gulp.task('setDir', function() {
    if (argv.config) {
        pkg.set('baseDir', argv.config);
        pkg.writeSync();
    }
})

// browser
gulp.task('buildProxy', function() {
    browserSync.init({
        /*server: {
            baseDir: baseDir
        },*/
        proxy: '192.168.1.7/house'
    });
    gulp.run('watch', 'setDir');
});
gulp.task('server', ['build'], function() {
    browserSync.init({
        server: {
            baseDir: baseDir
        }
    });
});

// js
gulp.task('js', function() {
    gulp.src([pathConfig.js + '*.js','!' + pathConfig.js + '*.min.js'])
        // .pipe(watch([baseDir + 'js/*.js','!' + baseDir + 'js/*.min.js']))
        // .pipe(changed(baseDir + 'js/'))
        .pipe(jshint())
        .pipe(jshint.reporter())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min'}))
        .pipe(gulp.dest(pathConfig.js))
        // .pipe(reload({stream: true}))
        .pipe(notify({message:'js ok !'}))
});

// compass
gulp.task('compass', function() {

    /*setTimeout(function () {
        livereload.reload();
    }, 5000)*/
console.log(pathConfig.css);
    return gulp.src(pathConfig.sass + '*.scss')
        .pipe(changed(pathConfig.css, {extension: '.css'}))
        .pipe(compass({
            project: baseDir,
            // style: 'compact',
            // comments: true,
            css: 'css',
            image: 'images',
            sass: 'sass',
            sourcemap: true, // 生成sourcemap
            time: true
        }))
        .pipe(header(banner, {
            date: moment().format("YYYY-MM-DD HH:mm:ss")
        }))
        /*.pipe(sftp({
            host: 'trfcw.com',
            user: '2015RENSHIJIE',
            pass: 'RENSHIJIEadmin#@!',
            port: '2015',
            remotePath: "/2015trfcw/template/default/css/"
        }))*/
        .pipe(gulp.dest(pathConfig.css))
        // .pipe(reload({stream: true}))
        // .pipe(livereload())
        .pipe(notify({message:'css header ok !'}));
});

// ftp
gulp.task('ftp', function () {
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
    return gulp.src(pathConfig.css + '*.css')
        .pipe(csscomb('csscomb.json'))
        .pipe(gulp.dest(pathConfig.css))
        .pipe(notify({message:'csscomb ok !'}));
});
