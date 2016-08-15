module.exports = {
    
    '\t': {
        
        title: '查看任务列表'
    },
    
    init: {
        
        title: '查看(设置)当前配置',
        
        argv: {
            
            '-p(--path)': [
                '项目地址',
                '类型：string, 默认值：保留上次的值'
            ].join('\n\t\t\t'),
            
            '-d(--dev)': [
                '启用开发模式',
                '类型：bool, 默认值：true'
            ].join('\n\t\t\t'),
            
            '-a(--author)': [
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
            
            '-p': 'markdown文件目录',
            '--dirs': '要处理的目录多个用|分割'
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