# ats08
#### 简介

**ats08** 全称08cms automatic tools(08cms 自动化工具)；
设计目的，传统的构建工具对于一个刚接触前端的童鞋过于复杂，还要会写js，还要配置插件什么的
为了让前端写页面更简单方便，自己封装了一套工具，使用者只要用命令行指定目录及简单的几个设置就可以用；
简单说ats08是基于gulp开发的一个cli工具；
`特别说明：该工具只适合传统的多页面构建，不适合单页面设计，若是单页面请移步Webpack`

#### 集成功能

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

#### 技术栈

- node
- gulp
- sass
- font svg
- markdown
- swig twig
- jsdoc
- vue

#### 安装node插件

1. `node` `git` 安装 请自行百度
1. 在版本库里右键git bash here打开命令行工具(当然用cmd,powershell也可以)
1. 执行命令`npm install -g cnpm --registry=https://registry.npm.taobao.org` 使用淘宝镜像
1. 执行命令`cnpm install` 这个过程要很久，20-30分钟，期间会安装一系列插件
1. 如果没有显示`npm ERR`表示安装完毕，如果显示再执行`cnpm install`

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
        
        ├── locals.js - 
        
        └── tags - 
            └── parentblock.js - 
        
    
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
#### 处理规则
##### Scss

- 从 `src/css/a.scss` 到 `dist/css/a.css`
- 完成后自动刷新浏览器

##### JS

- 合并
合并前
```text
    src
      ├── js
        ├── _xxx
          ├── a.js
          ├── b.js
```
合并后 
```text
    dist
      ├── js
        ├── xxx.js
```
- 所有有下划线的文件夹都会将其内部的文件合并成一个文件（以当前文件夹命名）
- 代码里加`// @require('babel')`标记里，代码可以使用es6写法，工具会自动转换

##### Images

- 合并
合并前
```text
    src
      ├── images
        ├── _xxx
          ├── a.png
          ├── b.png
```
合并后
```text
    dist
      ├── images
        ├── xxx.png - 合成后的图片
        ├── xxx.html - 可以直接打开预览调用方式
    src
      ├── css
        ├── _img-xxx.scss - 可直接 `@impot '_img-xxx'`合成后图片的css
```
- 合并后 所有有下划线的文件夹都会将其内部的文件合并成一个文件（以当前文件夹命名）

##### Fonts

- 合并
合并前
```text
    src
      ├── fonts
        ├── _xxx
          ├── a.svg
          ├── b.svg
```
合并后
```text
    dist
      ├── fonts
        ├── xxx.eot - 合成后的字体
        ├── xxx.woff - 合成后的字体
        ├── xxx.html - 可以直接打开预览调用方式
    src
      ├── css
        ├── _font-xxx.scss - 可直接 `@impot '_font-xxx'`合成后字体的css
```

- 合并后 所有有下划线的文件夹都会将其内部的文件合并成一个文件（以当前文件夹命名）

##### Html

- 合并
合并前
```text
    src
      ├── _base.html
      ├── index.html
```
合并后
```text
    dist
      ├── index.html
   
```
- 支持[swig](https://twig.sensiolabs.org/doc/2.x/)模板引擎  
- 下划线的不会被处理
- 模板代码如下
_base.html

```twig
<html>
<head>
    <title>{% block title %}{% endblock %}</title>
</head>
<body>
    {% block body %}{% endblock %}
</body>
</html>
```
index.html
```twig
{% extends './_base.html' %}
{% block title %}标题{% endblock %}
{% block body %}
内容
{% endblock %}
```


##### Vue

- 合并
处理前
```text
    src
      ├── js
        ├── aaa.vue
        ├── _xxx
          ├── a.vue
          ├── b.vue
```
处理后 
```text
    dist
      ├── js
        ├── aaa.js
        ├── xxx.js
```
- 基本与JS一样
- 所有有下划线的文件夹都会将其内部的文件合并成一个文件（以当前文件夹命名）

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

	其它	Js默认会使用es6转换，当不使用es6转换时，请Js在内容里加 // @require('nobabel') 
			注意要写在注释里，不然会被解析
			为保证文件的正确转换请保持所有文件编码一致

	
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

	-t(--type)	可选，直接从p目录抓取太慢，可以指定目录或者地址抓取
			按目录 --type='e:/a,e:/b'
			按地址 --type='e:/a.md,e:/b.js'

	-i(--ignore)	排除某些文件，按glob的方式写，多个逗号隔开
			例：排除scss,js -i='**/*.scss,**/*.js'

	
gulp webdown	下载网页(扒皮)	
	-h	网页地址

	-n	页面名称

	-l	内容图片的标志

	-d	下载目录

	
