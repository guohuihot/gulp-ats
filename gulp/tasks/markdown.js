module.exports = function(gulp, $, utils) {
    var path = require('path'),
        fs = require('fs'),
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

    var processTree = function(file, contents) {
        var basename = path.basename(file).slice(0, -3),
            extname = path.extname(file),
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

    gulp.task('tree', function() {
        var stream = $.mergeStream();

        if (!argv.p) {
            console.log('err:需要指定路径！');
            return;
        };
        files = $.glob.sync(path.join(argv.p, '/!(vendor)/**/doc/**/!(README).md'))
        files = files.concat($.glob.sync(path.join(argv.p, '/'+ (argv.dirs ? '@(' + argv.dirs + ')' : '!(vendor|.git)') +'/**/src/**/!(static|seajs|_seajs)/*.js'), {ignore: path.join(argv.p, '/**/vendor/**/*.js')}));
        // console.log(files);
        files.forEach(function(file) {
            if (path.extname(file) == '.js') {
                stream.add(gulp.src(file)
                    // .pipe($.changed(path.join(argv.p, 'docs'), {extension: '.html'}))
                    .pipe($.plumber(function(err) {
                        console.log('#####');
                        console.log('文件内容错误：' + file);
                        console.log(err.message);
                        console.log(err.plugin);
                        console.log('#####');
                    }))
                    .pipe($.jsdocToMarkdown({
                        template: "{{>main}}"
                    }))
                    .pipe($.through2.obj(function(file2, encoding, done) {
                        console.log(file);
                        // console.log(file, !!String(file2.contents));
                        var contents = String(file2.contents);
                        if (contents) {
                            // if (path.basename(file) == 'main.js' ) {console.log(contents);};
                            markdownData[path.basename(file).slice(0, -3)] = file2.contents;
                            processTree(file, contents);
                        } else {
                            files.splice(files.indexOf(file), 1)
                        }
                        done();
                    })));
            }
        });

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
        // 生成每个文件
        files.push(path.join(argv.p, 'readme.md'));
        files.forEach(function(file) {
            var basename = path.basename(file).slice(0, -3),
                renderer = new $.marked.Renderer();

            var dataFun = function(file1, cb1) {
                    gulp.src(file)
                        .pipe($.plumber())
                        .pipe($.if(utils.hasProp(['.js']), $.rename({
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