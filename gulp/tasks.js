module.exports = {
    
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
                '前提是多个项目里的每个项目需要预先配配置好'
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
            '其它': [
                'Js支持es6写法，具体使用在内容里加 // @require(\'babel\')',
                '注意要写在注释里，不然会被解析'
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
            
            '-p -d -a -m --src --dist --distEx': '同init',
            
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
            '--type': [
                '可选，直接从p目录抓取太慢，可以指定类型或者目录，地址抓取',
                '按类型 --type=\'js,md,twig,css\'',
                '按目录 --type=\'e:/a,e:/b\'',
                '按地址 --type=\'e:/a.md,e:/b.js\'',
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