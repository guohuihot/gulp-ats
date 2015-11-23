module.exports = function(gulp, $$, config) {
    gulp.task('webdown', function(cb) {
        var request = require('request');
        var cheerio = require('cheerio');
        var iconv = require('iconv-lite');
        var url = require('url');
        // 基本配置项
        var optionsBase = config.webdown;
        if (!$$.argv.config) {
            cb('请设置要下载的网址！ 命令：gulp webdown --config="<您的网址>, <下面的页面名>"\n');
        };
        var args = $$.argv.config.split(',');
        // request请求配置
        var options = {
            url: args[0], //要下载的网址
            gzip: true, //是否开启gzip
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36'
            },
            encoding: null
        };

        var urlParse = url.parse(options.url);
        var webName = 'down/' + urlParse.hostname;
        var baseUrl = urlParse.protocol + '//' + urlParse.host + '/';
        // open
        require('child_process').exec('open' + webName);
        
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                optionsBase.encoding = 'utf8';
                var arr = body.toString().match(/<meta([^>]*?)>/g);
                if (arr) {
                    arr.forEach(function(val) {
                        var match = val.match(/charset\s*=\s*(.+)\"/);
                        if (match && match[1]) {

                            if (match[1].substr(0, 1) == '"') match[1] = match[1].substr(1);
                            if (match[1].indexOf('"') > 0) match[1] = match[1].substr(0, match[1].indexOf('"'));

                            optionsBase.encoding = match[1].trim();
                            return false;
                        }
                    })
                }
                if (optionsBase.debug) console.log(optionsBase.encoding);
                // 创建目录
                mkBaseDir();
                // 对数据进行转码
                body = iconv.decode(body, optionsBase.encoding);
                // 同时数据处理
                acquireData(body);
            }
        }

        request(options, callback);

        // 处理数据
        function acquireData(data) {
            // console.log(data);
            var $ = cheerio.load(data, {
                decodeEntities: false //关闭转换实体编码的功能
            });

            $('link[rel="stylesheet"]').each(function(i, el) {
                var $source = $(el).attr('href').split('?')[0];
                download($source);
                console.log($$.path + '/////////////');
                $(el).attr('href', 'css/' + $$.path.basename($source));
            });

            $('script[src]').each(function(i, el) {
                var $source = $(el).attr('src'),
                    isRequireFile = true;

                optionsBase.ignore.forEach(function(e, i) {
                    if ($source.indexOf(e) != -1) {
                        $(el).remove();
                        isRequireFile = false;
                    }
                })
                if (isRequireFile) {
                    download($source);
                    $(el).attr('src', 'js/' + $$.path.basename($source));
                }
            });
            $('img').each(function(i, el) {
                var $source = $(el).attr('src');
                if (!$source) return;
                isRequireFile = true;
                optionsBase.ignore.forEach(function(e, i) {
                        if ($source.indexOf(e) != -1) isRequireFile = false;
                    })
                    // console.log($source);
                if (!isRequireFile) return;
                if (optionsBase.conLogo && $source.indexOf(optionsBase.conLogo) != -1) {
                    download($source, 1);
                    $(el).attr('src', 'pic/' + $$.path.basename($source));
                } else {
                    download($source);
                    $(el).attr('src', 'images/' + $$.path.basename($source));
                }
            });
            // 去掉内容里的链接
            $('a').each(function(i, el) {
                var href = $(el).attr('href');
                if (href && href.indexOf('java') == -1) {
                    $(el).attr('href', '###');
                }
            });
            // 兼容st编辑器，多个中线注释会出错
            var fileData = $.html().replace(/<!--/g, '<!-- ').replace(/-->/g, ' -->'),
                filePath = webName + '/' + args[1] + '.html';
            // 解析内联css
            $('style').each(function(i, el) {
                parseCss($(el).html(), baseUrl, function(cssData1) {
                    $(el).html(cssData1)
                });
            });

            fileData = iconv.encode(fileData, optionsBase.encoding);
            // 创建html文件
            $$.fs.writeFile(filePath, fileData, function(err) {
                if (err) {
                    console.log('1:' + err);
                } else {
                    console.log(args[1] + '.html created');
                };
            })

        }

        function mkBaseDir() {
            aFolder = ['css', 'js', 'pic', 'images'];

            aFolder.forEach(function(e, i) {
                mkdir(webName + '/' + e);
                console.log('Dir ' + webName + '/' + e + ' created');
            })
        }

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
                if (!hash[uri1] && uri1.indexOf(optionsBase.cssLogo) != -1) {
                    // console.log(uri1 + '----------');
                    uri1 = uri1.replace(/url\(('|"|)|('|"|)\)/g, '').split('?')[0];

                    var imgName = $$.path.basename(uri1);
                    hash[uri1] = true;
                    // return;
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
        /**
         * 创建文件目录
         * @param  {[type]} dirpath [description]
         * @param  {[type]} dirname [description]
         * @return {[type]}         [description]
         */
        function mkdir(dirpath, dirname) {
            //判断是否是第一次调用  
            if (typeof dirname === "undefined") {
                if ($$.fs.existsSync(dirpath)) {
                    return;
                } else {
                    mkdir(dirpath, $$.path.dirname(dirpath));
                }
            } else {
                //判断第二个参数是否正常，避免调用时传入错误参数  
                if (dirname !== $$.path.dirname(dirpath)) {
                    mkdir(dirpath);
                    return;
                }
                if ($$.fs.existsSync(dirname)) {
                    $$.fs.mkdirSync(dirpath)
                } else {
                    mkdir(dirname, $$.path.dirname(dirname));
                    $$.fs.mkdirSync(dirpath);
                }
            }
        }
    })

};