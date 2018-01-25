/*!
* @author : Ahuing
* @date   : 2015-04-10
* @name   : {{name}} v2.10
* @modify : {{now()|date('Y-m-d')}}
*/

!function ($, win, undefined) {
    'use strict';

    var Duang = function (ele, options) {
        this.o       = options
        this.$ele    = $(ele)
        this.$obj    = this.$ele.find(options.obj)
        this.$objex = this.$ele.find(options.objex)
        // 如果正常的切换对象不存在,将扩展对象作为正常的对象,扩展对象清空
        if (!this.$obj.length) {
            this.$obj = this.$objex
            delete this.$objex;
        }
        // 对象长度
        this.len = this.$obj.length
        // 运动方向
        // this.dire = options.effect.search(/top|weibo/) == 0 && 'top' || 'left'
        this.dire = /^(top|weibo|fade)/.test(options.effect) && 'top' || 'left'
        // 运动效果
        this.effect = options.effect.replace(this.dire, '')
    }

    /**
     * @module jqDuang
     * @version v2.10
     * @description 网页特效插件，幻灯片，焦点图，滑动门，滚动图片，轮播图
     * @param {Object} o jqDuang的配置
     * @param {string} o.obj=li jq选择器 要播放的对象
     * @param {string} o.objex=null jq选择器 要播放的扩展对象，可同时切换多个对象集
     * @param {?string} o.cell jq选择器 控制元素的父级 `是外层不是元素本身`
     * @param {string} o.trigger=mouseover 播放时控制元素上的触发事件 `click mouseover`
     * @param {string} o.effect=fade 播放效果 `fade fold left leftLoop leftMarqueue top topLoop topMarqueue weibo`
     * @param {number} o.speed=400 播放速度
     * @param {number} o.index=0 默认索引
     * @param {number} o.autoplay=3000 自动播放间隔时间为0时不自动播放
     * @param {string} o.prevbtn jq选择器 播放上一个
     * @param {string} o.nextbtn jq选择器 播放上一个
     * @param {boolean} o.btnloop 点击上一个下一个按钮时是否循环播放
     * @param {number} o.delay=100 延迟时间,优化`click` or `mouseover`时延迟切换
     * @param {string} o.easing=swing 动画效果扩展 默认jQuery提供`linear` 和 `swing`  其它需要{@link http://gsgd.co.uk/sandbox/jquery/easing|easing}扩展支持
     * @param {boolean} o.fluid=0 启用流体,目前只支持`fade fold left leftLoop`当`o.visible=1` 时的设置
     * @param {string} o.lazyload=null 启用懒加载, `lazyload=src`从图片的`data-src`读取图片的地址并替换给图片的`src`
     * @param {number} o.visible=1 可见数量
     * @param {number} o.steps=1 每次播放的数量
     * @param {boolean} o.overstop=1 鼠标悬停时是否停止播放
     * @param {boolean} o.showtit=0 是否启用显示标题
     * @param {string} o.titletpl 当前播放的标题的模板, o.showtit==1时有效 可以是这样：`'<a class="tit-jd" target="_blank" href="{url}">{title}</a>'` 其中的 `{url} {title}` 会被替换成对应的内容
     * @param {string} o.celltpl=<i>{num}</i> cell内单项的模板 默认：`'<i>{num}</i>'` 其中的 `{num}` 会被替换成对应的索引值，从1开始
     * @param {string} o.pagewrap jq选择器 要显示分页内容的父级
     * @param {string} o.pagetpl={act}/{total} 分页的内容模板，`o.pagewrap`存在时有效 `act` - 当前索引，`total` - 总数
     * @param {boolean} o.wheel=0 是否启用鼠标滚动播放, 需要`mousewheel`支持
     * @param {string} o.actclass=act 播放时当前控制元素上的`class`
     *
     * @方法一 从data启动
     * ```html
     * <div class="jqDuang" data-obj="li" data-cell=".sm" data-prevbtn=".prevbtn" data-nextbtn=".nextbtn" data-effect="left" data-pagewrap=".page">
     *     <div class="lg">
     *        <ul>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *        </ul>
     *    </div>
     *    <div class="sm"></div>
     *    <div class="prevbtn"></div>
     *    <div class="nextbtn"></div>
     *    <div class="page"></div>
     * </div>
     * ```
     * @方法二 从data启动(推荐)
     * ```html
     * <div data-duang="{
            obj: "li", 
            cell: ".sm",
            prevbtn: ".prevbtn",
            nextbtn: ".nextbtn",
            effect: "left",
            pagewrap: ".page"
     * }">
     *     <div class="lg">
     *        <ul>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *        </ul>
     *    </div>
     *    <div class="sm"></div>
     *    <div class="prevbtn"></div>
     *    <div class="nextbtn"></div>
     *    <div class="page"></div>
     * </div>
     * ```
     * @方法三 从js启动
     * ```html
     * <div class="selector">
     *     <div class="lg">
     *        <ul>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *            <li> <a href=""> <img src="" alt=""/> </a> </li>
     *        </ul>
     *    </div>
     *    <div class="sm"></div>
     *    <div class="prevbtn"></div>
     *    <div class="nextbtn"></div>
     *    <div class="page"></div>
     * </div>
     * <script>
     *     
     * $('.selector').jqDuang({
     *   obj: 'li',
     *   cell: '',
     *   trigger: 'mouseover',
     *   effect: 'fade',
     *   speed: 400,
     *   index: 0 ,
     *   autoplay: 3000,
     *   prevbtn: '',
     *   nextbtn: '',
     *   delay: 150,
     *   easing: 'swing',
     *   fluid    : 0,
     *   lazyload : 0,
     *   visible: 1,
     *   steps: 1 ,
     *   overstop: 1,
     *   showtit: 0,
     *   titletpl: '<a class="tit-jd" target="_blank" href="{url}">{title}</a>',
     *   pagewrap: '',
     *   btnloop: 1,
     *   wheel: 0,
     *   actclass: 'act'
     * })
     * </script>
     * ```
     * 
     * @播放前的事件 before.jd
     * @示例 调用
     * ```js
        $('.selector').on('before.jd', function() {
            console.log($(this).data('jqDuang'));
        })
     * ```
     * @播放后的事件 after.jd
     * @示例 调用
     * ```js
        $('.selector').on('after.jd', function() {
            console.log($(this).data('jqDuang'));
        })
     * ```
     * @可用参数及默认配置
     *
     * 
     */
    Duang.DEFAULTS = {
        obj      : 'li',
        cell     : null,
        trigger  : 'mouseover',
        effect   : 'fade',
        speed    : 500,
        index    : 0,
        autoplay : 3000,
        prevbtn  : null,
        nextbtn  : null,
        delay    : 100,
        easing   : 'swing',
        fluid    : 0,
        lazyload : null,
        visible  : 1,
        steps    : 1,
        overstop : 1,
        showtit  : null,
        titletpl : '<a class="tit-jd" target="_blank" href="{url}">{title}</a>',
        celltpl  : '<i>{num}</i>',
        pagewrap : null,
        pagetpl  : '{act}/{total}',
        btnloop  : 1,
        wheel    : 0,
        actclass : 'act'
    };

    Duang.prototype = {

        /**
         * @method template
         * @description 简单的模板引擎
         * @param  {String} tpl 模板字符串
         * @param  {Object} data 数据对象
         * @return {String} 解析后的字符串
         *
         * @example
         * ```js
         * var tpl = '<div>{a}</div><div>{b}</div>'
         * template(tpl, {
         *     a: 1,
         *     b: 2
         * }) // <div>1</div><div>2</div>
         * ```
         */
        template: function(tpl, data) {
            var re = /{([^{<>]+)}/g;
            var match;
            var _tpl = tpl;
            while (match = re.exec(tpl)) {
                _tpl = _tpl.replace( match[0] , data[match[1]] || '' );
            }
            return _tpl.replace(/[\r\t\n]/g, " ");
        },
        /**
         * @method lazyload
         * @description 懒加载
         * @param {array} $items 要处理的img jq对象
         * @ignore
         */
        lazyload: function($items) {
            var lazyload = this.o.lazyload;
            $items.each(function(i, el) {
                $(this).find('img:not(".loaded")').attr('src', function() {
                    return $(this).addClass('loaded').data(lazyload);
                })
            });
        },
        /**
         * @method getSpace
         * @description 获取dom的margin+padding
         * @param  {string} str 要处理的字符串
         * @return {string}     处理后的字符串
         * @ignore
         */
        getSpace: function($el, attr) {
            return $el[$.camelCase('outer-' + attr)](true) - $el[attr]();
        },
        /**
         * @method initBtn
         * @description 初始化按钮事件
         * @param  {string} type 按钮类型
         * @ignore
         */
        initBtn: function(type) {
            var _self  = this,
                o      = _self.o,
                $pnBtn = _self.$ele.find(o[type + 'btn']);

            $pnBtn.on(_self.effect == 'Marqueue' ? o.trigger : 'click.jd', function() {
                if ($(this).hasClass('disabled')) return;
                if (_self.effect == 'Marqueue') {
                    o.steps = type == 'prev' ? 1 : -1;
                    _self.next();
                } else _self[type]()
                // 如果是a链接不做跳转
                return false;
            }).attr({
                unselectable: 'on',
                onselectstart: 'return false;'
            });
        },
        init: function() {
            var _self      = this,
                $obj       = _self.$obj,
                $objP      = $obj.parent(),
                $objPP     = $objP.parent(),
                o          = _self.o,
                ppCss      = {
                                position: 'relative',
                                overflow: 'hidden'
                            },
                dire       = _self.dire,
                attr       = dire == 'top' && 'height' || 'width',
                outerAttr  = $.camelCase('outer-' + attr),
                $cells;

            // 兼容一层p
            if (!{fade: 1, fold: 1}[o.effect]) {
                $objPP = $objP;
                $objP = $('<div class="temp"></div>').append($obj).appendTo($objPP);
            }
            // 分页
            _self.pages = !_self.effect
                // 不循环滚动
                && Math.ceil((_self.len - o.visible) / o.steps) + 1
                // 循环滚动 marqueue loop
                || Math.ceil(_self.len / o.steps);

            // 没有内容
            if (!_self.len) return;
            // 只有一页,不切换
            if (_self.pages <= 1 || _self.len <= o.visible) {
                // 处理懒加载
                _self.play(_self.loopNext = o.index, 1);
                return;
            }
            // 速度为0时启用直接切换
            // if (!o.speed) {
            //     _self.effect = 'fade';
            // }

            $obj.css('float', dire == 'top' ? 'none' : 'left');

            // 每个单元的尺寸
            if (!!o.fluid && o.visible == 1 && {fade: 1, fold: 1, leftLoop: 1, left: 1}[o.effect]) {
                var attr = 'width',
                    space = _self.getSpace($obj.eq(0), attr);

                _self.$ele.css(attr, 'auto');
                _self.size = _self.$ele[outerAttr](true);
                $obj.css(attr, _self.size - space);

                $(win).on('resize.jd', function() {
                    var oSize = _self.size;

                    _self.size = _self.$ele[outerAttr](true);

                    $objP.stop(true, true).css(dire, function(i, v) {
                        // 处理改变后的差值, 循环时+1
                        return parseInt(v) - (_self.size - oSize) * (_self.index + (_self.effect == 'Loop'));
                    });
                    $objPP.css(attr, _self.size);
                    _self.$obj.css(attr, _self.size - space);
                })
            } else {
                _self.size = $obj[outerAttr](true);
            }
            switch (_self.effect) {
                case 'fade':
                    _self.$obj.hide();
                    break;
                case 'fold':
                    $obj.css({
                        position: 'absolute',
                        display: 'none',
                        left: 0,
                        top: 0
                    });

                    ppCss['height'] = $obj.outerHeight(true);
                    $objPP.css(ppCss);
                    break;
                case 'weibo':
                    $objP.css('position', 'relative');
                    ppCss[attr] = _self.size * o.visible;
                    $objPP.css(ppCss);
                    break;
                case 'Marqueue':
                default:
                    var pCss = {
                            position: 'relative',
                            overflow: 'hidden'
                        },
                        $obj1 = $obj.eq(0),
                        // 计算多余的边距,让滚动外框两边对齐
                        marginMore = parseInt($obj1.css('margin-' + dire))
                                    - parseInt($obj1.css('margin-' + (dire == 'left' ? 'right' : 'bottom')));

                    pCss[attr] = 29999;

                    // loop marqueue
                    if (_self.effect) {
                        // 循环时处理
                        _self.$obj = $objP
                            .append($obj.slice(0, o.visible).clone())
                            .prepend($obj.slice(_self.len - o.steps).clone())
                            // .prepend($obj.slice(_self.len - o.visible).clone())
                            .children();
                        // marqueue
                        if (_self.effect == 'Marqueue') {
                            // 滚动的总大小
                            _self.scrollSize = _self.size * _self.len;
                            o.steps = -1;
                            pCss[_self.dire] = 0;
                        }
                    }
                    ppCss[attr] = _self.size * o.visible + marginMore;

                    $objP.css(pCss);
                    $objPP.css(ppCss);
            }

            // 加上作用域
            o.trigger = o.trigger.replace('.jd', '') + '.jd';
            // 分页
            if (o.cell && _self.effect != 'Marqueue') {
                var $cell = _self.$ele.find(o.cell),
                    t;

                $cells = $cell.children();

                if ($cells.length) {
                    $cells = $cells.slice(0, _self.pages);
                    $objP.data('cells', $cells.length);
                } else {
                    var __html = [];
                    for (var i = 0; i < _self.pages; i++) {
                        __html.push(_self.template(o.celltpl, {num: i + 1}));
                    }
                    $cells = $(__html.join('')).appendTo(_self.$ele.find(o.cell));
                }

                _self.$cells = $cells.on(o.trigger, function() {
                        clearTimeout(t);
                        _self.loopNext = $cells.index(this);
                        t = setTimeout(function() {
                                _self.play(_self.loopNext);
                            }, o.delay)
                            //点击时阻止跳转
                        if (o.trigger == 'click.jd') return false;
                    })
            }

            // 自动播放
            if (!!o.autoplay) {
                _self.start();
                (!!o.overstop) &&
                _self.$obj
                    .add($cells)
                    .add(o.prevbtn && _self.effect != 'Marqueue' && o.prevbtn + ',' + o.nextbtn || null)

                    .on('mouseover.jd', $.proxy(_self.stop, _self))
                    .on('mouseout.jd', $.proxy(_self.start, _self))
            }

            // 显示标题
            if (!!o.showtit && o.visible == 1) {
                var objD = $obj.eq(o.index).data();
                // 兼容v2.01之前的代码
                _self.$title = $(_self.template(o.titletpl, objD)).insertAfter($objPP)

                objD = null;
            }

            // 上一个下一个
            if (o.prevbtn) {
                _self.initBtn('prev')
                _self.initBtn('next')
            }
            _self.play(_self.loopNext = o.index, 1)
        },
        /**
         * @method start
         * @description 自动播放插件
         * @示例 js
         * ```js
         *     $('[data-duang=1]').jqDuang('start');
         * ```
         */
        start: function() {
            clearInterval(this.t1);
            this.t1 = setInterval($.proxy(this.next, this), this.o.autoplay);
        },
        /**
         * @method stop
         * @description 停止播放插件
         * @示例 js
         * ```js
         *     $('[data-duang=1]').jqDuang('stop');
         * ```
         */
        stop: function() {
            clearInterval(this.t1);
        },
        /**
         * @method get
         * @param {string} i=null prev next
         * @description 获取上一个,下一个,默认获取当前激活
         * @return {array} jq对象
         * @示例 获取当前激活
         * ```js
         *     $('[data-duang=1]').jqDuang('get');
         * ```
         * @示例 获取上一个
         * ```js
         *     $('[data-duang=1]').jqDuang('get', 'prev');
         * ```
         * @示例 获取下一个
         * ```js
         *     $('[data-duang=1]').jqDuang('get', 'next');
         * ```
         */
        get: function(i) {
            var _self = this,
                o = _self.o,
                loopNext = _self.loopNext,
                offsets;
            if (i == 'prev') {
                loopNext--;
            } else if (i == 'next') {
                loopNext++;
            }

            if (_self.effect == 'Loop') {
                if (i) {
                     if (loopNext == _self.pages + 1) {
                        offsets =  2;
                        // offsets =  o.steps + o.steps;
                    } else if (loopNext == 0) {
                        offsets = _self.len + 1;
                        // offsets = _self.len + o.steps;
                    } else if (loopNext == -2) {
                        offsets = _self.len - 1;
                        // offsets = _self.len - o.steps;
                    } else if (loopNext == -1) {
                        offsets = 0;
                    } else if (loopNext == _self.pages) {
                        offsets =  1;
                        // offsets =  o.steps;
                    }  else {
                        offsets = 1 + loopNext;
                        // offsets = (1 + loopNext) * o.steps;
                    }
                } else {
                    if (loopNext == _self.pages) {
                        offsets =  o.steps;
                    } else if (loopNext == -1) {
                        offsets = _self.len;
                    } else {
                        offsets = (1 + loopNext) * o.steps;
                    }
                }
            } else if (loopNext == _self.pages) {
                offsets = 0;
            } else if (loopNext == _self.pages - 1 || loopNext == -1) {
                offsets = _self.len - o.visible;
            } else {
                if (i && loopNext == _self.pages + 1) {
                    offsets = 1;
                } else {
                    offsets = loopNext * o.steps;
                }
            }
            return _self.$obj.eq(offsets)
        },
        /**
         * @method next
         * @description 播放下一个
         * @示例 js
         * ```js
         *     $('[data-duang=1]').jqDuang('next');
         * ```
         */
        next: function() {
            this.play(this.effect != 'Marqueue' && (this.loopNext = this.index + 1) % this.pages);
        },
        /**
         * @method prev
         * @description 播放上一个
         * @示例 js
         * ```js
         *     $('[data-duang=1]').jqDuang('prev');
         * ```
         */
        prev: function() {
            this.play(((this.loopNext = this.index - 1) + this.pages) % this.pages);
        },
        /**
         * @method play
         * @description 播放第几个
         * @param {number} next 要播放的对象
         * @param {number} speed=0 切换速度
         * @示例 js
         * ```js
         *     $('[data-duang=1]').jqDuang(2);
         * ```
         * @参数说明
         */
        play: function(next, speed) {
            var _self    = this,
                o        = _self.o,
                $objP    = _self.$obj.parent(),
                pCss     = {},
                // 1 只用于初始化
                speed    = speed === 1 ? 0 : (speed || o.speed);

            if (_self.index == next && _self.effect != 'Marqueue') return;
            /**
             * @event before.jd
             * @description 播放前的事件
             * @示例 调用
             * ```js
             *  $('.selector').on('before', function() {
             *      console.log($(this).data('jqDuang'));
             *  })
             * ```
             */
            _self.$ele.trigger('before.jd');
            switch(_self.effect){
                case 'fade' :
                    !!o.lazyload && _self.lazyload(_self.$obj.eq(next));
                    _self.$obj.eq(_self.index).hide()
                    _self.$obj.eq(next).animate({
                        opacity: 'show'
                    }, speed, o.easing);
                    break;
                case 'fold' :
                    !!o.lazyload && _self.lazyload(_self.$obj.eq(next));
                    _self.$obj.stop(true, true).eq(_self.index)
                        .animate({
                            opacity: 'hide'
                        }, speed, o.easing);

                    _self.$obj.eq(next)
                        .animate({
                            opacity: 'show'
                        }, speed, o.easing);
                    break;
                case 'Marqueue' :
                    $objP.css(_self.dire, function(i, v) {
                        var offset = parseInt(v) + o.steps;
                        if (offset <= -_self.scrollSize) offset = 0;
                        else if (offset >= 0) offset = -_self.scrollSize;
                        return offset;
                    });
                    break;
                case 'weibo' :
                        pCss[_self.dire] = _self.size * 9 / 8;

                        $objP.stop(true, true)
                            .animate(pCss, speed, o.easing, function() {
                                var oLi = $objP.children()[_self.$obj.length - 1];
                                oLi.style.display = 'none';
                                $objP[0].insertBefore(oLi, $objP[0].children[0]);
                                $objP[0].style.top = 0;
                                $(oLi).fadeIn()
                            });
                    break;
                default :
                    var loopNext = _self.loopNext,
                        offsets, // 目标位置
                        start;

                    if (_self.effect == 'Loop') {
                        if (loopNext == _self.pages) {
                            // 最后一个向右多滚动一个
                            offsets = o.steps + _self.len;
                            // start = null;
                            // 滚动结束再移到左边同样的位置
                            var fn = function() {
                                $objP.css(_self.dire, -_self.size * o.steps);
                            }
                            // return false;
                        } else if (loopNext == -1) {
                            // 第一个向左多滚动一个
                            offsets = 0;
                            // start = null;
                            // 滚动结束再移到右边同样的位置
                            var fn = function() {
                                $objP.css(_self.dire, -_self.size * _self.len);
                            }
                            // return false;
                        } else {
                            // 正常切换 左边clone数 + 偏移数量 => o.steps + next * o.steps
                            start = offsets = (1 + next) * o.steps;
                        }
                    } else if (loopNext == _self.pages - 1 || loopNext == -1) {
                        offsets = _self.len - o.visible;
                    } else {
                        start = offsets = next * o.steps;
                    }
                    // _self.offsets = offsets;
                    pCss[_self.dire] = -_self.size * offsets;
                    $objP.stop(true, _self.effect == 'Loop').animate(pCss, speed, o.easing, fn);
                    // 懒加载
                    !!o.lazyload && _self.lazyload(_self.$obj.slice(start, start == null ? undefined : start + o.visible));
                    // !!o.lazyload && _self.lazyload(_self.getPage('next'));
                    pCss = null;
            } // switch end
            // 标题
            if(!!o.showtit && o.visible == 1) {
                var objData = _self.$obj.eq(next + (_self.effect == 'Loop') * 1).data();
                _self.$title.html(objData.title).attr('href', objData.url);
            }
            // 分页
            if (o.pagewrap) {
                _self.$ele.find(o.pagewrap).html(_self.template(o.pagetpl, {act: next + 1, total: _self.pages}));
            }
            // 控制按钮
            if (o.cell && _self.$cells) {
                _self.$cells.removeClass(o.actclass).eq(next).addClass(o.actclass)
            }
            // 扩展对象, next过大时没有扩展对象,不执行
            // console.log(_self.$objex);
            if (_self.$objex && _self.$objex.length > next) {
                _self.$objex.hide().eq(next).show();
            }
            //
            _self.index = next;
            // 按钮循环
            if (!o.btnloop && o.prevbtn) {
                _self.$ele.find(o.prevbtn + ',' + o.nextbtn).removeClass('disabled');
                next == 0 && _self.$ele.find(o.prevbtn).addClass('disabled');
                next == _self.pages - 1 && _self.$ele.find(o.nextbtn).addClass('disabled');
            }
            /**
             * @event after.jd
             * @description 播放后的事件
             * @示例 调用
             * ```js
             *  $('.selector').on('after', function() {
             *      console.log($(this).data('jqDuang'));
             *  })
             * ```
             */
            _self.$ele.trigger('after.jd');
        }

    }

    /**
     * @method parseJSON
     * @description 解析json字符串
     * @param  {string} jsonStr json字串
     * @return {object} json对象, 解析不成功返回空对象
     * @example 示例 调用
     * ```js
     * parseJSON('{"a": 1, "b": 1}'); // {"a": 1, "b": 1}
     * parseJSON('{a: 1, b: 1}'); // {"a": 1, "b": 1}
     * parseJSON('aaa'); // {}
     * ```
     */
    function parseJSON(jsonStr) {
        var obj ={};
        try {
            if (typeof jsonStr == 'object') {
                obj = jsonStr;
            } else if (typeof jsonStr == 'string' && /^[\[|\{](\s|.*|\w)*[\]|\}]$/.test($.trim(jsonStr))) {
                obj = (new Function('return ' + jsonStr))();
            }
        } catch (err) {}
        return  obj;
    }

    function Plugin(option, arg) {
        if (option == 'index') {
            return this.data('jqDuang').index;
        }

        if ({get: 1}[option]) {
            return this.data('jqDuang')[option](arg);
        }

        return this.each(function() {
            var $this = $(this),
                data = $this.data('jqDuang'),
                options;
            if (!data) {
                options = $.extend({}, Duang.DEFAULTS, parseJSON($this.data('duang')), $this.data(), typeof option == 'object' && option);

                $this.data('jqDuang', data = new Duang(this, options))
                data.init();
                options = null;
            }
            if (typeof option == 'string') {
                data[option](arg)
            } else if (typeof option == 'number') {
                data.play(data.loopNext = option)
            }
        })
    }

    var old = $.fn.jqDuang;

    $.fn.jqDuang             = Plugin
    $.fn.jqDuang.Constructor = Duang;

    $.fn.jqDuang.noConflict = function () {
        $.fn.jqDuang = old
        return this
    }

    $(win).off('.jqDuang').on('load.jqDuang', function () {
        $('[data-duang], .jqDuang').each(function() {
            var $this = $(this);
            Plugin.call($this, $this.data())
        });
    })
}(jQuery, window);
