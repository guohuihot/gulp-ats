var tasks = {
    
    '\t': {
        
        title: '查看任务列表'
    },
    
    init: {
        
        title: '查看(设置)当前配置',
        
        argv: {
            
            '-p(--path)': [
                '项目地址',
                '类型：string, 默认值：保留上次的值',
                '可多个项目地址，用逗号隔开',
                '前提是多个项目里的每个项目需要预先配配置好',
                '',
                '另:当p目录下有config.json文件时',
                'ats优先使用config.json配置',
                '其内容格式如下(仅做参考)',
                JSON.stringify({
                    "core(要监听p下的文件夹)": {
                        "src": "xxx",
                        "dist": "xxx",
                        "extend": {
                            "src(srcEx)": "xxx",
                            "dist(distEx)": "xxx"
                        }
                    }
                }),
                '以上除了core和extend(相对目录)不一样，其它的和init通用配置一样'
            ].join('\n\t\t\t'),
            '-a(--alias)': [
                '可配置别名',
                '给配置起一个别名，下次直接用别名，如',
                'gulp watch -p \'C:\\Users\\Administrator\\Desktop\\test\\\' ',
                '--src \'./src\' --dist \'./dist\' -a \'demo\' ',
                '--distEx \'C:\\Users\\Administrator\\Desktop\\test\\dist1\\\'',
                '下次可直接',
                'gulp watch -a \'demo\'',
            ].join('\n\t\t\t'),
            '-d(--dev)': [
                '启用开发模式',
                '类型：bool, 默认值：true'
            ].join('\n\t\t\t'),
            
            '--au(--author)': [
                '作者',
                '类型：string, 默认值：保留上次的值'
            ].join('\n\t\t\t'),
            
            '-m(--mode)': [
                '模式',
                '类型：int, 默认值：保留上次的值',
                '1 - src/ 直接src为源目录(常用)，下面有js,css,images,fonts',
                '11 - src/ 直接src为源目录(常用)，下面有js,css,images,fonts',
                '2 - src/libs libs为源目录，下面有js,css,images,fonts，比1模式多一层',
                '21 - src/libs libs为源目录，下面有js,css,images,fonts，比1模式多一层',
                '4 - ats自身核心开发模式',
                'c - 自定义，有时源代码目录和生成目标目录不是固定，',
                '可以手动指定',
            ].join('\n\t\t\t'),

            '--src\t': [
                '源代码目录，当 mode 为"c"时有效',
                '类型：string,  默认值：保留上次的值',
                'PS：与p的相对路径',
            ].join('\n\t\t\t'),

            '--dist\t': [
                '源代码目录，当 mode 为"c"时有效',
                '类型：string,  默认值：保留上次的值',
                'PS：与p的相对路径',
            ].join('\n\t\t\t'),

            '--scssPaths\t': [
                'scss源目录',
                '类型：string,  默认值：保留上次的值',
                'PS：需要绝对路径',
            ].join('\n\t\t\t'),

            '--distEx': [
                '扩展生成目录，有时我们生成的目录不仅仅只dist目标，',
                '可能还要将生成的文件复制到另一个目录，',
                '这样就可以给ats再多指定一个生成目录',
                '类型：string,  默认值：保留上次的值',
                'PS：需要绝对路径',
            ].join('\n\t\t\t'),

            '--srcEx': [
                '扩展原目录，有时我们修改原文件时也要同步到其它目录，',
                '这样就可以给ats再多指定一个src目录',
                '类型：string,  默认值：保留上次的值',
                'PS：需要绝对路径',
            ].join('\n\t\t\t'),
            '其它': [
                'Js可以使用es6的新语法，请Js代码里加 // @require(\'babel\') ',
                'Ats会转换对应的代码，注意要写在注释里，不然会被解析',
                '为保证文件的正确转换请保持所有文件编码一致',
             ].join('\n\t\t\t')

        }
    },
    build: {
        
        title: '初始化或同步一个项目',
        
        argv: {
            
            '-p -d -a -m --src --dist --distEx': '同init',
            '--all': '重建, 默认不重建，只同步',
        }
    },
    
    watch: {
        
        title: '监控一个项目目录',
        
        argv: {
            
            '-p -d -a -m --src --srcEx --dist --distEx': '同init',
            
            '-s(--server)': [
                '创建一个web服务器(写静态页面时需要)',
                '类型：bool, 默认值：false'
            ].join('\n\t\t\t'),
            
            '-o(--open)': [
                '直接在浏览器打开，-s为真时有效',
                '类型：bool, 默认值：false'
            ].join('\n\t\t\t'),
            
            '-f(--ftp)': [
                '处理的文件后直接上传到远程ftp',
                '类型：bool, 默认值：false'
            ].join('\n\t\t\t')
        }
    },
    
    add: {
        
        title: '新加一个分类到项目里',
        
        argv: {
            
            '-n(--name)': [
                '分类名称',
                '类型：string, 默认值：null',
                ''
            ].join('\n\t\t\t')
        }
    },
    
    clean: {
        
        title: '清理文件\t',
        
        argv: {
            
            '-p': '同build\t清理后项目目录下src目录,谨慎使用！'
        }
    },
    
    base: {
        
        title: '查看配置文件\t'
    },
    
    'pack:patch': {
        
        title: '压缩文件并删除原文件',
        
        argv: {
            
            '-p': '项目地址',
            
            '-n': '打包名称'
        }
    },
    
    markdown: {
        
        title: 'markdown文件转html',
        
        argv: {
            
            '-p': '从p目录里抓取所有内容，并生成说明文档到当前目录下的docs中',
            '--pEx': '可选，默认从p目录里抓取内容，也可以额外指定一个目录一并抓取',
            '-t(--type)': [
                '可选，直接从p目录抓取太慢，可以指定目录或者地址抓取',
                '按目录 --type=\'e:/a,e:/b\'',
                '按地址 --type=\'e:/a.md,e:/b.js\'',
            ].join('\n\t\t\t'),
            '-i(--ignore)': [
                '排除某些文件，按glob的方式写，多个逗号隔开',
                '例：排除scss,js -i=\'**/*.scss,**/*.js\'',
            ].join('\n\t\t\t'),
            '--arrPre': [
                '给生成文件加前缀，多个逗号隔开，当前缀与路径匹配时说明文档会加上前缀',
                '例：加上这个 --arrPre=\'house,housemobile,manage,core,member\'',
                '，当抓取 E:\\abc\\newhouse\\web\\bundles\\house\\src\\js\\aaa.js',
                '匹配到了路径中的 house, 最终生成名称为 house-aaa.html 的说明文档',
            ].join('\n\t\t\t')
        }
    },
    
    webdown: {
        
        title: '下载网页(扒皮)\t',
        
        argv: {
            
            '-h': '网页地址',
            
            '-n': '页面名称',
            
            '-l': '内容图片的标志',
            
            '-d': '下载目录'
        }
    }
}

// 处理demo
var taskInfo = '',
    params;

taskInfo += [
    '\n',
    '例：',
    'gulp build -p \'C:\\Users\\Administrator\\Desktop\\test\'',
    '显示帮助信息(参数一个字母一个中线，如：-p，大于一个字母两个中线，如：--path)',
    '\n'
].join('\n');

for (var i in tasks) {
    params = '';
    for (var j in tasks[i]['argv']) {
        params += j + '\t' + tasks[i]['argv'][j] + '\n\n\t';
    }
    taskInfo += 'gulp ' + i + '\t' + tasks[i]['title'] + '\n\t' + params + '\n';
}

module.exports = taskInfo;