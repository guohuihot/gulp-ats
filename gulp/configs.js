module.exports = function() {
	return {
		jshint: {
            bitwise       : false, //禁用位运算符，位运算符在 js 中使用较少，经常是把 && 错输成 &
            curly         : false, //循环或者条件语句必须使用花括号包围
            camelcase     : true, // 使用驼峰命名(camelCase)或全大写下划线命名(UPPER_CASE)
            eqeqeq        : false, //强制使用三等号
            indent        : 4,// 代码缩进
            latedef       : 'nofunc', // 禁止定义之前使用变量，忽略 function 函数声明
            newcap        : true, // 构造器函数首字母大写
            quotmark      : true, // 为 true 时，禁止单引号和双引号混用
            undef         : true, // 变量未定义
            unused        : true, // 变量未使用
            strict        : false, // 严格模式
            maxparams     : 4, //最多参数个数
            immed         : true, 
            //匿名函数调用必须 (function() { // body }()); 而不是 (function() { // body })();
            maxdepth      : 4, //最大嵌套深度
            maxcomplexity : 4, // 复杂度检测
            maxlen        : 100, // 最大行数
            asi           : false,
            boss          : true, //控制“缺少分号”的警告
            lastsemic     : true, // 检查一行代码最后声明后面的分号是否遗漏
            laxcomma      : true, //检查不安全的折行，忽略逗号在最前面的编程风格
            loopfunc      : true, //检查循环内嵌套 function
            multistr      : true, // 检查多行字符串
            notypeof      : true, // 检查无效的 typeof 操作符值
            sub           : true, // person['name'] vs. person.name
            supernew      : true, // new function () { ... } 和 new Object ;
            validthis     : true, // 在非构造器函数中使用 this 
            node          : true,
            jquery        : true,
            globals: {
                seajs   : false,
                uri2MVC : false
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
                // source_map : true,//source_map
                properties    : false, //类似a["foo"] 智能优化为 a.foo
                unsafe        : false, //不安全的优化
                join_vars     : true //合并多个变量声明
            },
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
        csscomb: {
		    "exclude": [
		        ".git/**",
		        "node_modules/**",
		        "bower_components/**"
		    ],
		    "always-semicolon": true,
		    "block-indent": "    ",
		    "color-case": "lower",
		    "color-shorthand": true,
		    "element-case": "lower",
		    "eof-newline": true,
		    "leading-zero": false,
		    "quotes": "single",
		    "remove-empty-rulesets": true,
		    "space-after-colon": " ",
		    "space-after-combinator": " ",
		    "space-after-opening-brace": "\n",
		    "space-after-selector-delimiter": "\n",
		    "space-before-closing-brace": "\n",
		    "space-before-colon": "",
		    "space-before-combinator": " ",
		    "space-before-opening-brace": " ",
		    "space-before-selector-delimiter": "",
		    "strip-spaces": true,
		    "unitless-zero": true,
		    "vendor-prefix-align": true,
		    "sort-order": [
		        [
		            "font",
		            "font-family",
		            "font-size",
		            "font-weight",
		            "font-style",
		            "font-variant",
		            "font-size-adjust",
		            "font-stretch",
		            "font-effect",
		            "font-emphasize",
		            "font-emphasize-position",
		            "font-emphasize-style",
		            "font-smooth",
		            "line-height"
		        ],
		        [
		            "position",
		            "z-index",
		            "top",
		            "right",
		            "bottom",
		            "left"
		        ],
		        [
		            "display",
		            "visibility",
		            "float",
		            "clear",
		            "overflow",
		            "overflow-x",
		            "overflow-y",
		            "-ms-overflow-x",
		            "-ms-overflow-y",
		            "clip",
		            "zoom",
		            "flex-direction",
		            "flex-order",
		            "flex-pack",
		            "flex-align"
		        ],
		        [
		            "-webkit-box-sizing",
		            "-moz-box-sizing",
		            "box-sizing",
		            "width",
		            "min-width",
		            "max-width",
		            "height",
		            "min-height",
		            "max-height",
		            "margin",
		            "margin-top",
		            "margin-right",
		            "margin-bottom",
		            "margin-left",
		            "padding",
		            "padding-top",
		            "padding-right",
		            "padding-bottom",
		            "padding-left"
		        ],
		        [
		            "table-layout",
		            "empty-cells",
		            "caption-side",
		            "border-spacing",
		            "border-collapse",
		            "list-style",
		            "list-style-position",
		            "list-style-type",
		            "list-style-image"
		        ],
		        [
		            "content",
		            "quotes",
		            "counter-reset",
		            "counter-increment",
		            "resize",
		            "cursor",
		            "-webkit-user-select",
		            "-moz-user-select",
		            "-ms-user-select",
		            "user-select",
		            "nav-index",
		            "nav-up",
		            "nav-right",
		            "nav-down",
		            "nav-left",
		            "-webkit-transition",
		            "-moz-transition",
		            "-ms-transition",
		            "-o-transition",
		            "transition",
		            "-webkit-transition-delay",
		            "-moz-transition-delay",
		            "-ms-transition-delay",
		            "-o-transition-delay",
		            "transition-delay",
		            "-webkit-transition-timing-function",
		            "-moz-transition-timing-function",
		            "-ms-transition-timing-function",
		            "-o-transition-timing-function",
		            "transition-timing-function",
		            "-webkit-transition-duration",
		            "-moz-transition-duration",
		            "-ms-transition-duration",
		            "-o-transition-duration",
		            "transition-duration",
		            "-webkit-transition-property",
		            "-moz-transition-property",
		            "-ms-transition-property",
		            "-o-transition-property",
		            "transition-property",
		            "-webkit-transform",
		            "-moz-transform",
		            "-ms-transform",
		            "-o-transform",
		            "transform",
		            "-webkit-transform-origin",
		            "-moz-transform-origin",
		            "-ms-transform-origin",
		            "-o-transform-origin",
		            "transform-origin",
		            "-webkit-animation",
		            "-moz-animation",
		            "-ms-animation",
		            "-o-animation",
		            "animation",
		            "-webkit-animation-name",
		            "-moz-animation-name",
		            "-ms-animation-name",
		            "-o-animation-name",
		            "animation-name",
		            "-webkit-animation-duration",
		            "-moz-animation-duration",
		            "-ms-animation-duration",
		            "-o-animation-duration",
		            "animation-duration",
		            "-webkit-animation-play-state",
		            "-moz-animation-play-state",
		            "-ms-animation-play-state",
		            "-o-animation-play-state",
		            "animation-play-state",
		            "-webkit-animation-timing-function",
		            "-moz-animation-timing-function",
		            "-ms-animation-timing-function",
		            "-o-animation-timing-function",
		            "animation-timing-function",
		            "-webkit-animation-delay",
		            "-moz-animation-delay",
		            "-ms-animation-delay",
		            "-o-animation-delay",
		            "animation-delay",
		            "-webkit-animation-iteration-count",
		            "-moz-animation-iteration-count",
		            "-ms-animation-iteration-count",
		            "-o-animation-iteration-count",
		            "animation-iteration-count",
		            "-webkit-animation-direction",
		            "-moz-animation-direction",
		            "-ms-animation-direction",
		            "-o-animation-direction",
		            "animation-direction",
		            "text-align",
		            "-webkit-text-align-last",
		            "-moz-text-align-last",
		            "-ms-text-align-last",
		            "text-align-last",
		            "vertical-align",
		            "white-space",
		            "text-decoration",
		            "text-emphasis",
		            "text-emphasis-color",
		            "text-emphasis-style",
		            "text-emphasis-position",
		            "text-indent",
		            "-ms-text-justify",
		            "text-justify",
		            "letter-spacing",
		            "word-spacing",
		            "-ms-writing-mode",
		            "text-outline",
		            "text-transform",
		            "text-wrap",
		            "text-overflow",
		            "-ms-text-overflow",
		            "text-overflow-ellipsis",
		            "text-overflow-mode",
		            "-ms-word-wrap",
		            "word-wrap",
		            "word-break",
		            "-ms-word-break",
		            "-moz-tab-size",
		            "-o-tab-size",
		            "tab-size",
		            "-webkit-hyphens",
		            "-moz-hyphens",
		            "hyphens",
		            "pointer-events"
		        ],
		        [
		            "opacity",
		            "filter:progid:DXImageTransform.Microsoft.Alpha(Opacity",
		            "-ms-filter:\\'progid:DXImageTransform.Microsoft.Alpha",
		            "-ms-interpolation-mode",
		            "color",
		            "border",
		            "border-width",
		            "border-style",
		            "border-color",
		            "border-top",
		            "border-top-width",
		            "border-top-style",
		            "border-top-color",
		            "border-right",
		            "border-right-width",
		            "border-right-style",
		            "border-right-color",
		            "border-bottom",
		            "border-bottom-width",
		            "border-bottom-style",
		            "border-bottom-color",
		            "border-left",
		            "border-left-width",
		            "border-left-style",
		            "border-left-color",
		            "-webkit-border-radius",
		            "-moz-border-radius",
		            "border-radius",
		            "-webkit-border-top-left-radius",
		            "-moz-border-radius-topleft",
		            "border-top-left-radius",
		            "-webkit-border-top-right-radius",
		            "-moz-border-radius-topright",
		            "border-top-right-radius",
		            "-webkit-border-bottom-right-radius",
		            "-moz-border-radius-bottomright",
		            "border-bottom-right-radius",
		            "-webkit-border-bottom-left-radius",
		            "-moz-border-radius-bottomleft",
		            "border-bottom-left-radius",
		            "-webkit-border-image",
		            "-moz-border-image",
		            "-o-border-image",
		            "border-image",
		            "-webkit-border-image-source",
		            "-moz-border-image-source",
		            "-o-border-image-source",
		            "border-image-source",
		            "-webkit-border-image-slice",
		            "-moz-border-image-slice",
		            "-o-border-image-slice",
		            "border-image-slice",
		            "-webkit-border-image-width",
		            "-moz-border-image-width",
		            "-o-border-image-width",
		            "border-image-width",
		            "-webkit-border-image-outset",
		            "-moz-border-image-outset",
		            "-o-border-image-outset",
		            "border-image-outset",
		            "-webkit-border-image-repeat",
		            "-moz-border-image-repeat",
		            "-o-border-image-repeat",
		            "border-image-repeat",
		            "outline",
		            "outline-width",
		            "outline-style",
		            "outline-color",
		            "outline-offset",
		            "background",
		            "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader",
		            "background-color",
		            "background-image",
		            "background-repeat",
		            "background-attachment",
		            "background-position",
		            "background-position-x",
		            "-ms-background-position-x",
		            "background-position-y",
		            "-ms-background-position-y",
		            "-webkit-background-clip",
		            "-moz-background-clip",
		            "background-clip",
		            "background-origin",
		            "-webkit-background-size",
		            "-moz-background-size",
		            "-o-background-size",
		            "background-size",
		            "box-decoration-break",
		            "-webkit-box-shadow",
		            "-moz-box-shadow",
		            "box-shadow",
		            "filter:progid:DXImageTransform.Microsoft.gradient",
		            "-ms-filter:\\'progid:DXImageTransform.Microsoft.gradient",
		            "text-shadow"
		        ]
		    ]
		}

	}
}