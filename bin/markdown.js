module.exports = function(gulp, $, utils, configs) {
    var path = require('path'),
        fs = require('fs-extra'),
        argv = $.yargs.argv,
        files = [],
        tree = {},
        // 存储搜索数据
        searchableDocuments = {},
        // 处理一次js保存起来后面用
        markdownData = [];
    var hasReadme;
    // 初始化swig
    $.swig(configs.swig);
    // 扩展fs方法
    fs.removeGlobSync = function(glob) {
        var files = $.glob.sync(glob);
        files.forEach(function(file) {
            fs.removeSync(file);
        });
    };

    var getBaseName = function(oFile) {
        var filepath = oFile.filepath;
        var description = oFile.description;
        var ext = path.extname(filepath),
            basename = (description || '') + path.basename(filepath);
        if (/\.(twig|scss|js)/.test(ext)) {
            var aDirs = path.join(path.dirname(filepath), '/').split(path.sep);
            aDirs.forEach(function(elem) {
                if (/(\w+)Bundle/.test(elem)) {
                    basename = RegExp.$1 + '-' + basename;
                }
            });
        } else if (ext == '.md') {
            basename = basename.replace(/\.md$/, '');
        }
        return basename;
    };
    var processTree = function(oFile) {
        var file = oFile.filepath;
        var contents = oFile.contents;
        var extname = path.extname(file);
        var basename = getBaseName(oFile);
        var dir;
        var cur = [];

        // 菜单分类命名
        switch (extname) {
            case '.scss':
                dir = 'SCSS文档';
                break;
            case '.js':
                dir = 'JS文档';
                break;
            default:
                dir = path.basename(path.dirname(file));
        }


        if (contents && basename != 'readme') {
            if (tree[dir]) {
                cur = cur.concat(tree[dir]);
            }
            if (cur.indexOf(basename) == -1) {
                cur.push(basename);
            }
            tree[dir] = cur;
            searchableDocuments[basename + '.html'] = {
                id: basename + '.html',
                title: basename,
                body: $.htmlToText.fromString(contents.toString(), {
                        wordwrap: 130
                    }),
            };
        }
        
    };
    // 排序
    var objSort = function (old) {
        if (typeof(old) !== 'object' || old === null) {
            return old;
        }
        var copy = Array.isArray(old) ? [] : {};
        var keys = Object.keys(old).sort();
        keys.forEach(function(key) {
            var v = old[key];
            copy[key] = objSort(Array.isArray(v) ? v.sort() : v);
        });
        return copy;
    };

    // 主体开始
    var _p = argv.p;

    if (!_p) {
        console.log('err:需要指定路径！');
        return;
    }
    var APS = [_p];

    if (argv.pEx) {
        APS = APS.concat(argv.pEx.split(','));
    }

    var aType = argv.type && argv.type.split(',') || [];
    // 没有type, 把目录给type，继续往下走
    if (!aType.length) {
        aType = APS;
    }
    // 要取的文件的对象
    var oGlobs = {
        md: '**/doc/**/*.md',
        twig: '**/Macro/*.twig',
        scss: '**/@(mixins|inherit)/*.scss',
        js: '**/src/**/*.js',
        img: '**/doc/**/*.{png,gif,jpg,jpeg}'
    };

    var sIgnore = '**/@(vendor|.git|static|_seajs|_sm|public)/**';
    var oldFileNum = 0;
    
    var getRelPath = function(f) {
        var _relPath;
        aType.forEach(function(t) {
            if (f.indexOf(t.normal()) != -1) {
                _relPath = path.relative(t, f).normal();
            }
        });
        return _relPath;
    };
    // 先清除html
    gulp.task('markdown:clean', function(cb) {
        fs.removeGlobSync(_p + '/docs/*.{html,htm}');
        cb();
    });

    gulp.task('markdown:files', function(cb) {
        aType.forEach(function(t) {
            if (oGlobs[t]) {
                // 按类型 js
                APS.forEach(function(p) {
                    files = files.concat($.glob.sync(path.join(p, oGlobs[t]), {
                                ignore: path.join(p, sIgnore)
                            }));
                });
            } else if (path.extname(t)) {
                // 按地址
                files.push(t);
            } else {
                // js 有地址里有src，glob里去掉src
                if (t.normal().indexOf('/src') == -1) {
                    oGlobs.js = '**/src/**/*.js';
                } else {
                    oGlobs.js = '**/*.js';
                }
                if (t.normal().indexOf('/doc') == -1) {
                    oGlobs.md = '**/doc/**/*.md';
                    oGlobs.img = '**/doc/**/*.{png,gif,jpg,jpeg}';
                } else {
                    oGlobs.md = '**/*.md';
                    oGlobs.img = '**/*.{png,gif,jpg,jpeg}';
                }
                // 按目录
                for (k in oGlobs) {
                    files = files.concat($.glob.sync(path.join(t, oGlobs[k]), {
                                ignore: path.join(t, sIgnore)
                            }));
                }
            }
        });
        // console.log(files);
        // return false;
        cb();
    });

    gulp.task('markdown:tree', ['markdown:clean', 'markdown:files'], function() {
        var stream = $.mergeStream();
        oldFileNum = files.length;
        files.forEach(function(file) {
            var ext = path.extname(file);
            var basename = path.basename(file, ext);
            // 随便一个stream, 为了能继续向下执行
            stream.add(gulp.src('./src/libs/demo.html'));
            if (/\.(twig|scss|js)/.test(ext)) {
                stream.add(gulp.src(file)
                    // .pipe($.changed(path.join(_p 'docs'), {extension: '.html'}))
                    .pipe($.plumber(function(err) {
                        console.log('\n');
                        console.log('文件内容错误：' + file);
                        console.log(err.plugin);
                        console.log(err.message);
                        console.log('\n');
                    }))
                    // 抓取markdown内容 js先加进来，有问题再去掉
                    .pipe($.if(/\.(twig|scss|js)/.test(ext), $.through2.obj(function(file2, encoding, done) {
                        var contents = file2.contents.toString();
                        if (contents) {
                            if (/@description\s+(\S+)\s/.test(contents)) {
                                // 保存描述
                                file2.description = RegExp.$1;
                            }
                            var aContents = contents.match(/\/\*\*([\s\S]*?)\*\//g);
                            if (aContents) {
                                var newContents = aContents.join('\n').replace(/@(include|extend)/, '@ $1');
                                file2.contents = new Buffer(newContents);
                            } else {
                                file2.contents = new Buffer('a');
                            }
                        }
                        // 重命名
                        // file2.path = file2.path.replace(/\.scss$|\.twig$/, '.js')
                        this.push(file2);
                        done();
                    })))
                    .pipe($.if(/\.(js|scss)/.test(ext), $.swig({
                        data: {
                            name: basename,
                            author: argv.a
                        }
                    })))
                    .pipe($.jsdocToMarkdown({
                        template: '{{>main}}'
                    }))
                    .pipe($.through2.obj(function(file2, encoding, done) {
                        var contents = file2.contents;
                        // console.log(contents.length, contents.toString());
                        if (contents.length) {
                            console.log(file);
                            var oFile = {
                                contents: contents,
                                filepath: file,
                                description: file2.description
                            };
                            markdownData.push(oFile);
                            processTree(oFile);
                        } else {
                            // 删除没有内容的文件
                            console.log(file, 'removed!');
                        }
                        done();
                    })));
            } else if (ext == '.md') {
                var contents = fs.readFileSync(file);
                if (contents.length) {
                    console.log(file);
                    var oFile = {
                        contents: contents,
                        filepath:  file
                    };
                    markdownData.push(oFile);
                    processTree(oFile); //搜索用
                } else {
                    // 删除没有内容的文件
                    console.log(file, 'removed!');
                }
            } else if (/\.(png|gif|jpe?g)/.test(ext)) {
                var dist = path.join(_p, 'docs/images');
                gulp.src(file, {base: path.dirname(file)})
                    .pipe($.changed(dist))
                    // .pipe($.imagemin(configs.imagemin))
                    .pipe(gulp.dest(dist));
                // 删除
                console.log(file, 'removed!');
            }
        });
        return stream;
    });
    // markdown
    gulp.task('markdown', ['markdown:tree'], function() {
        // console.log(files);
        // console.log(markdownData);
        console.log('共处理', markdownData.length + '/' + oldFileNum, '个文件！');
        var _p = argv.p;
        // 复制resources
        gulp.src('./tpl/markdown/*/**')
            .pipe($.changed(path.join(_p, 'docs')))
            .pipe(gulp.dest(path.join(_p, 'docs')));
        // 搜索文件
        gulp.src('./tpl/markdown/quicksearch.html')
            .pipe($.plumber())
            .pipe($.swig({
                data: {
                    searchableDocuments: JSON.stringify(searchableDocuments)
                }
            }))
            .pipe(gulp.dest(path.join(_p, 'docs')));
        // 整理顺序
        tree = objSort(tree);
        // 添加封面
        markdownData.push({
            contents: new Buffer('cover'),
            filepath: 'index'
        })

        // 生成每个文件
        markdownData.forEach(function(oFile) {
            var filename = getBaseName(oFile);
            var dataFun = function(file1, cb1) {
                    var contents = oFile.contents.toString()
                            .replace(/@ (include|extend)/, '@$1');
                            
                    if (contents) {
                        cb1(undefined, {
                            contents: $.marked(contents),
                            filepath: getRelPath(oFile.filepath),
                            title: filename,
                            tree: tree
                        });
                    }
                },
                dist;

            dist = path.join('docs/', filename + '.html');
            gulp.src('./tpl/markdown/index.html')
                .pipe($.plumber())
                .pipe($.data(dataFun))
                .pipe($.swig())
                .pipe($.rename(dist))
                .pipe(gulp.dest(_p));
        });
    });

};