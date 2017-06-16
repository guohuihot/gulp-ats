module.exports = function($, argv) {
    var customConfig;
    var fs = require('fs');
    var path = require('path');
    var SOURCEURL = './bin';
    var config = {};

    if (!fs.existsSync(SOURCEURL + 'base.json')) {
        // 不存在时 创建一个空的文件 保证不报错
        fs.writeFileSync(SOURCEURL + 'base.json', '');
    }

    var base = $.jsonFilePlus.sync(SOURCEURL + 'base.json');

    if (base.data) {
        if (argv.path) {
            // 按路径找配置
            // 有路径时直接保存配置及时间戳
            config = base.data[argv.alias || argv.path] || {};
        } else if (argv.alias) {
            // 按别名找配置
            for (p in base.data) {
                if (base.data[p].alias == argv.alias) {
                    config = base.data[p];
                }
            }
        } else {
            // 按时间找配置
            // 没有时直接从base里找最后一次配置
            for (p in base.data) {
                if (base.data[p].t > (config.t || 0)) {
                    config = base.data[p];
                }
            }
        }
    } else {
        base.data = {};
    }
    // 默认项
    argv.d = argv.d === 0 ? false : true;
    argv.m = argv.m || config.mode;

    switch (argv.m) {
        case 11:
            customConfig = {
                libs   : '',
                tpl    : './src/libs/', // ats源目录
                dist   : '', // 项目的dist
                src    : 'src', // 项目的src
            };
            break;
        case 2:
        case 21:
            customConfig = {
                libs   : 'libs',
                tpl    : './src/',
                dist   : '',
                src    : 'src',
            };
            break;
        case 3:
            customConfig = {
                libs   : 'mobile',
                tpl    : './src/',
                dist   : '',
                src    : 'src',
            };
            break;
        case 4:
            customConfig = {
                path   : CWD,
                libs   : 'libs',
                tpl    : './src/',
                dist   : 'test/',
                distEx : '',
                src    : 'src',
            };
            break;
        case 'c':
            customConfig = {
                libs   : '',
                tpl    : './src/libs/',
            };
            break;
    }
    // console.log(config);
    config = $.extend({
            author: 'author',
            distEx: '',
            libs: '',
            tpl: './src/libs/', // ats源目录
            dist: '', // 项目的dist
            src: 'src', // 项目的src
            mode: 1
        },
        config, 
        {
            path: argv.path,
            author: argv.author,
            dist: argv.dist,
            distEx: argv.distEx,
            src: argv.src,
            scssPaths: argv.scssPaths,
            alias: argv.alias,
            mode: argv.m
        }, customConfig);

    // 目录不存在时直接返回
    if (!config.path) {
        console.log('error: 请设置项目目录path!');
        return false;
    };

    // 设置时间下次直接用
    config.t = parseInt(new Date().getTime() / 1000);
    base.data[config.path] = config;
    base.saveSync();

    if (config.path.indexOf(',') != -1) {
        config.multiple = 1;

        config.path = path.normalize(config.path);

    } else {
        config.src  = path.join(config.path, config.src);
        config.dist = path.join(config.path, config.dist);
        // config.tpl  = path.join(config.path, config.tpl);
    }
    // 导出
    return {
        config: config,
        base: base
    }
}
