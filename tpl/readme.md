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

#### {{title}}
{{content|raw}}