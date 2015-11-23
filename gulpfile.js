var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    config = require('./gulp/config')(),
    gulpTaskList = require('fs').readdirSync('./gulp/tasks/');

$.jsonFile = require('json-file');
$.argv     = require('yargs').argv;
$.moment   = require('moment');
$.fs       = require('fs');
$.path     = require('path');

gulpTaskList.forEach(function(taskfile) {
    require('./gulp/tasks/' + taskfile)(gulp, $, config);
});

gulp.task('default', ['help']);
gulp.task('help', function() {
    console.log('\n\
    --------------- help -----------------\n\n\
    web模块\n\
    gulp server\t\t监控一个动态服务器\n\
    gulp server:web\t创建一个静态服务器并监控\n\
    gulp csscomb\tcss排序并格式化\n\n\
    webdown模块\n\
    gulp webdown --config="<您的网址>, <下面的页面名>"\t\t下载网页\n\n\
    pack模块\n\
    gulp pack --config="<您的目录>, <打包名称>"\t\t打包\n\n\
    markdown模块\n\
    gulp markdown --config="<您的目录>"\t\tmarkdown转换\n\n\
    其它\n\
    gulp help\t\tgulp参数说明\n\n\
    --------------- /help -----------------\n\
    ');
});