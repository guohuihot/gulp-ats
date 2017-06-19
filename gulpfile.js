var gulp         = require('gulp'),
    $            = require('gulp-load-plugins')({
                        pattern      : ['*'],
                        replaceString: /^(gulp|node)(-|\.)/,
                    }),
    utils        = require('./lib/utils'),
    configs      = require('./lib/configs')($, utils),
    debugMoudle  = [], //调试用，数组里放要排除的模块，如：['web']
    fs           = require('fs-extra');

// yargs配置
$.yargs.alias({
        path      : 'p',
        author    : 'au',
        alias     : 'a',
        custom    : 'c',
        libs      : 'l',
        dev       : 'd',
        server    : 's',
        open      : 'o',
        src       : 'src',
        ftp       : 'f',
        reverse   : 'r',
        mode      : 'm',
        all       : 'al',
        type      : 't'
    })

var task = $.yargs.argv._[0] || 'default';
var basePath = './lib/base.json';
var base = fs.readJsonSync(basePath, { throws: false }) || {};

// 如果配置里没有任务对应的文件名，去文件里查找并保存到配置里，下次直接使用
if (!base[task]) {
    var gulpTasks = fs.readdirSync('./bin/');

    gulpTasks.forEach(function(gulpTask) {
        var str = fs.readFileSync('./bin/' + gulpTask, 'utf8');
        var aTasks = utils.getTasks(str);
        if (utils.inArray(task, aTasks)) {
            base[task] = gulpTask;
        };
    });

    fs.writeJSONSync(basePath, base, {spaces: 2});
};
// 执行任务文件, 只加载包含当前任务的文件
base[task] && require('./bin/' + base[task])(gulp, $, utils, configs);

