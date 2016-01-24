/*!
 * @name modal v1.2
 * @author ahuing
 * @date 2015-12-31 09:03:41
 */

define(function(require, exports, moudles) {
    var $ = require('$');
    // transition.js
    function transitionEnd() {
        var el = document.createElement('div');
        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        };
        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                };
            }
        }
        return false;
    }
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false;
        var $el = this;
        $(this).one('bsTransitionEnd', function() {
            called = true;
        });
        var callback = function() {
            if (!called) $($el).trigger($.support.transition.end);
        };
        setTimeout(callback, duration);
        return this;
    };
    $(function() {
        $.support.transition = transitionEnd();
        if (!$.support.transition) return;
        $.event.special.bsTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function(e) {
                if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments);
            }
        };
    });
    /**
     * 得到拖拽范围
     * @param  {sting} o 对象本身
     * @param  {string} p 对象的父层，拖拽不能超出父层
     * @param  {number} f 是否fixed
     * @return {json}   minL:最小left,minT最小top,h:对象的高度
     */
    var showRange = function(o, p, f) {
        var $p = $(!f ? 'body' : (p || window)),
            st = $(window).scrollTop(),
            w  = o.outerWidth(),
            h  = o.outerHeight(),
            pw = $p.width(),
            ph = $p.height();

        return {
            minL: pw < w ? pw - w : 0,
            minT: ph < h ? ph - h : 0,
            maxL: pw < w ? 0 : $p.width() - w,
            maxT: ph < h ? 0 : $p.height() - h,
            st: st,
            h: h
        };
    };

    // drag
    var Drag = function(self, opt) {
        this.o       = $.extend({}, Drag.defaults, opt);
        this.$self   = $(self);
        this.$handle = this.o.handle && this.$self.find(this.o.handle) || this.$self;
    };

    Drag.defaults = {
        handle: '',
        fixed: 1, // , opacity    : 1
        attachment: ''
    };

    Drag.prototype.init = function () {
        var o = this.o;
        var $self = this.$self;//.css('animation-fill-mode','backwards');
        var $handle = this.$handle;

        $handle
        .css({
            cursor : 'move'
            // , userSelect : 'none'
        })
        .on('selectstart', function() {
            return false;
        })
        .on('mousedown', function(e) {
            $self
            .css({
                opacity  : o.opacity
                , zIndex : parseInt(new Date().getTime()/1000)
            })
            .trigger('_mousemove', [e.pageX, e.pageY]);
            return false;
        })
        .on('_mousemove', function (e, x, y) {
            var R  = showRange($self, o.attachment, o.fixed),
                p  = $self.position(),
                pl = p.left - x,
                pt = p.top - y,
                dT = null,
                l,
                t;

            $self.trigger('dragStart', [R]);
            $(document).on('mousemove', function(de) {
                // 阻止对象的默认行为,防止在img,a上拖拽时出错
                de.preventDefault();
                var nL = pl + de.pageX
                , nT   = pt + de.pageY;

                l = nL < R.minL ? R.minL : (nL > R.maxL ? R.maxL : nL);
                t = nT < R.minT ? R.minT : (nT > R.maxT ? R.maxT : nT);

                $self.css({
                    left : l
                    , top :  t
                }).trigger('drag', [l, t]);

            }).on('mouseup',function() {
                $(this).off('mousemove');
                $self.trigger('dragEnd', [l, t]);
            });
        });
    };

    function PluginDrag(option) {
        return this.each(function () {
            var $this   = $(this);
            var data    = $this.data('jqDrag');
            var options = $.extend({}, Drag.defaults, $this.data(), typeof option == 'object' && option);

            if (!data) { 
                $this.data('jqDrag', (data = new Drag(this, options)))
                data.init();
                // data.show()
            }
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.jqDrag = PluginDrag;

    // modal
    var Modal = function (self, opt) {
        this.o       = opt;
        this.Z       = parseInt(new Date().getTime()/1000);
        this.$self   = $(self)
        this.isShown = false
    }

    Modal.defaults = {
        mclass  : '', //[ modal | tip | lay ]
        head    : '', //标题
        foot    : '', // 内容
        remote  : '',
        fixed   : 1, //fixed效果
        overlay : .3, //显示遮罩层, 0为不显示
        drag    : 1, //拖拽 1 2
        lock    : 0, //锁定遮罩层
        timeout : 0,
        css     : {},
        headcss : {},
        bodycss : {},
        footcss : {},
        animate : 'bounceInDown' // shake | flipInY | bounceInDown | zoomIn, 
    }

    Modal.prototype = {
        init: function() {
            var _this   = this,
                o       = _this.o,
                _target = o.target,
                html    = '<div class="jqModal animated">\
                                <div class="m-content m-' + o.mclass + '">\
                                    <div class="m-head">' + o.head + '</div>\
                                    <div class="m-body"></div>\
                                    <div class="m-foot">' + o.foot + '</div>\
                                    <i class="font-modal-close ' + (o.head ? '' : 'dn') + '" data-close="1" title="关闭"></i>\
                                </div>\
                            </div>';

            //加载遮罩层
            if (o.overlay) {
                _this.$overlay = $('<div class="m-overlay"></div>')
                                    .appendTo('body')
                                    .css({
                                        opacity: o.overlay,
                                        zIndex: _this.Z
                                    })
                                    .on('click', !o.lock && $.proxy(_this.hide, _this) || $.noop);
            }
            // 装载弹出层
            _this.$box = $(html)
                            .appendTo('body')
                            .css($.extend({}, o.css, {
                                zIndex: _this.Z,
                                position: o.fixed && 'fixed' || 'absolute'
                            }))
                            // close
                            .on('click', '[data-close]', $.proxy(_this.hide, _this));

            _this.$hd = _this.$box.find('.m-head')
                .css($.extend({}, o.headcss, !o.head && {
                    display: 'none'
                }));

            _this.$bd = _this.$box.find('.m-body').css(o.bodycss);

            _this.$ft = _this.$box
                .find('.m-foot')
                .css($.extend({}, o.footcss, !o.foot && {
                    display: 'none'
                }));

            if (_this.$self.is('iframe')) {
                _this.$self
                    .attr({
                        scrolling: 'no',
                        allowtransparency: true,
                        frameborder: 0,
                        src: o.remote
                    })
                    .appendTo(this.$bd)
                    .load(function() {
                        _this.setPos(1);
                    })
            } else {
                _this.$bd.append(_this.$self.css('display', 'block'));
            }

            if (o.drag) {
                _this.$drag = $('<div class="jqModal-drag"></div>').insertAfter(_this.$box);
                _this.$hd
                    .on('mousedown', function(e) {
                        // 分开写,先显示再定位
                        _this.$drag.addClass('jqModal-drag' + o.drag);
                            
                        _this.$drag.trigger('_mousemove', [e.pageX, e.pageY])
                    })
                    .css('cursor', 'move');

                $(document).on('mouseup', function() {
                    _this.$drag.removeClass('jqModal-drag' + o.drag);
                });

                _this.$drag
                    .on(o.drag > 1 ? 'dragEnd' : 'drag', function(el, l, t) {
                        _this.$box.css({
                            left: l,
                            top: t
                        });
                    })

                PluginDrag.call(_this.$drag, {
                    fixed: _this.o.fixed
                })
            }
            this.setPos();

            $(document).on('keydown.modal', function(e){
                e.which == 27 && _this.hide();
                return true;
            });

            o.fixed && $(window).on('resize', $.proxy(_this.setPos, _this));

        },
        show: function() {
            var _this = this;

            if (_this.isShown) return
            _this.$self.trigger('showFun', [this.o]);
            _this.$overlay && _this.$overlay.fadeIn();
            _this.$box.css('display', 'block');
            $.support.transition && _this.$box.addClass(_this.o.animate);
            _this.$self.trigger('shownFun');
            _this.isShown = true

            if(this.o.timeout) {
                clearTimeout(this.t);
                this.t = setTimeout($.proxy(this.hide, this), this.o.timeout);
            }
        },
        hideModal: function() {
            this.$box.removeClass(this.o.animate + 'H').hide()
            this.$overlay && this.$overlay.hide();
            this.$self.trigger('hidenFun');
        },
        hide: function(delay) {
            this.$self.trigger('hideFun');
            setTimeout($.proxy(function() {
                this.$box.removeClass(this.o.animate).addClass(this.o.animate + 'H');
                $.support.transition && 
                    this.$box
                        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
                        .emulateTransitionEnd(500) ||
                    this.hideModal()
            }, this), delay || 0)

            this.isShown = false;
            return false;
        }
        , toggle : function (delay) {
            return this.isShown ? this.hide(delay) : this.show()
        }
        , setSize : function () {
            if (this.$self.is('iframe')) {
                this.$self
                    .add(this.$bd)
                    .height(
                        this.$self.css('background', 'none')
                        .contents()
                        .find('body')
                        .height()
                    );
            }
        },
        // 设置位置
        setPos: function(isComplete) {
            isComplete && this.setSize();
            var _this = this,
                    o = _this.o, 
                    R = showRange(_this.$box, null, o.fixed);

            _this.fixedT = o.css.bottom >= 0 ?
                                R.maxT - o.css.bottom :
                                (o.css.top || ($(window).height() - R.h) / 2);

            _this.$box.css({
                left: o.css.right >= 0 ? 'auto' : (o.css.left || R.maxL / 2),
                top: _this.fixedT + (!o.fixed && R.st)
            });


            if (o.drag) {
                _this.$drag[0].style.cssText = _this.$box[0].style.cssText;
                _this.$drag.css({
                    width: _this.$box.width() - 6,
                    height: _this.$box.height() - 6
                });
            }
        }
    }

    function Plugin(option) {
        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('jqModal')
            var options = $.extend({}, Modal.defaults, $this.data(), typeof option == 'object' && option)
            if (!data) { 
                $this.data('jqModal', (data = new Modal(this, options)))
                data.init()
                data.show()
            }
            else {
                if (typeof option == 'string') data[option]()
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

    $(document).on('click', '.btn-jqModal', function(e) {
        var $this   = $(this)
        var target = $this.data('target') || $this.attr('href')

        if (typeof target == 'string') {
            var isUrl = target.indexOf('http') == 0
            var $target = $(isUrl && '<iframe class="jqiframe"/>' || target.replace(/.*(?=#[^\s]+$)/, ''))
            $this.data('target', $target);
            var option = $.extend({ remote : isUrl && target }, $target.data(), $this.data())
        }
        else {
            var $target = target;
            var option = 'toggle';
        }

        if ($this.is('a')) e.preventDefault();
        Plugin.call($target, option)
    });


    var modalExt = {
        tip: function() {
            var $target = $('.jqtip'),
                isLoad = !arguments[1].search(/load/),
                option = $target[0] && 'toggle' || {
                    mclass: 'tip',
                    css: {
                        top: 150
                    },
                    drag: 0,
                    lock: 1
                };

            if (!$target[0]) {
                $target = $('<div class="jqtip"></div>'); //.appendTo('body');
            }
            $target.html('<i class="font-modal-' + arguments[1] + '"></i>' + arguments[0])
                // console.log($target);
            .on('showFun', function(el, opt) {
                opt.animate = isLoad ? '' : 'shake';
                opt.timeout = isLoad ? 0 : (arguments[2] || 1500);
            });
            Plugin.call($target, option);
        },
        alert: function() {
            var $target = $('.jqalert'),
                option = $target[0] && 'show' || {
                    head: arguments[2] || '提示信息',
                    css: {
                        width: 300
                    },
                    foot: '<button data-close="1" class="ok">确定</button>'
                };

            if (!$target[0]) $target = $('<div class="jqalert"></div>');

            Plugin.call($target.html('<i class="font-modal-' + (arguments[1] || 'info') + '"></i>' + arguments[0]), option)
        },
        confirm: function() {
            var $target = $('.jqconfirm'),
                option = $target[0] && 'show' || {
                    head: arguments[1] || '提示信息',
                    css: {
                        width: 300
                    },
                    foot: '<button data-close="1" class="ok" data-btn="ok">确定</button><button data-close="1" data-btn="no">取消</button>'
                };

            if (!$target[0]) {
                $target = $('<div class="jqconfirm"></div>');
            }

            Plugin.call($target.html('<i class="font-modal-' + (arguments[2] || 'ask') + '"></i>' + arguments[0]), option);
        },
        lay: function(txt) {
            var html = txt;
            if ($('.jqlay').length) {
                if (txt != 'hide') {
                    $('.jqlay').html(html);
                }
                $('.jqlay').jqModal(txt);
            } else {
                $('<div class="jqlay">' + html + '</div>').appendTo('body').jqModal()
            }
        }
    }
    moudles.exports = modalExt;
})
