module.exports = function(gulp, $, utils) {
    var path = require('path'),
        fs = require('fs'),
        configs = require('../configs'),
        argv = $.yargs
        .alias({
            path    : 'p',
            author  : 'a',
            custom  : 'c',
            libs    : 'l',
            dev     : 'd',
            server  : 's',
            open    : 'o',
            ftp     : 'f',
            reverse : 'r',
            mode    : 'm',
            tpl     : 't'
        }).argv,
        files = [],
        tree = {},
        // 存储搜索数据
        searchableDocuments = {},
        // 处理一次js保存起来后面用
        markdownData = {};

    var getBaseName = function(filePath) {
        var extname = path.extname(filePath),
            basename = path.basename(filePath, extname).replace('.html', '');

        if ({'.twig': 1, '.scss': 1, '.js': 1}[extname]) {
            var aDirs = path.join(path.dirname(filePath), '/').split(path.sep);
            aDirs.forEach(function(elem) {
                var eIndex = elem.indexOf('Bundle');
                if (eIndex != -1) {
                    basename = elem.slice(0, eIndex) + '-' + basename + extname;
                }
            });
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
                body: $.htmlToText.fromString(contents, {
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
        $.del([
            _p + '/docs/*.html',
            '!' + _p
        ], {
            force: true
        }, cb);
    })

    gulp.task('copy-img', function() {
        var stream = $.mergeStream();
        var _p = argv.p;
        var APS = [_p];
        var imgs = [];
        argv.pEx && APS.push(argv.pEx);

        APS.forEach(function(p) {
            imgs = imgs.concat($.glob.sync(path.join(p, '!(vendor)/**/doc/**/*.{png,gif,jpg,jpeg}')));
        })
        imgs.forEach(function(file) {
            stream.add(gulp.src(file, {base: path.dirname(file)})
                            .pipe($.changed(path.join(_p, 'docs/images')))
                            .pipe($.imagemin(configs.imagemin))
                            .pipe(gulp.dest(path.join(_p, 'docs/images'))))
        });
        
    })

    var aTasks = ['clean-markdown']
    // type存在时不处理图片
    var _type = argv.type;
    if (!_type) {
        aTasks.push('copy-img');
    };

    gulp.task('tree', aTasks, function() {
        var _p = argv.p;
        var APS = [_p];
        var stream = $.mergeStream();
        argv.pEx && APS.push(argv.pEx);
        // 要取的文件的对象
        var oTypes = {
            md: '/!(vendor)/**/doc/**/!(README).md',
            // md: '/!(vendor)/**/doc/**/*.md',
            twig: '/**/Macro/*.twig',
            scss: '/**/{mixins,inherit}/*.scss',
            js: '/!(vendor|.git)/**/src/**/!(static|seajs|_seajs)/*.js' 
        }

        APS.forEach(function(p) {
            if (_type) {
                // 只处理指定类型
                _type.split(',').forEach(function(t) {
                    if (oTypes[t]) {
                        // 按类型
                        files = files.concat($.glob.sync(path.join(p, oTypes[t])));
                    } else if (path.extname(t)) {
                        // 按网址
                        files.push(t);
                    } else {
                        // 按目录
                        files = files.concat($.glob.sync(path.join(t, '**/*.{md,twig,scss,js}')));
                    }
                });
            } else {
                // 处理所有目录
                for (prop in oTypes) {
                    if (oTypes.hasOwnProperty(prop)) {
                        if (prop == 'js') {
                            files = files.concat($.glob.sync(path.join(p, oTypes[prop]), {ignore: path.join(p, '/**/vendor/**/*.js')}));
                        } else {
                            files = files.concat($.glob.sync(path.join(p, oTypes[prop])));
                        }
                    }
                }
            }
        })
        // console.log(files);
        files.forEach(function(file) {
            var ext = path.extname(file);
            if ({'.js': 1, '.twig': 1, '.scss': 1}[ext]) {
                stream.add(gulp.src(file)
                    // .pipe($.changed(path.join(_p 'docs'), {extension: '.html'}))
                    .pipe($.plumber(function(err) {
                        console.log('###########################################');
                        console.log(err.plugin);
                        console.log(err.message);
                        console.log('文件内容错误：' + file);
                        console.log('###########################################');
                    }))
                    .pipe($.if({'.twig': 1, '.scss': 1}[ext], $.through2.obj(function(file2, encoding, done) {
                        var contents = String(file2.contents);
                        if (contents) {
                            var newContents = contents.match(/\/\*\*([\s\S]*?)\*\//g);
                            if (newContents) {
                                newContents = newContents.join('\n');
                                if (ext == '.scss') {
                                    // console.log(newContents);
                                    // scss简单过滤下
                                    newContents = newContents.replace(/\/\//g, '');
                                };
                                file2.contents = new Buffer(newContents);
                            } else {
                                file2.contents = new Buffer('a');
                            }
                        }
                        this.push(file2);
                        done();
                    })))
                    .pipe($.if({'.twig': 1, '.scss': 1}[ext], $.rename({extname: '.js'})))
                    // .pipe($.if(ext == '.twig', gulp.dest(argv.p + '/bbb')))
                    .pipe($.jsdocToMarkdown({
                        template: "{{>main}}"
                    }))
                    .pipe($.through2.obj(function(file2, encoding, done) {
                        var contents = String(file2.contents);
                        if (contents) {
                            console.log(file);
                            var fileName = getBaseName(file);

                            markdownData[fileName] = file2.contents;
                            processTree(file, contents);
                        } else {
                            files.splice(files.indexOf(file), 1)
                        }
                        done();
                    })));
            } else {
                // 随便一个stream, 为了能继续向下执行
                stream.add(gulp.src('./gulp/markdown/quicksearch.html'));
            }
        })
        return stream;
    })
    // markdown
    gulp.task('markdown', ['tree'], function() {
        var _p = argv.p;
        // 处理树结构
        files.forEach(function(file) {
            if (path.extname(file) == '.md') {
                processTree(file, String(fs.readFileSync(file)));
            }
        });
        // 复制resources
        gulp.src('./gulp/markdown/*/**')
            .pipe($.changed(path.join(_p, 'docs')))
            .pipe(gulp.dest(path.join(_p, 'docs')));
        // 搜索文件
        gulp.src('./gulp/markdown/quicksearch.html')
            .pipe($.plumber())
            .pipe($.template({
                searchableDocuments: JSON.stringify(searchableDocuments)
            }))
            .pipe(gulp.dest(path.join(_p, 'docs')));
        // 整理顺序
        tree = objSort(tree);
        // 生成每个文件
        files.push(path.join(argv.p, 'Resources/doc/readme.md'));
        files.forEach(function(file) {
            var basename = getBaseName(file),
                renderer = new $.marked.Renderer();

            var dataFun = function(file1, cb1) {
                    gulp.src(file)
                        .pipe($.plumber())
                        .pipe($.if(utils.hasProp(['.js', '.twig', 'scss']), $.rename({
                            extname: '.md'
                        })))
                        // .pipe($.changed(path.join(argv.p, 'docs'), {extension: '.html'}))
                        .pipe($.through2.obj(function(file2, encoding, done) {
                            var contents;

                            file2.contents = markdownData[basename] || file2.contents;
                            contents = String(file2.contents);
                            contents = $.marked(contents);
                            if (contents) {
                                cb1(undefined, {
                                    contents: contents,
                                    update: $.moment().format('YYYY-MM-DD HH:mm:ss'),
                                    title: basename,
                                    tree: tree
                                });
                            }
                            done();
                        }));
                },
                dist;

            dist = path.join('docs/', basename == 'readme' ? 'index.htm' : basename + '.html');
            gulp.src('./gulp/markdown/index.html')
                .pipe($.plumber())
                .pipe($.data(dataFun))
                .pipe($.template())
                .pipe($.rename(dist))
                .pipe(gulp.dest(_p));
        });
    });

};