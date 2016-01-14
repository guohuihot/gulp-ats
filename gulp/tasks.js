module.exports = {
    
    '\t': {
        
        title: '查看任务列表'
    },
    
    init: {
        
        title: '查看(设置)当前配置'
    },
    
    build: {
        
        title: '初始化或同步一个项目',
        
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
            
            '--al(--all)': [
                '同步并生成项目里所有数据',
                '类型：bool, 默认值：false'
            ].join('\n\t\t\t'),
            
            '-m(--mode)': [
                '模式',
                '类型：int, 默认值：保留上次的值',
                '1.src/ 直接src为核心(常用)',
                '2.src/libs libs为核心(新核心)',
                '3.在2的基础上加入后台和会员中心核心(新核心)'
            ].join('\n\t\t\t')
        }
    },
    
    wacth: {
        
        title: '监控一个项目目录',
        
        argv: {
            
            '-p -d -a': '同build',
            
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
            ].join('\n\t\t\t'),
            
            '-r(--reverse)': [
                '反向复制，用于将测试好的核心代码复制到atsui库中',
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
            
            '-p': 'markdown文件目录'
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