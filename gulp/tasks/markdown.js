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
        files,
        tree = {},
        // 存储搜索数据
        searchableDocuments = {},
        // 处理一次js保存起来后面用
        markdownData = {};

    var getBaseName = function(filePath) {
        var extname = path.extname(filePath),
            basename = path.basename(filePath, extname).replace('.html', '');

        if (extname == '.twig') {
            var aDirs = path.join(path.dirname(filePath), '/').split(path.sep);
            aDirs.forEach(function(elem) {
                if (elem.indexOf('Bundle') != -1) {
                    basename = elem + '-' + basename;
                }
            });
        }
        return basename;
    }

    var processTree = function(file, contents) {
        var extname = path.extname(file),
            basename = getBaseName(file);
            dir = extname == '.js' ? 'JS文档' : path.basename(path.dirname(file)),
            cur = [];

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
            copy[key] = objSort(old[key]);
        });
        return copy;
    }
    // 复制图片
    var copyImg = function() {
        
    }
    // 先清除html
    gulp.task('clean-markdown', function(cb) {
        if (!argv.p) {
            console.log('err:需要指定路径！');
            return;
        };

        $.del([
            argv.p + '/docs/*.html',
            '!' + argv.p
        ], {
            force: true
        }, cb);
    })

    gulp.task('copy-img', function() {
        var stream = $.mergeStream();
        var imgs = $.glob.sync(path.join(argv.p, '/!(vendor)/**/doc/**/*.{png,gif,jpg,jpeg}'))

        imgs.forEach(function(file) {
            stream.add(gulp.src(file, {base: path.dirname(file)})
                            .pipe($.imagemin(configs.imagemin))
                            .pipe(gulp.dest(path.join(argv.p, 'docs/images'))))
        });
        
    })

    gulp.task('tree', ['clean-markdown', 'copy-img'], function() {
        var stream = $.mergeStream();

        files = $.glob.sync(path.join(argv.p, '/!(vendor)/**/doc/**/!(README).md'))
        files = files.concat($.glob.sync(path.join(argv.p, '/**/Macro/*.twig')))
        files = files.concat($.glob.sync(path.join(argv.p, '/'+ (argv.dirs ? '@(' + argv.dirs + ')' : '!(vendor|.git)') +'/**/src/**/!(static|seajs|_seajs)/*.js'), {ignore: path.join(argv.p, '/**/vendor/**/*.js')}));
        // console.log(files);
        files.forEach(function(file) {
            var ext = path.extname(file);
            if ({'.js': 1, '.twig': 1}[ext]) {
                stream.add(gulp.src(file)
                    // .pipe($.changed(path.join(argv.p, 'docs'), {extension: '.html'}))
                    .pipe($.plumber(function(err) {
                        console.log('#####');
                        console.log(err.plugin);
                        console.log(err.message);
                        console.log('文件内容错误：' + file);
                        console.log('#####');
                    }))
                    .pipe($.if(ext == '.twig', $.through2.obj(function(file2, encoding, done) {
                        var contents = String(file2.contents);
                        if (contents) {
                            var newContents = contents.match(/\/\*\*([\s\S]*?)\*\//g);

                            if (newContents) {
                                newContents = newContents.join('\n');
                                file2.contents = new Buffer(newContents);
                            } else {
                                file2.contents = new Buffer('a');
                            }
                        }
                        this.push(file2);
                        done();
                    })))
                    .pipe($.if(ext == '.twig', $.rename({extname: '.js'})))
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
            }
        })
        return stream;
    })
    // markdown
    gulp.task('markdown', ['tree'], function() {
        // 处理树结构
        files.forEach(function(file) {
            if (path.extname(file) == '.md') {
                processTree(file, String(fs.readFileSync(file)));
            }
        });
        // 复制resources
        gulp.src('./gulp/markdown/*/**')
            // .pipe($.changed(path.join(argv.p, 'docs')))
            .pipe(gulp.dest(path.join(argv.p, 'docs')));
        // 搜索文件
        gulp.src('./gulp/markdown/quicksearch.html')
            .pipe($.plumber())
            .pipe($.template({
                searchableDocuments: JSON.stringify(searchableDocuments)
            }))
            .pipe(gulp.dest(path.join(argv.p, 'docs')));
        // 整理顺序
        tree = objSort(tree);
        // 生成每个文件
        files.push(path.join(argv.p, 'readme.md'));
        files.forEach(function(file) {
            var basename = getBaseName(file),
                renderer = new $.marked.Renderer();

            var dataFun = function(file1, cb1) {
                    gulp.src(file)
                        .pipe($.plumber())
                        .pipe($.if(utils.hasProp(['.js', '.twig']), $.rename({
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
                .pipe(gulp.dest(argv.p));
        });
    });

};