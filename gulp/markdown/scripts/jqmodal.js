/**
* author : ahuing
* date   : 2015-04-10
* name   : jqModal v1.20.06
* modify : 2017-05-05
 */

!function ($, win, doc, undefined) {
    // transition.js
    function transitionEnd() {
        var el = doc.createElement('div')
        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        }
        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                }
            }
        }
        return false
    }
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false
        var $el = this
        $(this).one('bsTransitionEnd', function() {
            called = true
        })
        var callback = function() {
            if (!called) $($el).trigger($.support.transition.end)
        }
        setTimeout(callback, duration)
        return this
    }
    $(function() {
        $.support.transition = transitionEnd()
        if (!$.support.transition) return
        $.event.special.bsTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function(e) {
                if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
            }
        }
    })

    /**
     * @method showRange
     * @description 拖拽范围
     * @param  {sting} o 对象本身
     * @param  {string} p 对象的父层，拖拽不能超出父层
     * @param  {number} f 是否fixed
     * @return {json}   minL:最小left,minT最小top,h:对象的高度
     */
    var showRange = function(o, p, f) {
        var $p = $(!f ? 'body' : (p || win))
        , st = $(win).scrollTop()
        , w = o.outerWidth()
        , h = o.outerHeight()
        , pw = $p.width()
        , ph = $p.height()

        return {
            minL   : pw < w ? pw - w : 0
            , minT : ph < h ? ph - h : 0
            , maxL : pw < w ? 0 : $p.width() - w
            , maxT : ph < h ? 0 : $p.height() - h
            , st   : st
            , h    : h
        };
    }

    /**
     * @module jqDrag
     * @description 拖拽插件
     * @param {Object} o jqDrag的配置
     * @param {string} o.handle=null jq选择器 要拖拽的对象
     * @param {string} o.attachment=window jq选择器 要附着的对象，拖拽不能超出此范围
     * @param {number} o.opacity=1 拖拽时的透明度 `0 ~ 1` 之间
     * @param {boolean} o.fixed=1 `fixed`效果
     * 
     * @拖拽前的事件 dragStart
     * @示例 调用
     * ```js
        $('.selector').on('dragStart', function(el, R) {
            console.log(R);
            // R 的值参数 showRange 函数的返回值
        })
     * ```
     * @拖拽时事件 drag
     * @示例 调用
     * ```js
        $('.selector').on('drag', function(el, R) {
            console.log(R);
            // R = [left坐标, top坐标]
        })
     * ```
     * @拖拽前的事件 dragEnd
     * @示例 调用
     * ```js
        $('.selector').on('dragEnd', function(el, R) {
            console.log(R);
            // R = [left坐标, top坐标]
        })
     * ```
     * @示例 从js启动
     * ```html
     * <div class="selector">
     *     <div class="hd">标题</div>
     *     <div class="bd">内容</div>
     * </div>
     * ```
     * ```js
     * $('.selector').jqDrag({
     *   handle: '.hd'
     * })
     * ```
     * @可用参数及默认配置
     * 
     */
    
    var Drag = function (self, opt) {
        this.o = $.extend({}, Drag.defaults, opt);
        this.$self = $(self);
        this.$handle = this.o.handle && this.$self.find(this.o.handle) || this.$self
    }
    Drag.defaults = {
        handle       : ''
        , fixed      : 1
        // , opacity    : 1
        , attachment : ''
    }

    Drag.prototype.init = function () {
        var o = this.o;
        var $self = this.$self.css('animation-fill-mode','backwards');
        var $handle = this.$handle;

        $handle
        .css({
            cursor : 'move'
            // , userSelect : 'none'
        })
        .on('selectstart.drag', function() {
            return false;
        })
        .on('mousedown.drag', function(e) {
            $self
            .css({
                opacity  : o.opacity
                , zIndex : parseInt(new Date().getTime()/1000)
            })
            .trigger('_mousemove', [e.pageX, e.pageY])
            return false;
        })
        .on('_mousemove', function (e, x, y) {
            e.stopPropagation(); 
            var R = showRange($self, o.attachment, o.fixed)
            , p = $self.position()
            , pl = p.left - x
            , pt = p.top - y
            , dT = null
            , l, t;
            
            $self.trigger('dragStart', [R])
            $(doc).on('mousemove.drag', function(de) {
                // 阻止对象的默认行为,防止在img,a上拖拽时出错
                de.preventDefault();
                var nL = pl + de.pageX
                , nT   = pt + de.pageY

                l = nL < R.minL ? R.minL : (nL > R.maxL ? R.maxL : nL)
                t = nT < R.minT ? R.minT : (nT > R.maxT ? R.maxT : nT);

                $self.css({
                    left : l
                    , top : t
                }).trigger('drag', [l, t])

            }).on('mouseup.drag',function() {
                // 防止多次绑定
                $(this).off('.drag');
                $self.trigger('dragEnd', [l, t])
            });
        })
    }

    function PluginDrag(option) {
        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('jqDrag')
            var options = $.extend({}, Drag.defaults, $this.data(), typeof option == 'object' && option)

            if (!data) { 
                $this.data('jqDrag', (data = new Drag(this, options)))
                data.init();
                // data.show()
            }
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.jqDrag = PluginDrag;
    
    /**
     * @module jqModal 弹窗插件
     * @description jqmodal参数配置
     * @param {Object} o jqModal的配置
     * @param {string} o.mclass=modal 弹窗的class 其它值 `tip` `lay`
     * @param {string} o.head=null 弹窗的头部内容
     * @param {string} o.foot=null 弹窗的底部内容
     * @param {boolean} o.fixed=1 `fixed`效果
     * @param {boolean} o.zIndex=0 弹窗的zIndex 默认为空的，是最高层
     * @param {boolean} o.drag=1 可拖拽 2,3 另一类样式
     * @param {boolean} o.lock=0 锁定遮罩层，点击遮罩层不会关闭弹窗
     * @param {number} o.overlay=.3 遮罩层的透明度 `0 ~ 1` 之间
     * @param {object} o.css={} 弹窗的css
     * @param {object} o.headcss={} 弹窗头部的css
     * @param {object} o.bodycss={} 弹窗内容的css
     * @param {object} o.footcss={} 弹窗底部的css
     * @param {string} o.animate=bounceInDown 弹窗动画 其它参数 `shake` `flipInY` `bounceInDown` `zoomIn` 为空时禁用动画
     * @日志
     * v1.13 修复了不启用动画时的延迟问题
     * v1.20 加入modal,load,progress方法,调整远程调用
     * @示例 从html启动
     * 
     * btn-jqModal是固定的，href（data-target=".modal"）是对应的弹窗 `btn-jqModal` `modal` 都可以设置 jqModal的参数， `btn-jqModal` 参数优先，`modal` 里面`data-close="1"`可以直接关闭当前弹窗
     * ```html
     *  <a href=".modal" class="btn-jqModal" data-css='{"width": 300}'>点击显示弹窗</a>
        
        <div class="modal">
            <div class="body"></div>
            <div class="close" data-close="1">关闭按钮</div>
        </div>
     * ```
     * @示例 从js启动
     * ```html
     *  <a href="#" class="btn">点击显示弹窗</a>
        
        <div class="modal">
            <div class="body"></div>
        </div>
     * ```
     * ```js
     * $('.btn').click(function() {
            $('.modal').jqModal({
                mclass : 'modal' ,
                head   : '这里是头部' ,
                foot   : '这里是底部' ,
                fixed  : 1 ,
                overlay: .3 ,
                drag   : 1 ,
                lock   : 0 ,
                css    : {"width", 300},
                headcss: {},
                bodycss: {},
                footcss: {},
                animate: 'bounceInDown'
            })
         })
     * ```
     * @事件 showFun 弹窗显示前调用
     * ```js
     *  $('.modal').on('showFun', function() {
            console.log(111);
         })
     * ```
     * @事件 shownFun 弹窗显示后调用
     * ```js
     *  $('.modal').on('shownFun', function() {
            console.log(111);
         })
     * ```
     * ```
     * @事件 hideFun 弹窗隐藏前调用
     * ```js
     *  $('.modal').on('hideFun', function() {
            console.log(111);
         })
     * ```
     * @事件 hidenFun 弹窗隐藏后调用
     * ```js
     *  $('.modal').on('hidenFun', function() {
            console.log(111);
         })
     * ```

     * @可用参数及默认配置
     * 
     */
    var Modal = function (self, opt) {
        this.o       = opt;
        this.$self   = $(self).addClass('jq-modal')
        this.isShown = false
    }

    Modal.defaults = {
        mclass: 'modal', //[ modal | tip | lay ]
            
        head: '', //标题
            
        foot: '', // 内容
            
        fixed: 1, //fixed效果
            
        overlay: .3, //显示遮罩层, 0为不显示
            
        drag: 1, //拖拽 1
            
        lock: 0, //锁定遮罩层
        hidetype: 'hide',
        css: {},
        headcss: {},
        bodycss: {},
        footcss: {},
        animate: 'bounceInDown' // shake | flipInY | bounceInDown | zoomIn | fadeIn
    }

    Modal.prototype = {
        init : function () {            
            var _this = this;
            var o = _this.o;
            var _target = o.target;
            var html = '<div class="jqModal animated">\
                            <div class="m-content m-' + o.mclass + '">\
                                <div class="m-head">' + o.head + '</div>\
                                <div class="m-body"></div>\
                                <div class="m-foot">' + o.foot + '</div>\
                            </div>\
                        </div>';

            //加载遮罩层
            if (o.overlay) {
                _this.$overlay = $('<div class="m-overlay"></div>').appendTo('body')
                                .css({
                                    opacity : o.overlay
                                })
                                .on('click', !o.lock && $.proxy(_this.hide, _this) || $.noop);
            }
            // 装载弹出层
            _this.$box = $(html).appendTo('body')
                        .css($.extend({}, o.css, {
                            position : o.fixed && 'fixed' || 'absolute'
                        }))
                        // close
                        .off('.modal')
                        .on('click.modal', '[data-close]:not([name="submit"])', $.proxy(_this.hide, _this));

            _this.$hd = _this.$box.find('.m-head')
                .css($.extend({}, o.headcss, !o.head && {
                    display: 'none'
                }));

            _this.$bd = _this.$box.find('.m-body').css(o.bodycss);

            var $ft = _this.$box.find('.m-foot')
                .css($.extend({}, o.footcss, !o.foot && {
                    display: 'none'
                }));

            if (o.head || o.mclass == 'lay') {
               $ft.after('<a class="m-close" data-close="1" title="关闭" href="#"></a>');
            };

            _this.$bd.append(_this.$self.css('display', 'block'));

            if (o.drag) {
                _this.$drag = $('<div class="jqModal-drag"></div>').insertAfter(_this.$box);

                _this.$hd
                    .on('mousedown', function(e) {
                        _this.$drag.addClass('jqModal-drag' + o.drag).trigger('_mousemove', [e.pageX, e.pageY]);
                    }).css('cursor', 'move')

                $(doc)
                    .on('mouseup', function() {
                        _this.$drag.removeClass('jqModal-drag' + o.drag);
                    });

                _this.$drag.on(o.drag > 1 ? 'dragEnd' : 'drag', function(el, l, t) {
                    _this.$box.css({
                        left: l,
                        top: t
                    });
                })

            }

            o.fixed && $(win).on('resize', $.proxy(_this.setPos, _this));
            
            _this.resetZ();
            _this.show();

            if (o.css.height) {
                var bdH = o.css.height - _this.$hd.outerHeight() - (_this.$bd.outerHeight() - _this.$bd.height());
                _this.$bd.height(bdH);
                _this.$self.height(bdH);
            }
            _this.setPos();

            delete o.headcss
            delete o.bodycss
            delete o.footcss
            delete o.mclass
            delete o.head
            delete o.foot
        },
        resetZ: function() {
            var Z = this.o.zIndex || parseInt(new Date().getTime()/1000);
            this.$box.css('z-index', Z);
            this.$drag && this.$drag.css('z-index', Z);
            this.$overlay.css('z-index', Z);
        }
        /**
         * @method show
         * @description 显示弹窗
         * @example
         * ```js
         * $(selector).jqModal('show');
         * ```
         */
        , show : function () {
            var _this = this;
            // 只执行一次
            if (_this.isShown) return;
            _this.$self.trigger('showFun');
            _this.$overlay && _this.$overlay.fadeIn();
            _this.$box.css('display','block');

            if ($.support.transition) { 
                _this.$box.addClass(_this.o.animate);
                // get duration
                if (!_this.o.duration && _this.o.animate) {
                    _this.o.duration = parseFloat(_this.$box.css('animation-duration')) * 1000;
                }
            }
            _this.$self.trigger('shownFun');
            // 激活当前
            $('.jq-modal-act').removeClass('jq-modal-act');
            _this.$self.addClass('jq-modal-act jq-modal-isshow');
            _this.isShown = true
        }
        , hideModal : function () {
            var hidetype = this.o.hidetype;
            this.$self.removeClass('jq-modal-act jq-modal-isshow');
            $('.jq-modal-isshow').eq(-1).addClass('jq-modal-act')
            this.$self.trigger('hidenFun');
            // 放最后
            this.$box.removeClass(this.o.animate + 'H')[hidetype]()
        }
        /**
         * @method hide
         * @description 隐藏弹窗
         * @example
         * ```js
         * $(selector).jqModal('hide');
         * ```
         * ```js
         * $(selector).jqModal('hide');
         * ```
         */
        , hide : function () {
            var _this = this;
            // 只执行一次
            if (!_this.isShown) return;
            _this.$self.trigger('hideFun');
            if ($.support.transition && _this.o.animate) {
                _this.$box
                    .removeClass(_this.o.animate)
                    .addClass(_this.o.animate + 'H')
                    .one('bsTransitionEnd', $.proxy(_this.hideModal, _this))
                    .emulateTransitionEnd(_this.o.duration)
            } else {
                _this.hideModal()
            }

            _this.$overlay && _this.$overlay.stop(1, 1).fadeOut(function() {
                $(this)[_this.o.hidetype]();
            });
            // 清空displsy
            _this.$drag && _this.$drag[_this.o.hidetype]().css('display', '');
            _this.isShown = false;
            return false;
        }
        , setOption : function(opt) {
            $.extend(true, this.o, opt);
        }
        /**
         * @method toggle
         * @description toggle 显示或隐藏弹窗
         * @param {Number} speed=0 延迟多长时间隐藏弹窗 单位 ms
         * @example
         * ```js
         * $(selector).jqModal('toggle');
         * ```
         */
        , toggle : function (speed) {
            return this.isShown ? this.hide(speed) : this.show()
        }
        /**
         * @method setPos
         * @description 设置弹窗的位置
         * @param {Boolean} isComplete 远程链接时是否加载完成
         * @example
         * ```js
         * $(selector).jqModal('setPos');
         * ```
         */
        , setPos : function (){
            var _this = this;
            var o = _this.o
            var R = showRange(_this.$box, null, o.fixed);
            _this.fixedT = o.css.bottom >= 0 ? R.maxT - o.css.bottom : (o.css.top || ($(win).height() - R.h) / 2);

            _this.$box.css({
                left: o.css.right >= 0 ? 'auto' : (o.css.left || R.maxL / 2),
                    // top: _this.fixedT + ((isIE6 || !o.fixed) && R.st), 
                top: _this.fixedT + (!o.fixed && R.st)
            });

            if (o.drag) {
                _this.$drag[0].style.cssText = _this.$box[0].style.cssText;
                _this.$drag.css({
                    width: _this.$box.width() - 6,
                    height: _this.$box.height() - 6,
                    display: ''
                })
                PluginDrag.call(_this.$drag, {
                    fixed: _this.o.fixed
                })
            }
        }
    }

    function Plugin(option, opt) {
        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('jqModal')
            var options = $.extend({}, Modal.defaults, $this.data(), typeof option == 'object' && option)

            if (!data) { 
                $this.data('jqModal', (data = new Modal(this, options)))
                data.init()
            } else {
                if (typeof option == 'string') data[option](opt)
                else data['toggle']()
            }
        })
    }

    var old = $.fn.jqModal;

    $.fn.jqModal             = Plugin
    $.fn.jqModal.Constructor = Modal;

    $.fn.jqModal.noConflict = function () {
        $.fn.jqModal = old
        return this
    }

    // $('<link rel="stylesheet">').appendTo('head').attr('href', (typeof(tplurl) != 'undefined' ? tplurl : '') + 'css/jqmodal.css');

    $(doc)
        .off('.jqmodal-init').on('click.jqmodal-init', '.btn-jqModal', function(e) {
            var $this   = $(this)
            // target兼容之前的配置
            var content = $this.data('content') || $this.data('target') || $this.attr('href')

            var isUrl = /http/.test(content);
            
            if (isUrl) {
                $.jqModal.modal($.extend({content: content}, $this.data()))  
            } else {
                if (typeof content == 'string') {
                    var $content = $(content.replace(/.*(?=#[^\s]+$)/, ''))
                    // 设置回content 方便后续调用
                    $this.data('content', $content);
                    var option = $.extend($content.data(), $this.data())
                   
                } else {
                    // 已经初始化
                    var $content = content;
                    var option = 'toggle';
                }

                Plugin.call($content, option) 
            }
            if ($this.is('a')) e.preventDefault();
        })
        .on('keydown.jqmodal-init', function(e){
            e.which == 27 && $('.jq-modal-act').jqModal('hide');
            return true;
        });

    $.jqModal = {
        modal: function() {
            var args = arguments;
            var _this = this;
            var _option = $.extend(true, {
                content: null,
                // mclass: 'modal',
                drag: 1, // 2
                lock: 1,
                bodycss: {
                    padding: 0,
                    overflow: 'auto'
                },
                type: 'ajax',
                hidetype: 'remove',
                ajaxOpt: {},
            }, args[0]);

            var $target = $('.jqmodal');
            if (args[0] == 'hide' && $target.length) {
                Plugin.call($target, 'hide');
                return false;
            }
            if (_option.type == 'html') {
                $target = $('<div class="jqmodal"></div>').html(_option.content);  
                _option.done && _option.done.call($target);   
            } else if (_option.type == 'ajax') {
                $target = $('<div class="jqmodal"></div>')
                // ajax
                _option.ajaxOpt.url = _option.content
                $.ajax($.extend(true, {
                        dataType: 'html'
                    }, _option.ajaxOpt))
                    .done(function(html) {
                        $target.html(html);
                        Plugin.call($target, 'setPos');
                        _option.done && _option.done.call($target, html);
                    });
            } else {
                $target = $('<iframe class="jqmodal"/>')
                            .attr({
                                scrolling: 'auto',
                                allowtransparency: true,
                                frameborder: 0,
                                src: _option.content
                            })

                // 自动高度 注意顺序
                if (_option.css && !_option.css.height) {
                    $target.load(function() {
                        var contents = $target.css('background', 'none').trigger('shownFun').contents()
                        contents.length && $target.add($target.data('jqModal').$bd).height(contents.find('body').outerHeight(true));
                        Plugin.call($target, 'setPos')
                        _option.done && _option.done.call($target);
                    })
                }
            }

            
            delete _option.content
            delete _option.type
            delete _option.ajaxOpt

            Plugin.call($target, _option);
            // 重置位置
            // Plugin.call($target, 'setPos');
            return $target;
        },
        /**
         * @method jqmodal扩展 tip 
         * @description 提示框
         * @param {String} info 提示信息
         * @param {String} tag 标记 info - 信息，success - 成功，error - 错误
         * @param {Number} timeout=1500 自动关闭时间
         */
        tip : function () {
            var $target = $('.jqtip')
            var args = arguments;
            var _this = this;
            var _timeout = args[2] || 1500;
            var option = {
                animate: 'shake',
                mclass: 'tip',
                css: {
                    top: 100
                },
                drag: 0,
                lock: 1
            };

            if (!$target[0]) {
                $target = $('<div class="jqtip"><i class="ico"></i><div class="bd"></div></div>')//.appendTo('body');
                $target.on('hideFun', function() {
                    clearTimeout(_this.t);
                })
                Plugin.call($target, option);
            }
            if (args[0] == 'hide') {
                // 去掉动画
                $target.jqModal('setOption', {animate: ''})
                        .jqModal('hide');
            } else {
                $target
                    .children('.ico')
                    .removeClass()
                    .addClass('ico font-modal-'+ (args[1] || 'info'));
                $target.children('.bd').html(args[0]);

                $target.jqModal('setOption', {animate: option.animate})
                    .jqModal('show')
                    .jqModal('setPos')
                    .jqModal('resetZ');
                // 自动关闭
                _this.t = setTimeout(function() {
                    Plugin.call($target, 'hide');
               }, args[2] || 1500);    
            }
            option = null;
        }
        /**
         * @method jqmodal扩展 load
         * @description js的alert
         * @param {String} option 提示信息
         */
        , load : function () {
            var $target = $('.jqload');
            var args = arguments;
            var option = {
                mclass: 'load',
                animate: null,
                css: {
                    top: 100
                },
                drag: 0,
                lock: 1
            };

            if (!$target[0]) {
                $target = $('<div class="jqload">\
                                <i class="ico font-modal-load"></i>\
                                <div class="bd"></div>\
                            </div>')//.appendTo('body');
                Plugin.call($target, option);
            }
            if (args[0] == 'hide') {
                Plugin.call($target, 'hide');
            } else {
                $target.children('.bd').html(args[0] || 'loading...');
                // 重置位置
                $target.jqModal('show')
                    .jqModal('setPos')
                    .jqModal('resetZ')
            }
            option = null;
        }
        /**
         * @method jqmodal扩展 alert
         * @description js的alert
         * @param {String} option 提示信息
         */
        , alert : function () {
            var $target = $('.jqalert');
            var args = arguments;
            var option = {
                mclass: 'alert',
                head: '提示信息',
                animate: null,
                hidetype: 'remove',
                lock: 1,
                foot: '<button data-close="1" class="btn-accept">确定</button>'
            };

            if (!$target[0]) {
                $target = $('<div class="jqalert">\
                                <i class="ico"></i>\
                                <div class="bd"></div>\
                            </div>');
            }
            $target.children('.ico')
                .removeClass()
                .addClass('ico font-modal-'+ (args[1] || 'info'));
            $target.children('.bd').html(args[0]);
            // 隐藏tip 不允许同时存在
            $.jqModal.tip('hide');
            Plugin.call($target, option);
            Plugin.call($target, 'setPos'); 
        }
        /**
         * @method jqmodal扩展 lay
         * @description 显示一个弹窗
         * @param {String} txt 弹窗的内容
         */
        , lay : function () {
            var $target = $('.jqlay');
            var args = arguments;
            if (!$target[0]) {
                $target = $('<div class="jqlay">'+ args[0] +'</div>');
            }

            $target.jqModal({
                animate: 'zoomIn',
                hidetype: 'remove',
                mclass: 'lay'
            }).html(args[0]);
        }
        /**
         * @method jqmodal扩展 confirm
         * @description 与js的confirm一样
         * @param {String} txt 提示信息
         * @param {Function} acceptFn 确定的回调
         * @param {Function} cancelFn 取消的回调
         * @param {String} head 标题
         */
        , confirm : function () {
            var $target = $('.jqconfirm');
            var args = arguments;
            var option = {
                    mclass: 'confirm',
                    head: args[3] || '提示',
                    animate: null,
                    drag: 0,
                    lock: 1,
                    foot: '<button data-confirm-btn="1" class="btn-accept">确定</button><button data-confirm-btn="2" class="btn-cancel">取消</button>'
                };

            if (!$target[0]) {
                $target = $('<div class="jqconfirm">\
                                <i class="ico font-modal-ask"></i>\
                                <div class="bd"></div>\
                            </div>')//.appendTo('body');
            }

            $target.jqModal(option)
                .children('.bd').html(args[0]);

            $(doc)
                .off('.confirm')
                .on('click.confirm', '[data-confirm-btn]', function() {
                    var fn = $(this).data('confirm-btn');
                    args[fn] && args[fn].call($target);
                    Plugin.call($target, 'hide');
                });
        }
        /**
         * @method jqmodal扩展 prompt
         * @description 与js的prompt一样
         * @param {String} txt 提示信息
         * @param {Function} acceptFn 确定的回调
         * @param {Function} cancelFn 取消的回调
         * @param {String} head 标题
         */
        , prompt : function () {
            var $target = $('.jqprompt');
            var args = arguments;
            var option = {
                    mclass: 'prompt',
                    head: args[3] || '提示',
                    hidetype: 'remove',
                    drag: 0,
                    animate: null,
                    lock: 1,
                    foot: '<button data-prompt-btn="1" class="btn-accept">确定</button><button data-prompt-btn="2" class="btn-cancel">取消</button>'
                };

            if (!$target.length) {
                $target = $('<div class="jqprompt">\
                                <div class="h">\
                                </div>\
                                <div class="b">\
                                    <textarea cols="30" rows="3"></textarea>\
                                </div>\
                            </div>')//.appendTo('body');

            }

            $target.find('.h').html(args[0]);
            // 清空原有的数据
            $target.find('textarea').val('');

            Plugin.call($target, option);

            $(doc)
                .off('.prompt')
                .on('click.prompt', '[data-prompt-btn]', function() {
                    var fn = $(this).data('prompt-btn');
                    var res = false;
                    if (args[fn]) {
                        var info = $target.find('textarea').val();
                        res = args[fn].call(this, info);
                        // 返回false不关闭弹窗
                        res = res == false ? false : true;
                    } else {
                        res = true;
                    }
                    res && Plugin.call($target, 'hide');
                });
        },
        progress: function() {
            var $progressBar = $('.progress-bar');
            var args = arguments;

            if (!$progressBar.length) {
                $progressBar = $('<div class="progress-bar"> <div class="progress-bar-inner"></div> </div>').appendTo('body');
            }
            if (args[0] == '100%' || args[0] == 'hide') {
                $progressBar.children().stop().animate({width: args[0]}, function() {
                    $(this).width(0);
                });       
            } else {
                $progressBar.children().stop(true, true).animate({width: args[0] || '50%'}, 1500);
            }
        }
    }
    
}(jQuery, window, document);


