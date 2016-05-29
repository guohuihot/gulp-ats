module.exports = function(gulp, $, utils) {
    var path = require('path'),
        fs = require('fs'),
        argv = $.yargs
        .alias({
            path: 'p',
            author: 'a',
            custom: 'c',
            libs: 'l',
            dev: 'd',
            server: 's',
            open: 'o',
            ftp: 'f',
            reverse: 'r',
            mode: 'm',
            tpl: 't'
        }).argv;

    var hasProp = function(arr) {
        return function(file) {
            return arr.indexOf(path.extname(file.path)) != -1 || 
                arr.indexOf(path.basename(file.path)) != -1;
        }
    };
    var files = $.glob.sync(path.join(argv.p, '/**/!(vendor)/**/doc/**/*.md')),
        tree = {},
        searchableDocuments = {};

    var processTree = function(file, contents) {
        var basename = path.basename(file).slice(0, -3),
            extname = path.extname(file),
            dir = extname == '.js' ? 'JS文档' : path.basename(path.dirname(file)),
            cur;
        contents = String(contents);
        if (contents) {
            cur = tree[dir] || [];
            cur.push(basename)
            tree[dir] = cur;
            searchableDocuments[basename + '.html'] = {
                id: basename + '.html',
                title: basename,
                body: contents,
            }
        }
    }

    files = files.concat($.glob.sync(path.join(argv.p, '/**/!(vendor|.git)/**/src/**/!(static|seajs)/*.js')), 
                $.glob.sync(path.join(argv.p, '/src/**/!(static|seajs)/*.js')));

    gulp.task('tree', function() {
        var stream = $.mergeStream();

        files.forEach(function(file) {
            if (path.extname(file) == '.js') {
                stream.add(gulp.src(file)
                            .pipe($.jsdocToMarkdown({template: "{{>main}}"}))
                            .pipe($.through2.obj(function(file2, encoding, done) {
                                processTree(file, file2.contents);
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
                processTree(file, fs.readFileSync(file));
            }
        });
        // 复制resources
        gulp.src('./gulp/markdown/*/**')
            .pipe(gulp.dest(path.join(argv.p, 'docs')));
        // 搜索文件
        gulp.src('./gulp/markdown/quicksearch.html')
            .pipe($.template({
                searchableDocuments: JSON.stringify(searchableDocuments)
            }))
            .pipe(gulp.dest(path.join(argv.p, 'docs')));
        // 生成每个文件
        files.push(path.join(argv.p, 'readme.md'));
        files.forEach(function(file) {
            var basename = path.basename(file).slice(0, -3),
                dataFun = function(file1, cb1) {
                    gulp.src(file)
                        .pipe($.plumber())
                        .pipe($.if(hasProp(['.js']), $.jsdocToMarkdown({
                                template: "{{>main}}",
                                'no-gfm': false,
                                'heading-depth': 3,
                                // 'separators': false,
                            })))
                            .pipe($.if(hasProp(['.js']), $.rename({
                                extname: '.md'
                            })))
                        .pipe($.marked())
                        .pipe($.through2.obj(function(file2, encoding, done) {
                            var contents = String(file2.contents);
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

            dist = path.join('docs/', (basename == 'readme' ? 'index' : basename) + '.html');

            gulp.src('./gulp/markdown/index.html')
                .pipe($.data(dataFun))
                .pipe($.template())
                .pipe($.rename(dist))
                .pipe(gulp.dest(argv.p));
        });
    });
};