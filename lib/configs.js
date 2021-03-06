module.exports = function($, utils) {
    return {
        jshint: {
            "bitwise": false, //禁用位运算符，位运算符在 js 中使用较少，经常是把 && 错输成 &
            "curly": true, //循环或者条件语句必须使用花括号包围
            "camelcase": false, // 使用驼峰命名(camelCase)或全大写下划线命名(UPPER_CASE)
            "eqeqeq": false, //强制使用三等号
            "indent": 4, // 代码缩进
            "latedef": "nofunc", // 禁止定义之前使用变量，忽略 function 函数声明
            "newcap": true, // 构造器函数首字母大写
            "quotmark": true, // 为 true 时，禁止单引号和双引号混用
            "undef": true, // 变量未定义
            "unused": true, // 变量未使用
            "strict": false, // 严格模式
            "maxparams": 4, //最多参数个数
            "forin": true, // for-in 语句是否要求过滤原型链上的对象
            /**
            * 不允许空的代码快，默认关闭
            */
            "noempty": false,
            /**
            * 不允许使用 "non-breaking whitespace"。
            *
            * 这些字符在非 UTF8 页面会导致代码失效
            */
            "nonbsp": true,

            /**
            * 阻止直接使用 new 调用构造函数的语句（不赋值对象）
            *
            * // OK
            * var a = new Animal();
            *
            * // Warn
            * new Animal();
            */
            "nonew": true,
            "freeze": false, // 是否阻止修改或拓展基本对象（Array、Date 等）的原型链 原型链污染比较危险，默认打开

            /**
            * 变量只能在函数域上定义，在代码块上定义的变量给出警告
            *
            * // OK
            * function test() {
             *    var x;
             *
             *    if (true) {
             *        x = 0;
             *    }
             *
             *    x += 1;
             * }
            *
            * // No Way
            * function test() {
             *
             *    if (true) {
             *        var x = 0;
             *    }
             *
             *    x += 1;
             * }
            */
            "funcscope": true,
            /**
            * 写字面量时，逗号放前面给出警告，例如：
            *
            * var obj = {
             *     name: 'Anton'
             *   , handle: 'valueOf'
             *   , role: 'SW Engineer'
             * }
            */
            "laxcomma": true,
            /**
            * 每个函数只允许使用一个 var 定义变量
            *
            * 默认关闭
            */
            "onevar": false,
            "immed": true,
            //匿名函数调用必须 (function() { // body }()); 而不是 (function() { // body })();
            "maxdepth": 4, //最大嵌套深度
            "maxcomplexity": 6, // 复杂度检测
            "maxlen": 100, // 最大行数
            "asi": false,
            "boss": true, //控制“缺少分号”的警告
            "lastsemic": true, // 检查一行代码最后声明后面的分号是否遗漏
            "laxcomma": true, //检查不安全的折行，忽略逗号在最前面的编程风格
            "loopfunc": true, //检查循环内嵌套 function
            "multistr": true, // 检查多行字符串
            "notypeof": true, // 检查无效的 typeof 操作符值
            "sub": true, // person['name'] vs. person.name
            "supernew": true, // new function () { ... } 和 new Object ;
            "validthis": true, // 在非构造器函数中使用 this 
            "node": true,
            "browser": true, // 暴露浏览器的变量
            "devel": true,
            "jquery": true,
            "globals": {
                "$": true, //$为全局变量
                "jQuery": true, //jQuery为全局变量
                "seajs": false,
                "csrf_token": false,
                "BASE_URL": false,
                "jsbase": false,
                "baseUrl": false,
                "BASE_THEME": false,
                "UEDITOR_HOME_URL": false,
                "moment": false,
                "define": false,
                "uri2MVC": false
            }
        },
        uglify: {
            compress: {
                loops         : true, //优化循环
                sequences     : true, //连续使用多个逗号
                if_return     : true, //优化if else
                unused        : true, //删除没使用的变量、函数
                evaluate      : true, //优化常量表达式
                hoist_funs    : true, //函数声明至于顶端
                comparisons   : true, //优化逻辑操作符
                hoist_vars    : true, //变量声明至于顶端
                conditionals  : true, //优化条件表达式(转换成二元)
                dead_code     : true, //删除运行不到的代码
                booleans      : true, //优化布尔表达式
                properties    : false, //类似a["foo"] 智能优化为 a.foo
                unsafe        : false, //不安全的优化
                join_vars     : true, //合并多个变量声明
                drop_debugger : false //移除调试代码，如果debugger
            },
            preserveComments: 'some',
            mangle: {
                except: ['$', 'require', 'exports']
            }
        },
        imagemin: {
            optimizationLevel : 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive       : true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced        : true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass         : true //类型：Boolean 默认：false 多次优化svg直到完全优化
        },
        jsdoc: {
            "tags": {
                "allowUnknownTags": true
            },
            "source": {
                "excludePattern": "(^|\\/|\\\\)_"
            },
            "opts": {
                "destination": "./docs/gen"
            },
            "plugins": [
                "plugins/markdown"
            ],
            "templates": {
                "cleverLinks": false,
                "monospaceLinks": false,
                "default": {
                    "outputSourceFiles": true,
                },
                "path": "ink-docstrap",
                "theme": "cerulean",
                "systemName": "08cms文档",
                "outputSourcePath": false, //显示文件来源
                "outputSourceFiles": true,
                "navType": "vertical",
                "collapseSymbols" : false,
                "linenums": true,
                "copyright": '08cms说明文档 by <a href="https://www.08cms.com/">08cms</a> ',
                "footer": '<style type="text/css">.name h4, h4.name {border-radius: 3px;padding: 5px;color: #fff;background-color: #2FA4E7;}</style>',
                "dateFormat": "MMMM Do YYYY, h:mm:ss"

                /*"systemName"            : "{string}",
                "footer"                : "{string}",
                "copyright"             :  "{string}",
                "includeDate"           : "{boolean}",
                "navType"               : "{vertical|inline}",
                "theme"                 : "{theme}",
                "linenums"              : "{boolean}",
                "collapseSymbols"       : "{boolean}",
                "inverseNav"            : "{boolean}",
                "outputSourceFiles"     : "{boolean}" ,
                "outputSourcePath"      : "{boolean}",
                "dateFormat"            : "{string}",
                "syntaxTheme"           : "{string}",
                "sort"                  : "{boolean|string}"*/
            }
        },
        swig: {
            defaults: {
                cache: false, 
                locals: require('./swig/locals')
            },
            setup: function(swig) {
                // 自定义过滤器
                var filters = require('./swig/filters');

                for (prop in filters) {
                    if (filters.hasOwnProperty(prop)) {
                        swig.setFilter(prop, filters[prop]);
                    }
                }
                // date offset 设置时间偏移
                swig.setDefaultTZOffset(-480);


                // 自定义tags
                var parentblock = require('./swig/tags/parentblock');
                swig.setTag('parentblock', parentblock.parse, parentblock.compile, parentblock.ends, parentblock.blockLevel);
            }
        }
    }
}