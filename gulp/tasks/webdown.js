module.exports = function(gulp, $$, utils) {
    gulp.task('webdown', function(cb) {
        var request = require('request'),
            cheerio = require('cheerio'),
            iconv   = require('iconv-lite'),
            base    = $$.jsonFile.read('./gulp/base.json'),
            config  = base.get('webdown'),
            url     = require('url');
        // 参数不存在返回错误信息
        if (!$$.argv.config) {
            cb('命令：' + base.get('help')['webdown']['content'] + '\n');
        };
        var args = $$.argv.config.split(',');
        // 设置目录
        /*if (args[2]) {
            base.set('webdow', args[2]);
        };*/
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
        // 下载目录
        var webName = $$.path.join(process.cwd(), (args[2] || config.dest) + '/' + urlParse.hostname);
        // hostname
        var baseUrl = urlParse.protocol + '//' + urlParse.host + '/';
        // 创建下载目录
        // console.log(webName);
        utils.mkdir(webName, config.src);
        // open
        // require('child_process').exec('explorer ' + webName);

        var requestCb = function(error, response, body) {
            if (!error && response.statusCode == 200) {
                config.encoding = 'utf8';
                var arr = body.toString().match(/<meta([^>]*?)>/g);
                if (arr) {
                    arr.forEach(function(val) {
                        var match = val.match(/charset\s*=\s*(.+)\"/);
                        if (match && match[1]) {

                            if (match[1].substr(0, 1) == '"') match[1] = match[1].substr(1);
                            if (match[1].indexOf('"') > 0) match[1] = match[1].substr(0, match[1].indexOf('"'));

                            config.encoding = match[1].trim();
                            return false;
                        }
                    })
                }
                if (config.debug) console.log(config.encoding);
                // 对数据进行转码
                body = iconv.decode(body, config.encoding);
                // 同时数据处理
                acquireData(body);
            }
        }

        request(options, requestCb);

        // 处理数据
        function acquireData(data) {
            // console.log(data);
            var $ = cheerio.load(data, {
                decodeEntities: false //关闭转换实体编码的功能
            }),
             aCss,aJs,aImages;

            $('link[rel="stylesheet"]').each(function(i, el) {
                aCss.push($(el).attr('href'));
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
            var fileData = $.html().replace(/<!--/g, '<!-- ').replace(/-->/g, ' -->'),
                filePath = webName + '/' + args[1] + '.html';
            // 解析内联css
            $('style').each(function(i, el) {
                parseCss($(el).html(), baseUrl, function(cssData1) {
                    $(el).html(cssData1)
                });
            });

            fileData = iconv.encode(fileData, config.encoding);
            // 创建html文件
            $$.fs.writeFile(filePath, fileData, function(err) {
                if (err) {
                    console.log('1:' + err);
                } else {
                    console.log(args[1] + '.html created');
                };
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