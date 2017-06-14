# ats08
**ats08** 全称08cms automatic tools(08cms 自动化工具) `本来想叫08ats，git仓库不支持数字开头`；
简单说ats08是基于gulp开发的一个自动化工具，功能主要有以下：

- sass生成css
- js语法检查及压缩
- 图片压缩
- 图片合成
- 字体压缩
- 字体合成
- 自动刷新
- ftp自动上传
- html按模块写,自动生成一个完整的html文件，基于swig模板引擎
- markdown文件生成说明文档
- 自动抓取js的说明信息生成js说明文档

#### 安装
1. **安装git**
	- [git下载](http://git-scm.com/download/),根据自己的系统自己选择；
	- [安装小乌龟](http://tortoisegit.org/download/)（TortoiseGit）`这个可以根据自己的情况，喜欢命令行的可以不用这个，刚开始最好还是用`
1. **安装node**
	- [node下载](https://nodejs.org/en/)
#### 导出版本库
1. 小乌龟右键`git克隆`
1. `url`后面填上`git@192.168.1.60:ats08.git`
1. `加载putty密钥`勾上，后台选择`\\ZHONG61\home\`目录下自己对应的密钥，例如我的是`\\ZHONG61\home\guo.ppk`
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
#### 使用ats之前需要了解的信息
- [git](http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000) 会用小乌龟就行
- [sass](http://www.w3cplus.com/sassguide/) 了解下基本方法就行，慢慢深入
- [seajs](http://seajs.org/docs/) 了解下基本方法就行，慢慢深入
- [bootstrap](http://www.bootcss.com/) 主要看下书写风格，ats的代码风格会参照着它的来设计的
- [markdown](https://maxiang.io/) 语法简单自己熟悉

#### 使用说明


例：
gulp build -p &#39;C:\Users\Administrator\Desktop\test&#39; -a &#39;ahuing&#39; -m 1
显示帮助信息(参数一个字母一个中线，大于一个字母两个中线)

gulp 		查看任务列表
	
gulp init	查看(设置)当前配置
	-p(--path)	项目地址
			类型：string, 默认值：保留上次的值
			可多个项目地址，用逗号隔开
			前提是多个项目里的每个项目需要预先配配置好

	-a(--alias)	可配置别名
			给配置起一个别名，下次直接用别名，如
			gulp watch -p &#39;C:\Users\Administrator\Desktop\test\&#39; 
			--src &#39;./src&#39; --dist &#39;./dist&#39; -a &#39;demo&#39; 
			--distEx &#39;C:\Users\Administrator\Desktop\test\dist1\&#39;
			下次可直接
			gulp watch -a &#39;demo&#39;

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

	--src		源代码目录，当 mode 为&quot;c&quot;时有效
			类型：string,  默认值：保留上次的值
			PS：与p的相对路径

	--dist		源代码目录，当 mode 为&quot;c&quot;时有效
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

	其它	Js支持es6写法，具体使用在内容里加 // @require(&#39;babel&#39;)
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

	--type	可选，直接从p目录抓取太慢，可以指定类型或者目录，地址抓取
			按类型 --type=&#39;js,md,twig,css&#39;
			按目录 --type=&#39;e:/a,e:/b&#39;
			按地址 --type=&#39;e:/a.md,e:/b.js&#39;

	
gulp webdown	下载网页(扒皮)	
	-h	网页地址

	-n	页面名称

	-l	内容图片的标志

	-d	下载目录

	
