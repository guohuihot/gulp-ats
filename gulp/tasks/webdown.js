module.exports = function(gulp, $$, utils) {
    var request = require('request'),
        cheerio  = require('cheerio'),
        iconv    = require('iconv-lite'),
        url      = require('url'),
        fs       = require('fs'),
        jsonFile = require('json-file-plus'),
        extend   = require('node.extend');

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
        var processUrl = function(uri) {
            if (!uri) {
                return;
            };
            uri = uri.split('?')[0];
            if (uri.indexOf('http') != 0) {
                uri = webConfig.hostUrl + uri;
            }
            return {
                url: uri,
                fileName: uri.split('/').pop()
            };
        }
        // processHtml
        var processHtml = function(data, reqConfig, webConfig, cb) {
            var $ = cheerio.load(data, {
                decodeEntities: false //关闭转换实体编码的功能
            }),
            source = {
                css: [],
                js: [],
                images: [],
                pic: []
            };

            $('link[rel="stylesheet"]').each(function(i, el) {
                var oUrl = processUrl($(el).attr('href'));
                source.css.push(oUrl.url);
                $(el).attr('href', 'css/' + oUrl.fileName)
            });
            $('script[src]').each(function(i, el) {
                var oUrl = processUrl($(el).attr('src'));
                source.js.push(oUrl.url);
                $(el).attr('src', 'js/' + oUrl.fileName)
            });

            $('img').each(function(i, el) {
                var oUrl = processUrl($(el).attr('src'));
                if (oUrl && oUrl['url'].indexOf(webConfig.pic) != -1) {
                    source.pic.push(oUrl.url);
                    $(el).attr('src', 'pic/' + oUrl.fileName)
                } else if (oUrl) {
                    source.images.push(oUrl.url);
                    $(el).attr('src', 'images/' + oUrl.fileName)
                };
            });

            // 去掉内容里的链接
            $('a').each(function(i, el) {
                var href = $(el).attr('href');
                if (href && href.indexOf('java') == -1) {
                    $(el).attr('href', '###');
                }
            });
            // 解析内联css
            $('style').each(function(i, el) {
                /*parseCss($(el).html(), baseUrl, function(cssData1) {
                    $(el).html(cssData1)
                });*/
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
            // ['images'].forEach(function(e, i) {
            ['js','css','images','pic'].forEach(function(e, i) {
                    if (e == 'images') {
                        console.log(source.images);
                        return false;
                    }
                async.eachSeries(source[e], function(item, callback) {
                    var fileName = webConfig.downDir + e + '/' + item.split('/').pop();
                    request(item, function(err, response, fileData) {
                        if (err) {
                            callback(err);
                        } else {
                            console.log(fileName + ' created');
                            if (e == 'css') {
                                source.images.concat(process(fileData, webConfig));
                            };
                            callback();
                        };
                    }).pipe(fs.createWriteStream(fileName))
                }, function(err) {
                    console.log(err);
                })  
            })  
        }

        async.waterfall([
                processCon,
                req,
                processHtml,
                downSource
            ],
            function(err, result) {
                if (err) {
                    callback(err);
                } else {

                    // open
                    require('child_process').exec('explorer ' + result.downDir);
                    console.log(result);;
                };
            });
        

    })

    gulp.task('processcss', function() {
        request('http://js.soufunimg.com/homepage/new/fang905bj/newsV3/style/www_css20151012V1.css', function(err, response, fileData) {
            if (err) {
                console.log(err);
            } else {
                parseCss(fileData)
            };
        })
    })


    /**
     * 解析css源码并提取附件
     * @param  {stream} data    css流
     * @param  {string} baseUrl css文件地址
     * @return {null}         
     */
    function parseCss(data, config) {
        // var urlsRegexp = /^url\(["'"]?\s*|\s*["']?\)$/g,
        // var urlsRegexp = /url\((.+).(?:png|png\?.+|jpg|jpg\?.+|jpeg|jpeg\?.+|bmp|gif|gif\?.+)\)/ig,
        var urlsRegexp = /url\(.+?\)/ig,
            aUrls = data.match(urlsRegexp),
            newUrls = [],
            hash = {},
            sameHash = {};
            // 过滤重复
            aUrls && aUrls.forEach(function(furl, i) {
                var urlParse = url.parse(furl.replace(/url\(('|"|)|('|"|)\)/g, '')),
                    fName;
                if (!hash[urlParse.href]) {
                    // 处理相同文件名
                    fName = path.basename(urlParse.pathname);
                    if (sameHash[fName]) {
                        urlParse.href
                    }
                    newUrls.push(urlParse.href)
                    sameHash[fName] = true;

                    hash[urlParse.href] = true;
                }
            })
            return false;
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
    }
};