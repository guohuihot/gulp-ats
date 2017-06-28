# ats08
**ats08** 全称08cms automatic tools(08cms 自动化工具)；
简单说ats08是基于gulp开发的一个cli工具，集成功能主要有以下：

- sass生成css
- js语法检查、压缩、合并
- 图片压缩，合并
- 字体压缩，合成
- 浏览器自动刷新
- ftp自动上传
- html模板,基于swig模板引擎
- markdown文件生成说明文档
- 自动抓取js的说明信息生成js说明文档
- vue 转 js

#### 安装node插件
1. 在版本库里右键git bash here打开命令行工具(当然用cmd,powershell也可以)
1. 执行命令`npm start` 这个过程要很久，20-30分钟，期间会安装一系列插件
1. 执行命令`npm list`,如果没有显示`npm ERR`表示安装完毕，如果显示再执行`cnpm install`
#### ats结构
1. **.git** git的配置文件
1. **gulp** gulp的配置文件
    - **css** gulp时css的配置文件，scss模板，css排序规则
    - **tasks** 所有的任务
    - **base.json** gulp的基本配置，包括项目目录，文件作者。。。
    - **tasks.json** gulp任务的提示信息，用于命令行中的提示，让工具使用更简单
    - **utils.js** js工具模块，gulp内部使用
1. **node_modules** node模板的存放目录，node会自动生成，默认是被git忽略的
1. **src** ats的核心部分，css，js，html。。。`维护使用主要是这个目录`
1. **.gitignore** git的忽略文件的配置
1. **gulpfile.js** gulp的入口文件，已经将任务分配到tasks文件里了
1. **package.json** node模块配置，所有的模块信息及依赖都在这里面

#### 目录结构

```text
    
├── .babelrc - 
├── bin - 
    ├── default.js - 
    
    ├── dev.js - 
    
    ├── imageresize.js - 
    
    ├── init.js - 
    
    ├── jshint.js - 
    
    ├── markdown.js - 
    
    ├── pack.js - 
    
    ├── web.js - 
    
    └── webdown.js - 
    
├── editorconfig - 
├── gulpfile.js - 
├── lib - 
    ├── base.json - 
    
    ├── configs.js - 
    
    ├── csscomb.json - 
    
    ├── init.js - 
    
    ├── js - 
        └── jquery.js - 
        
    
    ├── swig - 
        ├── filters.js - 
        
        └── locals.js - 
        
    
    ├── tasks-info.js - 
    
    └── utils.js - 
    
├── package.json - 
├── readme.md - 
├── src - 
    └── libs - 
        ├── css - 
            ├── ats.scss - 
            ├── demo.scss - 
            ├── inherit - 
            ├── mixins - 
            ├── static - 
            ├── _font-demo.scss - 
            ├── _font-modal.scss - 
            ├── _grid.scss - 
            ├── _header.scss - 
            ├── _img-demo.scss - 
            ├── _modal.scss - 
            └── _variables.scss - 
        
        ├── demo.html - 
        
        ├── fonts - 
            ├── _demo - 
            └── _modal - 
        
        ├── images - 
            └── _demo - 
        
        ├── js - 
            ├── demo.js - 
            ├── plugin - 
            ├── static - 
            ├── _common - 
            ├── _js_header.html - 
            └── _seajs - 
        
        ├── pic - 
            └── s.png - 
        
        └── _base.html - 
        
    
└── tpl - 
    ├── css - 
        ├── fonts.scss - 
        
        └── images.scss - 
        
    
    ├── html - 
        ├── fonts.html - 
        
        ├── images.html - 
        
        └── toolsbar.html - 
        
    
    ├── markdown - 
        ├── fonts - 
            ├── glyphicons-halflings-regular.eot - 
            ├── glyphicons-halflings-regular.svg - 
            ├── glyphicons-halflings-regular.ttf - 
            ├── glyphicons-halflings-regular.woff - 
            ├── glyphicons-halflings-regular.woff2 - 
            ├── modal.eot - 
            └── modal.woff - 
        
        ├── img - 
            ├── glyphicons-halflings-white.png - 
            └── glyphicons-halflings.png - 
        
        ├── index.html - 
        
        ├── quicksearch.html - 
        
        ├── scripts - 
            ├── fulltext-search-ui.js - 
            ├── fulltext-search.js - 
            ├── highlight.min.js - 
            ├── jqmodal.js - 
            ├── jquery.zeroclipboard.js - 
            ├── lunr.min.js - 
            ├── prettify - 
            ├── toc.js - 
            └── ZeroClipboard.swf - 
        
        └── styles - 
            ├── highlight - 
            ├── jqmodal.css - 
            └── site.cerulean.css - 
        
    
    └── readme.md - 
    

```

#### 使用说明


例：
gulp build -p 'C:\Users\Administrator\Desktop\test'
显示帮助信息(参数一个字母一个中线，如：-p，大于一个字母两个中线，如：--path)

gulp 		查看任务列表
	
gulp init	查看(设置)当前配置
	-p(--path)	项目地址
			类型：string, 默认值：保留上次的值
			可多个项目地址，用逗号隔开
			前提是多个项目里的每个项目需要预先配配置好

	-a(--alias)	可配置别名
			给配置起一个别名，下次直接用别名，如
			gulp watch -p 'C:\Users\Administrator\Desktop\test\' 
			--src './src' --dist './dist' -a 'demo' 
			--distEx 'C:\Users\Administrator\Desktop\test\dist1\'
			下次可直接
			gulp watch -a 'demo'

	-d(--dev)	启用开发模式
			类型：bool, 默认值：true

	--au(--author)	作者
			类型：string, 默认值：保留上次的值

	-m(--mode)	模式
			类型：int, 默认值：保留上次的值
			1 - src/ 直接src为源目录(常用)，下面有js,css,images,fonts
			11 - src/ 直接src为源目录(常用)，下面有js,css,images,fonts
			2 - src/libs libs为源目录，下面有js,css,images,fonts，比1模式多一层
			21 - src/libs libs为源目录，下面有js,css,images,fonts，比1模式多一层
			4 - ats自身核心开发模式
			c - 自定义，有时源代码目录和生成目标目录不是固定，
			可以手动指定

	--src		源代码目录，当 mode 为"c"时有效
			类型：string,  默认值：保留上次的值
			PS：与p的相对路径

	--dist		源代码目录，当 mode 为"c"时有效
			类型：string,  默认值：保留上次的值
			PS：与p的相对路径

	--scssPaths		scss源目录
			类型：string,  默认值：保留上次的值
			PS：需要绝对路径

	--distEx	扩展生成目录，有时我们生成的目录不仅仅只dist目标，
			可能还要将生成的文件复制到另一个目录，
			这样就可以给ats再多指定一个生成目录
			类型：string,  默认值：保留上次的值
			PS：需要绝对路径

	其它	Js支持es6写法，具体使用在内容里加 // @require('babel')
			注意要写在注释里，不然会被解析

	
gulp build	初始化或同步一个项目
	-p -d -a -m --src --dist --distEx	同init

	--all	重建, 默认不重建，只同步

	
gulp watch	监控一个项目目录
	-p -d -a -m --src --dist --distEx	同init

	-s(--server)	创建一个web服务器(写静态页面时需要)
			类型：bool, 默认值：false

	-o(--open)	直接在浏览器打开，-s为真时有效
			类型：bool, 默认值：false

	-f(--ftp)	处理的文件后直接上传到远程ftp
			类型：bool, 默认值：false

	
gulp add	新加一个分类到项目里
	-n(--name)	分类名称
			类型：string, 默认值：null
			

	
gulp clean	清理文件	
	-p	同build	清理后项目目录下src目录,谨慎使用！

	
gulp pack:patch	压缩文件并删除原文件
	-p	项目地址

	-n	打包名称

	
gulp markdown	markdown文件转html
	-p	从p目录里抓取所有内容，并生成说明文档到当前目录下的docs中

	--pEx	可选，默认从p目录里抓取内容，也可以额外指定一个目录一并抓取

	-t(--type)	可选，直接从p目录抓取太慢，可以指定类型或者目录，地址抓取
			按类型 --type='js,md,twig,css'
			按目录 --type='e:/a,e:/b'
			按地址 --type='e:/a.md,e:/b.js'

	
gulp webdown	下载网页(扒皮)	
	-h	网页地址

	-n	页面名称

	-l	内容图片的标志

	-d	下载目录

	
