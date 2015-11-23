var gulp    = require('gulp'),
argv        = require('yargs').argv,
zip         = require('gulp-zip'),
watch       = require('gulp-watch'),
clean       = require('gulp-clean'),
uglify      = require('gulp-uglify'),
compass     = require('gulp-compass'),
csscomb     = require('gulp-csscomb'),
notify      = require('gulp-notify'),
rename      = require('gulp-rename'),
plumber     = require('gulp-plumber'),
changed     = require('gulp-changed'),
browserSync = require('browser-sync').create(),
reload      = browserSync.reload,
jshint      = require('gulp-jshint'),
header      = require('gulp-header'),
moment      = require("moment"),
json        = require('json-file'),
pkg         = json.read('./package.json'),
// sftp     = require('gulp-sftp'),
connect     = require('gulp-connect'),
livereload  = require('gulp-livereload'),
fs          = require('fs'),
path        = require('path');

var config = {
    dir: 'libs' // 库的目录
}

// banner
var banner = ['/**',
  // ' * @name <%= filename %>',
  ' * @name ${filename}',
  ' * @author ahuing',
  ' * @link 08cms.com',
  ' * @date ${date}',
  ' */\n',
  ''].join('\n');

var baseDir = path.normalize(argv.config && argv.config.split(',')[0] || pkg.get('baseDir')) + '/';

console.log('项目目录:' + baseDir);

var pathConfig = {
    css: baseDir + 'css/',
    sass: baseDir + 'sass/',
    js: baseDir + 'js/',
    image: baseDir + 'image/',
    staticPasth: 'libs/htmlsrc/'
}

// default
gulp.task('default', ['setDir', 'build', 'connect', 'watch']);
gulp.task('serve', ['setDir', 'watch']);

// watch

gulp.task('watch', function() {
    livereload.listen();
    /*gulp.watch([baseDir + '*.html'], function() {
       gulp.src([baseDir + '*.html'])
           .pipe(reload({stream: true}))
   })*/

    gulp.watch(baseDir + '**/*.html', ['html']);
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
gulp.task('build', function(done) {
    if (baseDir) {
        fs.stat(baseDir, function(err, stats) {
            if (!stats.isDirectory()) {
                gulp.src(staticPasth + '**/*')
                    .pipe(gulp.dest(baseDir));
            } else if (!err) {
                fs.readdir(baseDir, function(er, files) {
                    var hash = {}, needFiles = [];
                    files.forEach(function(file, i) {
                        hash[file] = true;
                    })
                    fs.readdir(staticPasth, function(e, orgFiles) {
                        orgFiles.forEach(function(file, i) {
                            if (!hash[file]) {
                                gulp.src(staticPasth + file + '/')
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

// connect
gulp.task('connect', function() {
    connect.server({
        root: baseDir,
        port: 8080,
        open: true,
        livereload: true
    });
});


/**
 * csscomb css排序
 * gulp csscomb --config="[path]"
 * 例: gulp csscomb --config="E:\wwwroot\08cms\src\bug\house\"
 */

gulp.task('setDir', function() {
    if (argv.config) {
        pkg.set('baseDir', argv.config);
        pkg.writeSync();
    }
})

// html
gulp.task('html', function() {
    gulp.src(baseDir + '*.html')
        .pipe(livereload());
        // .pipe(connect.reload());
})

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
        .pipe(reload({stream: true}))
        .pipe(notify({message:'js ok !'}))
});

// compass

gulp.task('compass', function() {

    /*setTimeout(function () {
        livereload.reload();
    }, 5000)*/
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
        .pipe(livereload())
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

/**
 * csscomb css排序
 * gulp csscomb --config="[path]"
 * 例: gulp csscomb --config="E:\wwwroot\08cms\src\bug\house\"
 */

gulp.task('csscomb', function() {
    return gulp.src(pathConfig.css + '*.css')
        .pipe(csscomb('csscomb.json'))
        .pipe(gulp.dest(pathConfig.css))
        .pipe(notify({message:'csscomb ok !'}));
});

/**
 * packBug 打包补丁
 * gulp pack_bug --config="[path],[name]"
 * 例: gulp pack_bug --config="E:\wwwroot\08cms\src\bug\house\7.0,修复房产7.0通用搜索打不开"
 */
gulp.task('packBug', function () {
    // argv.run('gulp html_pstohtml --config="e:/test"');
    if (!argv.config) {
        console.log('请设置要打包的名称！');
        return;
    }
    var aPathName = argv.config.split(',');
    gulp.src([aPathName[0] + '/**/*', '!' + aPathName[0] + '/*.zip'])
        .pipe(clean())
        .pipe(zip(aPathName[1] + '.zip'))
        .pipe(gulp.dest(aPathName[0]))
})
