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
            '-p'    : 'path\t项目地址',
            '-d'    : 'dev\t启用开发模式',
            '-a'    : 'author\t作者',
            '--all' : '\t同步并生成项目里所有数据',
            '-m'    : 'mode\t模式\n\t\t\t1.src/ 直接src为核心\n\t\t\t2.src/libs libs为核心\n\t\t\t3.在2的基础上加入后台和会员中心核心'
        }
    },
    wacth: {
        title: '监控一个项目目录',
        argv: {
            '-p': 'path\t项目地址',
            '-d': 'dev\t启用开发模式,默认是启用',
            '-a': 'author\t作者',
            '-s': 'server\t创建一个web服务器(写静态页面时需要)',
            '-o': 'open\t-s为真时，直接打开',
            '-f': 'ftp\t处理的文件后直接上传到远程ftp',
            '-r': 'reverse\t反向复制，用于将测试好的核心代码复制到atsui库中'
        }
    },
    add: {
        title: '新加一个分类到项目里',
        argv: {
            '-n': 'name\t分类名称'
        }
    },
    clean: {
        title: '清理文件\t',
        argv: {
            '-p': '项目地址，清理后项目目录下src目录,谨慎使用！'
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