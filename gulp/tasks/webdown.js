module.exports = function(gulp, $$, utils) {
    gulp.task('webdown', function(cb) {
        var request = require('request'),
            cheerio = require('cheerio'),
            iconv   = require('iconv-lite'),
            url     = require('url');
        var async = require('async');
        async.series([step1, step2, step3],
            function(err, values) {
                // do somethig with the err or values v1/v2/v3
            });


        // processUrl
        var processUrl = function(url) {
            url = url.split('?')[0].split('/').pop();
            return url;
        }

        var res = function(e, f) {
            var base = f.data;
            // 参数不存在返回错误信息
            if (!$$.argv.config) {
                cb('命令：' + base['help']['webdown']['content'] + '\n');
            };
            var args = $$.argv.config.split(','),
                urlParse = url.parse(args[0]),
                base = f.data,
                baseConfig = base['webdown'],
                resConfig = {
                    url: urlParse.href, //要下载的网址
                    gzip: true, //是否开启gzip
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36'
                    },
                    encoding: null
                },
                webConfig = {
                    baseUrl: urlParse.protocol + '//' + urlParse.host + '/',
                    downDir: (args[2] || baseConfig.dest) + '/' + urlParse.hostname
                };
            // 开始请求
            request(resConfig, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    resConfig.encoding = 'utf8';
                    var arr = body.toString().match(/<meta([^>]*?)>/g);
                    if (arr) {
                        arr.forEach(function(val) {
                            var match = val.match(/charset\s*=\s*(.+)\"/);
                            if (match && match[1]) {

                                if (match[1].substr(0, 1) == '"') match[1] = match[1].substr(1);
                                if (match[1].indexOf('"') > 0) match[1] = match[1].substr(0, match[1].indexOf('"'));

                                resConfig.encoding = match[1].trim();
                                return false;
                            }
                        })
                    }
                    // 对数据进行转码
                    body = iconv.decode(body, resConfig.encoding);
                    // 同时数据处理
                    acquireData(body, function (data) {
                        $$.fs.createWriteStream(webConfig.downDir + '/' + args[1])
                    });
                }
            });
            // 创建下载目录
            utils.mkdir(webConfig.downDir, baseConfig.src);
            // 设置目录 保存配置
            if (args[2]) {
                f.set({
                    "webdown": {
                        "dest": args[2],
                    }
                })
            };

            f.save();
        }

        $$.jsonFile('./gulp/base.json', res)

        // 处理数据
        var acquireData = function(data, cb) {
            // console.log(data);
            var $ = cheerio.load(data, {
                decodeEntities: false //关闭转换实体编码的功能
            }),
             aCss, aJs, aImages;

            $('link[rel="stylesheet"]').each(function(i, el) {
                aCss.push(processUrl($(el).attr('href')));
            });
            $('script[src]').each(function(i, el) {
                aJs.push( $(el).attr('src'));
            });

            $('img').each(function(i, el) {
                aImages.push( $(el).attr('src'));
            });
            // 去掉内容里的链接
            $('a').each(function(i, el) {
                var href = $(el).attr('href');
                if (href && href.indexOf('java') == -1) {
                    $(el).attr('href', '###');
                }
            });
            // 兼容st编辑器，多个中线注释会出错
            var fileData = $.html().replace(/<!--/g, '<!-- ').replace(/-->/g, ' -->');
            // 解析内联css
            $('style').each(function(i, el) {
                parseCss($(el).html(), baseUrl, function(cssData1) {
                    $(el).html(cssData1)
                });
            });

            cb.call(this, iconv.encode(fileData, config.encoding));
        }
        // open
        // require('child_process').exec('explorer ' + webName);
        /**
         * 下载文件
         * @param  {string}   uri      请求的url
         * @param  {string}   dirName  保存的路径
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        function download(uri, isCon, callback) {
            // return;
            uri = uri.split('?')[0];
            // console.log(uri); 处理像'//www.jqduang.com/aaa.css'这种链接
            if (uri.indexOf('//') == 0) {
                uri = 'http:' + uri;
            } else if (uri.indexOf('http') != 0) {
                uri = (uri.indexOf('/') == 0 ? baseUrl : options.url) + uri;
            }

            var dirName = webName + '/',
                extname = $$.path.extname(uri);

            if (/.(?:png|jpg|jpeg|bmp|gif)/.test(extname)) {
                dirName += isCon ? 'pic' : 'images';
            } else if (/.(?:css|js)/.test(extname)) {
                dirName += extname.replace('.', '').replace(' ', '');
            } else {
                return false;
            }
            request(uri, function(error, response, fileData) {
                if (!error && response.statusCode == 200) {
                    var fileName = $$.path.basename(uri).split('?')[0].replace(/ /g, '');
                    // 对css专项处理
                    if (extname == '.css') {
                        parseCss(fileData, uri, function(fileData1) {
                            // 创建文件
                            $$.fs.writeFile(dirName + '/' + fileName, fileData1, function(err) {
                                if (err) {
                                    console.log('1:' + err);
                                } else {
                                    console.log(dirName + '/' + fileName + ' created');
                                };
                            })
                        })
                    } else {
                        // 创建文件
                        $$.fs.writeFile(dirName + '/' + fileName, fileData, function(err) {
                            if (err) {
                                console.log('1:' + err);
                            } else {
                                console.log(dirName + '/' + fileName + ' created');
                            };
                        })
                    };
                } else {
                    console.log('3:' + error + ':' + uri);
                }
            });
        };
        /**
         * 解析css源码并提取附件
         * @param  {stream} data    css流
         * @param  {string} baseUrl css文件地址
         * @return {null}         
         */
        function parseCss(data, uri, callback) {
            var urlsRegexp = /url\((.+).(?:png|png\?.+|jpg|jpg\?.+|jpeg|jpeg\?.+|bmp|gif|gif\?.+)\)/ig,
                aImgUrls = data && data.match(urlsRegexp) || null,
                hash = {},
                dirHash = {};
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
            callback.call(this, data);

        }
    })

};