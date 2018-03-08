# Ats
#### 简介

**Ats** 全称automatic tools(自动化工具)；
设计目的，传统的构建工具对于一个刚接触前端的童鞋过于复杂，还要会写js，还要配置插件什么的
为了让前端写页面更简单方便，自己封装了一套工具，使用者只要用命令行指定目录及简单的几个设置就可以用；
简单说Ats是基于gulp开发的一个cli工具；
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
    
{% for item in tree.children %}
{%- if loop.last -%}
└── {{ item.name }} - {{ item.description -}}
{%- else -%}
├── {{ item.name }} - {{ item.description -}}
{%- endif -%}
    {% for item1 in item.children %}
    {%- if loop.last -%}
    └── {{ item1.name + ' - ' + item1.description -}}
    {%- else -%}
    ├── {{ item1.name + ' - ' + item1.description -}}
    {%- endif -%}
        {% for item2 in item1.children %}
        {%- if loop.last -%}
        └── {{ item2.name + ' - ' + item2.description -}}
        {%- else -%}
        ├── {{ item2.name + ' - ' + item2.description -}}
        {%- endif -%}
            {% for item3 in item2.children %}
            {%- if loop.last -%}
            └── {{ item3.name + ' - ' + item3.description -}}
            {%- else -%}
            ├── {{ item3.name + ' - ' + item3.description -}}
            {%- endif -%}
            {% endfor %}
        {% endfor %}
    {% endfor %}
{% endfor %}
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
{% raw %}
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
{% endraw %}

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

#### {{title}}
{{content|raw}}