    module.exports = function(gulp, $$, utils) {
    var request = require('request'),
        url        = require('url'),
        fs         = require('fs'),
        urlsRegexp = /url\(.+?\)/ig,
        rUrls      = {}, oUrls = {};

    gulp.task('webdown', function(callback) {
        var async = require('async');

        // process config
        var processCon = function(cb) {
            var jsonFile = require('json-file-plus'),
                extend   = require('node.extend'),
                // baseFile = jsonFile.sync('./gulp/base.json'),
                // base     = baseFile.data,
                argv     = require('yargs').alias('c', 'config').argv;
            // 参数不存在返回错误信息

            var urlParse = url.parse(argv.h),
                reqConfig = {
                    url: urlParse.href, //要下载的网址
                    gzip: true, //是否开启gzip
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36'
                    },
                    encoding: null
                },
                webConfig = extend(true, {
                    hostUrl: urlParse.protocol + '//' + urlParse.host + '/',
                    downDir: argv.d + '\\' + urlParse.hostname + '\\',
                    fileName: (argv.n || 'index') + '.html'
                }, {});
            // 创建下载目录
            fs.mkdir(webConfig.downDir);
            // 设置目录 保存配置

            cb(null, reqConfig, webConfig);
        }

        // 开始请求
        var req = function(reqConfig, webConfig, cb){
            request(reqConfig, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    reqConfig.encoding = 'utf8';
                    var arr = body.toString().match(/<meta([^>]*?)>/g);
                    if (arr) {
                        arr.forEach(function(val) {
                            var match = val.match(/charset\s*=\s*(.+)\"/);
                            if (match && match[1]) {

                                if (match[1].substr(0, 1) == '"') match[1] = match[1].substr(1);
                                if (match[1].indexOf('"') > 0) match[1] = match[1].substr(0, match[1].indexOf('"'));

                                reqConfig.encoding = match[1].trim();
                                return false;
                            }
                        })
                    }
                    cb(null, body, reqConfig, webConfig)
                }
            });
        }

        // downHtml
        var downHtml = function(data, reqConfig, webConfig, cb) {
            var cheerio  = require('cheerio'),
                iconv    = require('iconv-lite');
            // 对数据进行转码
            data = iconv.decode(data, reqConfig.encoding);

            var $ = cheerio.load(data, {
                decodeEntities: false //关闭转换实体编码的功能
            });

            $('link[rel="stylesheet"]').each(function(i, el) {
                processUrls($(el).attr('href'), webConfig.hostUrl, function(rUrl, oUrl, nUrl) {
                    $(el).attr('href', nUrl);
                })
            });

            $('script[src]').each(function(i, el) {
                processUrls($(el).attr('src'), webConfig.hostUrl, function(rUrl, oUrl, nUrl) {
                    $(el).attr('src', nUrl);
                })
            });

            $('img').each(function(i, el) {
                $(el).attr('src') && processUrls($(el).attr('src'), webConfig.hostUrl, function(rUrl, oUrl, nUrl) {
                    $(el).attr('src', nUrl);
                }, el)
            });

            // 去掉内容里的链接
            $('a').each(function(i, el) {
                var href = $(el).attr('href');
                if (href && href.indexOf('java') != 0 && href.indexOf('#') != 0) {
                    $(el).attr('href', '###');
                }
            });
            // 解析内联css
            $('style').each(function(i, el) {
                var cssCon = $(el).html();
                var cssConUrls = cssCon.match(urlsRegexp);
                if (cssConUrls) {
                    processUrls(cssConUrls, webConfig.hostUrl, function(rUrl, oUrl, nUrl) {
                        $(el).attr('src', nUrl);
                        var reg =new RegExp(oUrl, 'g');
                        cssCon = cssCon.replace(reg, nUrl);
                    })
                    $(el).html(cssCon);
                };
            });
            // 兼容st编辑器，多个中线注释会出错
            var fileData = $.html().replace(/<!--\S(.+)\S-->/g, '<!-- $1 -->');
            // 转码
            fileData = iconv.encode(fileData, reqConfig.encoding);
            // return false;
            fs.writeFile(webConfig.downDir + webConfig.fileName, fileData, function(err) {
                if (err) {
                    cb(err);
                } else {
                    console.log(webConfig.downDir + webConfig.fileName + ' created');
                    cb(null, webConfig);
                };
            })
        }

        var downCss = function(webConfig, cb) {
            async.forEachOfLimit(rUrls, 10, function(v, k, callback) {
                if (v.split('.').pop() == 'css') {
                    request(k, function(err, response, fileData) {
                        if (err) {
                            callback(err);
                        } else {
                            var cssConUrls = fileData.match(urlsRegexp);
                            if (cssConUrls) {
                                processUrls(cssConUrls, webConfig.hostUrl, function(rUrl, oUrl, nUrl) {
                                    var reg =new RegExp(oUrl, 'g');
                                    fileData = fileData.replace(reg, '../' + nUrl);
                                })
                            };

                            fs.writeFile(webConfig.downDir ? webConfig.downDir + v : v, fileData, function(err) {
                                /*if (err) {
                                    callback(err);
                                };*/
                            })
                            console.log(webConfig.downDir + v + ' created');
                            callback();
                        };
                    })
                    // 删除已下载
                    delete rUrls[k];
                } else {
                    callback();
                }
            }, function(err) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, webConfig);
                }
            })
        }

        var downSource = function(webConfig, cb) {
            // return false;
            async.forEachOfLimit(rUrls, 20, function(v, k, callback) {
                request(k, function(err, response, fileData) {
                    if (err) {
                        callback(err);
                    } else {
                        console.log(webConfig.downDir + v + ' created');
                        callback();
                    };
                }).pipe(fs.createWriteStream(webConfig.downDir + v));
            }, function(err) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, '完成');
                }
            })
        }

        async.waterfall([
                processCon,
                req,
                downHtml,
                downCss,
                downSource
            ],
            function(err, result) {
                if (err) {
                    callback(err);
                } else {
                    // open
                    // require('child_process').exec('explorer ' + result.downDir);
                    console.log(result);
                };
            });
        

    })

    /**
     * 处理链接地址
     * @param  {array} urls    要处理的链接
     * @param  {string} baseUrl 基本地址
     * @param  {function} fn 回调函数
     */
    function processUrls(urls, rBaseUrl, fn) {
        var hash = {}, isHtml, _urls = [];
        if (typeof urls == 'string') {
            isHtml = true;
            _urls.push(urls);
        } else {
            isHtml = false;
            _urls = urls;
        }
        _urls.forEach(function(oUrl, i) {
            oUrl = oUrl.replace(/url\(('|"|)|('|"|)\)/g, '');
            var urlParse = url.parse(oUrl),
                rUrl, fName, fExtendName, fDirname;
            if (!urlParse.href) return;
            if (urlParse.protocol) {
                rUrl = urlParse.protocol + '//' + urlParse.host + urlParse.pathname
            } else {
                rUrl = url.resolve(rBaseUrl, urlParse.pathname)
            }
            // 处理相同地址
            if (!rUrls[rUrl]) {
                fName = rUrl.split('/').pop();
                fExtendName = fName.split('.').pop();
                switch (fExtendName) {
                    case 'gif':case 'png':case 'jpg':case 'jpeg':
                        fDirname = 'images/';
                    break;
                    case 'svg':case 'eot':case 'woff':
                        fDirname = 'fonts/';
                    break;
                    case 'js':
                        fDirname = 'js/';
                    break;
                    case 'css':
                        fDirname = 'css/';
                    break;
                    default:
                        return false;
                    break;
                }
                // 处理相同文件名
                if (hash[fName]) {
                    fName = fName.replace('.', '-e.');
                }
                hash[fName] = true;
                oUrls[oUrl] = fDirname + fName;
                rUrls[rUrl] = fDirname + fName;

                fn && fn(rUrl, oUrl, fDirname + fName);
            }
        })
    }

};