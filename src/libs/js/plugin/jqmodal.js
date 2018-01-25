/**
* author : ahuing
* date   : 2015-04-10
* name   : jqModal v1.24.07
* modify : 2018-1-3
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
     * @method _showRange
     * @description 拖拽范围
     * @param  {String} o 对象本身
     * @param  {String} p 对象的父层，拖拽不能超出父层
     * @param  {number} f 是否fixed
     * @return {Object}   l,t左点，r,b右点,h:对象的高度
     */
    var _showRange = function(o, p, f) {
        var $p = $(!f ? 'body' : (p || win)),
            w = o.outerWidth(),
            h = o.outerHeight(),
            pw = $p.width(),
            ph = $p.height()

        return {
            l: pw < w ? pw - w : 0,
            t: ph < h ? ph - h : 0,
            r: pw < w ? 0 : $p.width() - w,
            b: ph < h ? 0 : $p.height() - h,
            h: h
        };
    };
    /**
     * @method _template
     * @description 简单的模板引擎
     * @param  {String} tpl 模板字符串
     * @param  {Object} data 数据对象
     * @return {String} 解析后的字符串
     *
     * @example
     * ```js
     * var tpl = '<div>{a}</div><div>{b}</div>'
     * _template(tpl, {
     *     a: 1,
     *     b: 2
     * }) // <div>1</div><div>2</div>
     * ```
     */
    var _template = function(tpl, data) {
        var re = /{([^{<>]+)}/g;
        var match;
        var _tpl = tpl;
        while (match = re.exec(tpl)) {
            _tpl = _tpl.replace( match[0] , data[match[1]] || '' );
        }
        return _tpl.replace(/[\r\t\n]/g, " ");
    };
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
     *  $('.selector').on('dragStart', function(el, R) {
     *      console.log(R);
     *      // R 的值参数 _showRange 函数的返回值
     *  })
     * ```
     * @拖拽时事件 drag
     * @示例 调用
     * ```js
     *  $('.selector').on('drag', function(el, R) {
     *      console.log(R);
     *      // R = [left坐标, top坐标]
     *  })
     * ```
     * @拖拽前的事件 dragEnd
     * @示例 调用
     * ```js
     *  $('.selector').on('dragEnd', function(el, R) {
     *      console.log(R);
     *      // R = [left坐标, top坐标]
     *  })
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
            var R = _showRange($self, o.attachment, o.fixed)
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

                l = nL < R.l ? R.l : (nL > R.r ? R.r : nL)
                t = nT < R.t ? R.t : (nT > R.b ? R.b : nT);

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
     * @module jqModal
     * @description 弹窗插件 jqmodal参数配置
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
     * @param {string} o.container=body 弹窗相对的容器
     * @param {object} o.headcss={} 弹窗头部的css
     * @param {object} o.bodycss={} 弹窗内容的css
     * @param {object} o.footcss={} 弹窗底部的css
     * @param {string} o.animate=bounceInDown 弹窗动画 其它参数 `shake` `flipInY` `bounceInDown` `zoomIn` 为空时禁用动画
     * @日志 1
     * 
     * v1.13 修复了不启用动画时的延迟问题<br/>
     * v1.20 加入`modal,load,progress`方法,调整远程调用<br/>
     * v1.21 加入`popover`方法, `jqmodal`加上`container`配置，`setPos`方法加上参数配置可以直接设置弹窗的`css`<br/>
     * v1.22 去掉`load`方法，合并到tip方法中，优化`alert` `prompt` `lay`方法 <br/>
     * v1.23 优化使用模板引擎处理代码提高转换性能 <br/>
     * v1.24.07 排除data-role关闭 <br/>
     * 
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
        container: 'body',
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
                            <div class="m-content m-{mclass}">\
                                <div class="m-head">{head}</div>\
                                <div class="m-body"></div>\
                                <div class="m-foot">{foot}</div>\
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
            _this.$box = $(_template(html, o))
                        .appendTo(o.container)
                        .css($.extend({}, o.css, {
                            position : o.fixed && 'fixed' || 'absolute'
                        }))
                        // close
                        .off('.modal')
                        .on('click.modal', '[data-close]:not([name="submit"], [data-role])', $.proxy(_this.hide, _this));

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
            this.$overlay && this.$overlay.css('z-index', Z);
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
         * @param {Object} [cssOpt] css对象
         * 
         * @example
         * 
         * ```js
         * $(selector).jqModal('setPos');
         * ```
         * 
         * @example 可设css
         * 
         * ```js
         * $(selector).jqModal('setPos', {
         *     left: 1, 
         *     top: 1
         * });
         * ```
         */
        , setPos: function(cssOpt){
            var _this = this;
            var o =  _this.o;
            var _css = $.extend({}, o.css, cssOpt);

            var R = _showRange(_this.$box, null, o.fixed);
            _this.fixedT = _css.bottom >= 0 ? R.b - _css.bottom : (_css.top || ($(win).height() - R.h) / 2);

            _this.$box.css({
                left: _css.right >= 0 ? 'auto' : (_css.left || R.r / 2),
                    // top: _this.fixedT + ((isIE6 || !o.fixed) && R.s), 
                top: _this.fixedT // + (!o.fixed && R.s)
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
        .off('.jqmodal-init')
        .on('click.jqmodal-init', '.btn-jqModal', function(e) {
            var $this   = $(this);
            var elData = $this.data();
            // target兼容之前的配置
            var content = elData.content || elData.target || $this.attr('href')

            if (elData.type == 'popover') {
                $.jqModal.popover($this);
            } else if (/http/.test(content)) {
                $.jqModal.modal($.extend({content: content}, elData))  
            } else {
                if (typeof content == 'string') {
                    var $content = $(content.replace(/.*(?=#[^\s]+$)/, ''))
                    // 设置回content 方便后续调用
                    $this.data('content', $content);
                    var option = $.extend($content.data(), elData)
                   
                } else {
                    // 已经初始化
                    var $content = content;
                    var option = 'toggle';
                }

                Plugin.call($content, option) 
            }
            e.preventDefault();
            e.stopPropagation();
        })
        .on('mouseover.jqmodal-init mouseout.jqmodal-init', '[data-type="popover"]', function(e) {
            $.jqModal.popover(e.type == 'mouseout' ? 'hide' : $(this));
            e.preventDefault();
            e.stopPropagation();
        })
        .on('keydown.jqmodal-init', function(e){
            e.which == 27 && $('.jq-modal-act').jqModal('hide');
            return true;
        });

    $.jqModal = {
        /**
         * @method modal 弹窗
         * @description jqmodal扩展
         * @param {Object} opt 与jqmodal的配置一致
         * @param {String} opt.type=iframe 弹窗的类型 `ajax` `iframe` `html`
         * @param {Function} opt.done=null 弹窗展示内容后的回调函数 `ajax` 时为调用成功的回调 `iframe`时是iframe加载完成的回调 `html`时是内容替换后的回调
         * @param {String} opt.content=null 弹窗内容
         * 
         * @示例 自动调用 iframe
         * ```html
         *    <a href="http://www.qq.com" data-type="iframe" data-head="弹窗标题 iframe调用" class="btn-jqModal"></a>
         * ```
         * @示例 自动调用 ajax
         * ```html
         *  <a href="http://www.xxx.com/ajax.php" data-type="ajax" data-head="弹窗标题iframe调用" class="btn-jqModal"></a>
         *  ```
         * @示例 自动调用 html
         * 
         *  ```html
         *  <a href="#" data-conent="弹窗的内容" data-type="html" data-head="弹窗标题iframe调用" class="btn-jqModal"></a>
         *  ```
         * @示例 从js调用
         * 
         *  ```html
         *  <a href="#" class="btn"></a>
         *  ```
         *  ```js
         *  $('.btn').click(function(event) {
         *      $.jqModal.modal({
         *          head: '弹窗标题'
         *          type: 'ajax',
         *          conent: 'http://www.xxx.com/ajax.php'
         *          done: function(res) {
         *              var $modal = this; // 弹窗本身
         *              console.log('ajax已经成功完成');

         *              console.log(res); // ajax的返回结果
         *          }
         *      })
         *      event.preventDefault()
         *  });
         *  ```
         */
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

            if (args[0] == 'hide') {
                $target.jqModal('hide')
                return;
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
                        $target.html(html).jqModal('setPos');
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
         * @method tip
         * @description 提示框 jqmodal扩展
         * @param {String} text 提示信息
         * @param {String} [status=info] 标记 info - 信息，success - 成功，error - 错误
         * @param {Number} [timeout=1500] 自动关闭时间
         * 
         * @example 提示框
         * 
         * ```js
         * $.jqModal.tip('操作成功！', 'success');
         * $.jqModal.tip('hide'); // 手动隐藏
         * ```
         * @example 加载框
         * 
         * ```js
         * $.jqModal.tip('loading', 'load');
         * $.jqModal.tip('hide'); // 手动隐藏
         * ```
         */
        tip: function() {
            var $target = $('.jqtip')
            var args = arguments;
            var _this = this;
            var _timeout = args[2] || 1500;
            // load时要去掉动画
            var option = {
                animate: args[1] != 'load' ? 'shake' : null,
                mclass: 'tip',
                css: {
                    top: 100
                },
                drag: 0,
                lock: 1
            };
            var _tpl = '<i class="ico font-modal-{status}"></i><div class="bd">{text}</div>';
            if (!$target[0]) {
                $target = $('<div class="jqtip"></div>')
                            .on('hideFun', function() {
                                clearTimeout(_this.t);
                            })
                            .jqModal(option)
            }
            if (args[0] == 'hide') {
                // 去掉动画
                $target.jqModal('setOption', {animate: ''})
                        .jqModal('hide');
            } else {
                $target
                    .html(_template(_tpl, {
                            status: args[1] || 'info',
                            text: args[0]
                        }))
                    .jqModal('setOption', option)
                    .jqModal('show')
                    .jqModal('setPos')
                    .jqModal('resetZ');
                // 自动关闭, load除外
                if (args[1] != 'load') {
                    _this.t = setTimeout(function() {
                        Plugin.call($target, 'hide');
                   }, _timeout);    
                };
            }
            option = null;
        }, 
        /**
         * @method lay
         * @description jqmodal扩展 显示一个没有标题的弹窗
         * @param {String} html 弹窗的内容
         * @example
         * ```js
         * $.jqModal.lay('<img width="500" height="400" src="1.jpg" />');
         * ```
         */
        lay: function(html) {
            return $('<div class="jqlay">'+ html +'</div>').jqModal({
                mclass: 'lay',
                animate: 'zoomIn',
                hidetype: 'remove'
            });
        },
        /**
         * @method confirm
         * @description jqmodal扩展 与js的confirm一样
         * @param {Object|String} confirmOpt `comfirm`的配置, 当`confirmOpt=hide`时, 隐藏confirm
         * @param {String} confirmOpt.text=你确定要这样操作吗？ 提示信息
         * @param {Function} confirmOpt.accept=null 点击确定的回调
         * @param {Function} confirmOpt.cancel=null 点击取消的回调
         * @param {String} confirmOpt.template=null `comfirm`内容模板
         * @param {Object} modalOpt `jqmodal`本身的配置，与`jqmodal`一致
         * 
         * @example
         * ```js
         *  $.jqModal.comfirm({
         *      text: '你确定要这样操作吗？',
         *      accept: function() {
         *          var $this = this; // confirm本身
         *          console.log('您点击了确定！');
         *      },
         *      cancel: function() {
         *          var $this = this; // confirm本身
         *          console.log('您点击了取消！');
         *      },
         *      template: '<i class="ico font-modal-ask"></i>\
         *                      <div class="bd"></div>',
         *      done: function(opt) {
         *          var $target = this; // confirm本身
         *          console.log(opt.text); // 你确定要这样操作吗？
         *      }
         *  }, {
         *      head: '提示'
         *  })
         * ```
         */
        confirm : function(confirmOpt, modalOpt) {
            var _confirmOpt = $.extend({}, {
                text: '你确定要这样操作吗？',
                status: 'ask',
                accept: null,
                cancel: null,
                template: '<i class="ico font-modal-{status}"></i>\
                                <div class="bd">{text}</div>',
            }, confirmOpt);

            var _modalOpt = $.extend(true, {}, {
                    mclass: 'confirm',
                    head: '提示',
                    hidetype: 'remove',
                    animate: null,
                    drag: 0,
                    lock: 1,
                    foot: '<button data-confirm-btn="accept" class="btn-accept">确定</button>\
                            <button data-confirm-btn="cancel" class="btn-cancel">取消</button>'
                }, modalOpt);
            
            var $target = $('<div class="jqconfirm"></div>').jqModal(_modalOpt);
            // hide
            if (confirmOpt == 'hide' || confirmOpt.text == 'hide') {
                $target.jqModal('hide');
                return;
            };
            $target
                .jqModal('show')
                .html(_template(_confirmOpt.template, _confirmOpt));

            _confirmOpt.done && _confirmOpt.done.call($target, _confirmOpt);

            $target.jqModal('setPos');

            $(doc)
                .off('.confirm')
                .on('click.confirm', '[data-confirm-btn]', function() {
                    var fn = $(this).data('confirm-btn');
                    var res = false;
                    if (_confirmOpt[fn]) {
                        res = _confirmOpt[fn].call($target);
                        // 返回false不关闭弹窗
                        res = res == false ? false : true;
                    } else {
                        res = true;
                    }
                    res && Plugin.call($target, 'hide');
                });
            return $target;
        }, 
        /**
         * @method alert
         * @description jqmodal扩展 类似于 js的alert
         * @param {String} text 提示信息
         * @param {String} [status=info] 显示的图标 `info` `error` `success` `warn`
         * @example
         * ```js
         * $.jqModal.alert('操作成功！', `success`);
         * $.jqModal.alert('hide'); // 隐藏
         * ```
         */
        alert : function(text, status) {
            var _promptOpt = {
                text: text,
                status: status,
                template: '<i class="ico font-modal-{status}"></i><div class="bd">{text}</div>'
            };

            var _modalOpt = {
                    head: '提示信息',
                    footcss: {
                        textAlign: 'center'
                    },
                    foot: '<button data-close="1" class="btn-accept">确定</button>'
                };

            // 隐藏tip 不允许同时存在
            $.jqModal.tip('hide');
            return this.confirm(_promptOpt, _modalOpt);
        },
        /**
         * @method prompt
         * @description jqmodal扩展 与`$.jqModal.confirm` 一样，不同的是内容有变化
         */
        prompt: function(promptOpt, modalOpt) {
            var _promptOpt = $.extend({}, {
                template: '<div class="h">{text}</div>\
                            <div class="b">\
                                <textarea cols="30" rows="3"></textarea>\
                            </div>',
                done: function() {
                    // 清空原有的数据
                    this.find('textarea').val('');
                }
            }, promptOpt);

            var _modalOpt = $.extend(true, {}, {
                }, modalOpt);

            return this.confirm(_promptOpt, _modalOpt);
        },
        /**
         * @method popover
         * @description jqmodal扩展 提示扩展，点击一个元素旁边弹出提示信息
         * @param {Object} $el 要点击（移上去）的元素，Jq对象
         * @param {String} $el.data.trigger=click 触发方式 `click` `mouseover`
         * @param {Object} option popover的设置参数
         * @param {String} option.placement=top 提示信息放置的位置
         * @param {String} option.container=body 提示信息相对哪个元素放置
         * @param {String} option.content 提示信息的内容
         * @example js调用
         * ```html
         * <a href="#" id="popover">问题</a>
         * ```
         * ```js
         * $.jqModal.popover($('#popover'), {
         *        placement: 'top',
         *        container: 'body',
         *        content: '这里是您要的答案'
         * })
         * ```
         * @example html自动调用，不需要任何Js代码，因为是jqmodal的扩展，所以类似jqmodal调用;
         * ```html
         * <a href="#" class="btn-jqModal" 
         *         data-type="popover" 
         *         data-trigger="mouseover" 
         *         data-placement="top" 
         *         data-container="body" 
         *         data-content="这里是您要的答案">问题</a>
         * ```
         * @参数说明
         */
        popover: function() {
            var $target = $('.jqpopover');
            var args = arguments;
            var option = $.extend({}, {
                placement: 'top'
            }, args[0].data && args[0].data(), args[1]);

            var _tpl = '<div class="popover popover-{placement}">\
                            <div class="bd">{content}</div>\
                            <i class="arrow"></i>\
                        </div>'
            
            if (!$target.length) {
                $target = $('<div class="jqpopover"></div>')
                                .appendTo(option.container || 'body');
            };

            if (args[0] == 'hide') {
                $target.stop(1, 1).fadeOut();
                return;
            };
            
            $target.stop(1, 1).fadeIn().html(_template(_tpl, option));

            var oFt = args[0].offset();

            var pla = option.placement;
            if (pla == 'top') {
                oFt.top -= $target.outerHeight();
                oFt.left -= ($target.outerWidth() - args[0].outerWidth()) / 2
            } else if (pla == 'right') {
                oFt.left += args[0].outerWidth();
                oFt.top -= ($target.outerHeight() - args[0].outerHeight()) / 2
            } else if (pla == 'bottom') {
                oFt.top += args[0].outerHeight();
                oFt.left -= ($target.outerWidth() - args[0].outerWidth()) / 2
            } else {
                oFt.left -= $target.outerWidth();
                oFt.top -= ($target.outerHeight() - args[0].outerHeight()) / 2
            }

            $target.css(oFt);

            $(doc)
                .off('.pop')
                .on('click.pop', function() {
                    $target.stop(1, 1).fadeOut();
                })
        },
        /**
         * @method progress
         * @description jqmodal扩展 ajax进度条
         * @param {String} [status]  当`status`存在， `100%` 或者 `hide` 可以隐藏进度条
         * @example js调用
         * ```js
         * $.jqModal.progress(); // 请求前
         * $.ajax({
         *       url: '/path/to/file',
         *       type: 'default GET (Other values: POST)',
         *       dataType: 'default: Intelligent Guess (Other values: xml, json, script, or html)',
         *       data: {param1: 'value1'},
         *   })
         *   .done(function() {
         *       console.log("success");
         *   })
         *   .fail(function() {
         *       console.log("error");
         *   })
         *   .always(function() {
         *       $.jqModal.progress('100%'); // 请求完成
         *   });
         *     
         * ```
         * @参数说明
         */
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


