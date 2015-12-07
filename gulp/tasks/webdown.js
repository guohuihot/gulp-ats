module.exports = function(gulp, $$, utils) {
    var request = require('request'),
        cheerio  = require('cheerio'),
        iconv    = require('iconv-lite'),
        url      = require('url'),
        path      = require('path'),
        fs       = require('fs'),
        jsonFile = require('json-file-plus'),
        extend   = require('node.extend'),
        urlsRegexp = /url\(.+?\)/ig,
        rUrls = {}, oUrls = {};

    gulp.task('webdown', function(callback) {

        var async = require('async');

        // process config
        var processCon = function(cb) {
            var baseFile = jsonFile.sync('./gulp/base.json');

            var base = baseFile.data;
            var argv = require('yargs').alias('c', 'config').argv.c;
            // 参数不存在返回错误信息
            if (!argv) {
                cb('命令：gulp webdown -c "' + base['webdown']['argv'] + '"\n');
            };
            var args = argv.split(','),
                urlParse = url.parse(args[0]),
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
                    downDir: (base['webdown']['dest'] = args[2] || base['webdown'].dest) + '\\' + urlParse.hostname + '\\',
                    fileName: (args[1] || 'index') + '.html'
                }, base['webdown']);
            // 创建下载目录
            utils.mkdir(webConfig.downDir, webConfig.src);
            // 设置目录 保存配置
            baseFile.saveSync();

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
                    // 对数据进行转码
                    body = iconv.decode(body, reqConfig.encoding);
                    cb(null, body, reqConfig, webConfig)
                }
            });
        }

        // processHtml
        var processHtml = function(data, reqConfig, webConfig, cb) {
            var $ = cheerio.load(data, {
                decodeEntities: false //关闭转换实体编码的功能
            }),
            source = {
                css: []
            };

            $('link[rel="stylesheet"]').each(function(i, el) {
                processUrls($(el).attr('href'), webConfig.hostUrl, function(rUrl, oUrl, nUrl) {
                    source.css.push(rUrl);
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
                })
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
                    processUrls(cssCon.match(urlsRegexp), webConfig.hostUrl, function(rUrl, oUrl, nUrl) {
                        $(el).attr('src', nUrl);
                        var reg =new RegExp(oUrl, 'g');
                        cssCon = cssCon.replace(reg, nUrl);
                    })
                    $(el).html(cssCon);
                };
            });
            // 兼容st编辑器，多个中线注释会出错
            var fileData = $.html().replace(/<!--/g, '<!-- ').replace(/-->/g, ' -->');
            iconv.encode(fileData, reqConfig.encoding);
            // 转码
            fs.writeFile(webConfig.downDir + webConfig.fileName, fileData, function(err) {
                if (err) {
                    cb(err);
                } else {
                    console.log(webConfig.downDir + webConfig.fileName + ' created');
                };
            })

            cb(null, webConfig, source);
        }

        var downSource = function(webConfig, source, cb) {
            var taskUrls = [];

            for (i in rUrls) {
                taskUrls.push({
                    rUrl: i,
                    nUrl: rUrls[i]
                });
            }
            async.eachSeries(taskUrls, function(item, callback) {
                    request(item.rUrl, function(err, response, fileData) {
                        if (err) {
                            callback(err);
                        } else {
                            console.log(webConfig.downDir + item.nUrl + ' created');
                            callback();
                        };
                    }).pipe(fs.createWriteStream(webConfig.downDir + item.nUrl))
                }, function(err) {
                    if (err) {
                        console.error("error");
                    }
                })
        }

        async.waterfall([
                processCon,
                req,
                processHtml/*,
                downSource*/
            ],
            function(err, result) {
                if (err) {
                    callback(err);
                } else {

                    // open
                    // require('child_process').exec('explorer ' + result.downDir);
                    // console.log(result);;
                };
            });
        

    })

    gulp.task('processcss', function() {
        request('http://js.soufunimg.com/homepage/new/fang905bj/newsV3/style/www_css20151012V1.css', function(err, response, fileData) {
            if (err) {
                console.log(err);
            } else {
                processUrls(fileData.match(urlsRegexp), 'http://js.soufunimg.com/homepage/new/fang905bj/newsV3/style/')
                console.log(rUrls);
                console.log(oUrls);
            };
        })
    })
    /**
     * 处理链接地址
     * @param  {array} urls    要处理的链接
     * @param  {string} baseUrl 基本地址
     * @return {json}         {原地址:下载地址}
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
                        fDirname = 'font/';
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

    /**
     * 解析css源码并提取附件
     * @param  {stream} data    css流
     * @param  {string} baseUrl css文件地址
     * @return {null}         
     */
     /*function parseCss(data, rBaseUrl) {
        // var urlsRegexp = /^url\(["'"]?\s*|\s*["']?\)$/g,
        // var urlsRegexp = /url\((.+).(?:png|png\?.+|jpg|jpg\?.+|jpeg|jpeg\?.+|bmp|gif|gif\?.+)\)/ig,
        var urlsRegexp = /url\(.+?\)/ig,
            aUrls = data.match(urlsRegexp)
            return processUrls(aUrls, rBaseUrl);
       aImgUrls && aImgUrls.forEach(function(uri1, i) {
            if (!hash[uri1] && uri1.indexOf(config.cssLogo) != -1) {
                // console.log(uri1 + '----------');
                uri1 = uri1.replace(/url\(('|"|)|('|"|)\)/g, '').split('?')[0];

                var imgName = $$.path.basename(uri1);
                hash[uri1] = true;
                
                // console.log($$.path.dirname(uri).replace('css', '') + e.replace('../', ''));
                if (uri1.indexOf('http') == -1) {
                    if (!dirHash[$$.path.dirname(uri1)]) dirHash[$$.path.dirname(uri1)] = true;
                    uri1 = url.resolve(uri, uri1);
                } else {
                    var hurl = uri1.replace(imgName, '');
                    if (!dirHash[hurl]) dirHash[hurl] = true;
                }

                request(uri1, function(err, res, body) {
                        if (err) {
                            console.log('4:' + err + ':' + uri1);
                        }
                    })
                    .pipe($$.fs.createWriteStream(webName + '/images/' + imgName))
                    .on('close', function() {
                        console.log(webName + '/images/' + imgName + ' created cssimg');
                    });
            }
        })

        for (i in dirHash) {
            if (i.indexOf('fonts')) {return;};
            data = data.replace(new RegExp(i, "gm"), '../images/');
        }
    }*/
};