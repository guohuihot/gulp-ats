module.exports = function(gulp, $, utils, configs) {
    var path = require('path'),
        fs = require('fs-extra'),
        argv = $.yargs.argv,
        files = [],
        tree = {},
        // 存储搜索数据
        searchableDocuments = {},
        // 处理一次js保存起来后面用
        markdownData = {};

    // 初始化swig
    $.swig(configs.swig);
    // 扩展fs方法
    fs.removeGlobSync = function(glob) {
        var files = $.glob.sync(glob);
        files.forEach(function(file) {
            fs.removeSync(file);
        });
    }

    var getBaseName = function(filePath) {
        var ext = path.extname(filePath),
            basename = path.basename(filePath);
        if (/\.(twig|scss|js)/.test(ext)) {
            var aDirs = path.join(path.dirname(filePath), '/').split(path.sep);
            aDirs.forEach(function(elem) {
                if (/(\w+)Bundle/.test(elem)) {
                    basename = RegExp.$1 + '-' + basename;
                }
            });
        } else if (ext == '.md') {
            basename = basename.replace(/\.md$/, '');
        }
        return basename;
    }

    var processTree = function(file, contents) {
        var extname = path.extname(file),
            basename = getBaseName(file),
            cur = [];

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


        if (contents) {
            if (tree[dir]) {
                cur = cur.concat(tree[dir]);
            }
            if (cur.indexOf(basename) == -1) {
                cur.push(basename)
            }
            tree[dir] = cur;
            searchableDocuments[basename + '.html'] = {
                id: basename + '.html',
                title: basename,
                body: $.htmlToText.fromString(contents.toString(), {
                        wordwrap: 130
                    }),
            }
        }
        
    }
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
    }
    // 复制图片
    var copyImg = function() {
        
    }
    // 先清除html
    gulp.task('clean-markdown', function(cb) {
        var _p = argv.p;
        if (!_p) {
            console.log('err:需要指定路径！');
            return;
        };
        fs.removeGlobSync(_p + '/docs/*.html')
        cb();
    })


    var _p = argv.p;
    var APS = [_p];

    if (argv.pEx) {
        APS = APS.concat(argv.pEx.split(','));
    };

    var aType = argv.type && argv.type.split(',') || [];
    // 没有type, 把目录给type，继续往下走
    if (!aType.length) {
        aType = APS;
    }

    // 要取的文件的对象
    var oGlobs = {
        md: '**/doc/**/!(README).md',
        twig: '**/Macro/*.twig',
        scss: '**/@(mixins|inherit)/*.scss',
        js: '**/*.js',
        img: '**/doc/**/*.{png,gif,jpg,jpeg}'
    }

    var sIgnore = '**/@(vendor|.git|public|static|_seajs|_sm)/**';

    gulp.task('tree', ['clean-markdown'], function() {
        var stream = $.mergeStream();

        aType.forEach(function(t) {
            if (oGlobs[t]) {
                // 按类型 js
                APS.forEach(function(p) {
                    files = files.concat($.glob.sync(path.join(p, oGlobs[t]), {ignore: path.join(p, sIgnore)}));
                });
            } else if (path.extname(t)) {
                // 按地址
                files.push(t);
            } else {
                // 按目录
                for (k in oGlobs) {
                    files = files.concat($.glob.sync(path.join(t, oGlobs[k]), {ignore: path.join(t, sIgnore)}));
                }
            }
        });
        // console.log(files);
        // return false;
        // 加入readme
        var readmePath = path.join(argv.p, 'Resources/doc/readme.md');
        if (fs.existsSync(readmePath)) {
            files.push(readmePath);
        }

            console.log(files);
            return false;
        files.forEach(function(file) {
            var ext = path.extname(file);
            var fileName = getBaseName(file);
            // 随便一个stream, 为了能继续向下执行
            stream.add(gulp.src('./src/libs/demo.html', {read: false}));
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
                    .pipe($.if({'.twig': 1, '.scss': 1, '.js': 1}[ext], $.through2.obj(function(file2, encoding, done) {
                        var contents = String(file2.contents);
                        if (contents) {
                            var newContents = contents.match(/\/\*\*([\s\S]*?)\*\//g);
                            if (newContents) {
                                newContents = newContents.join('\n').replace(/@(include|extend)/, '@ $1');
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
                    /*.pipe($.if(/\.(js|scss)/.test(ext), $.swig({
                        data: {
                            name: basename,
                            author: argv.a
                        }
                    })))*/
                    // 调试用
                    /*.pipe($.through2.obj(function(file2, encoding, done) {
                        var contents = String(file2.contents);
                        console.log(contents);
                        this.push(file2);
                        done();
                    }))*/
                    .pipe($.jsdocToMarkdown({
                        template: "{{>main}}"
                    }))
                    .pipe($.through2.obj(function(file2, encoding, done) {
                        var contents = file2.contents;
                        if (contents) {
                            console.log(file);
                            markdownData[fileName] = contents;
                            processTree(file, contents);
                        } else {
                            // 删除没有内容的文件
                            files.splice(files.indexOf(file), 1)
                        }
                        done();
                    })));
            } else if (ext == '.md') {
                var mdData = fs.readFileSync(file);

                markdownData[fileName] = mdData;
                processTree(file, mdData); //搜索用
            } else if (/\.(png|gif|jpg|jpeg)/.test(ext)) {
                files.splice(files.indexOf(file), 1)
                var dist = path.join(_p, 'docs/images');
                gulp.src(file, {base: path.dirname(file)})
                    .pipe($.changed(dist))
                    // .pipe($.imagemin(configs.imagemin))
                    .pipe(gulp.dest(dist))
                // 删除
            }
        })
        return stream;
    })
    // markdown
    gulp.task('markdown', ['tree'], function() {
        return false;
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
        // 生成每个文件
        files.forEach(function(file) {
            var basename = getBaseName(file);

            var dataFun = function(file1, cb1) {
                    contents = markdownData[basename].toString()
                                .replace(/@ (include|extend)/, '@$1');
                    if (contents) {
                        cb1(undefined, {
                            contents: $.marked(contents),
                            title: basename,
                            tree: tree
                        });
                    }
                },
                dist;

            dist = path.join('docs/', /readme/.test(basename) ? 'index.htm' : basename + '.html');
            gulp.src('./tpl/markdown/index.html')
                .pipe($.plumber())
                .pipe($.data(dataFun))
                .pipe($.swig())
                .pipe($.rename(dist))
                .pipe(gulp.dest(_p));
        });
    });

};