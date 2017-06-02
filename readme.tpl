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

#### {{title}}
{{content}}