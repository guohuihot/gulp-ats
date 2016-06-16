/**
* author : ahuing
* date   : 2015-8-7
* name   : jqfixed v1.01
* modify : 2016.04.01
 */
!function ($) {
    var Fixed = function (self, opt) {
        this.o     = $.extend(true, {}, Fixed.defaults, opt)
        this.$self = $(self)
    }

    Fixed.defaults = {
        css : {}
        , fixed : 0 //页面滚动到些位置，才fixed，默认为对象本身的top,如果css.position = 'fixed'，这个是没有用的
        , margintop : 0//对应偏离顶部的大小，fixed大于对象的top时才有有效，否则如果要设置偏离，请调整fixed的大小
        , fade : 0//对象显示时是否有fade效果
        , close : '.btn-close'//对象内部的关闭按钮的class
        , resize: 0
    }

    Fixed.prototype = {
        init : function () {
            if (!this.$self.length) return;

            var _this = this
            , $win    = $(window)
            , isIE6   = !-[1, ] && !window.XMLHttpRequest
            // , wH      = $win.height()
            // , bH      = $('body').height()
            , o       = _this.o
            , oH      = _this.$self.outerHeight(true)
            , t       = 0
            , fixedcss = {
                position : isIE6 ? 'absolute' : 'fixed'
                , marginTop : 0
                , display : 'block'
                , zIndex : parseInt(new Date().getTime() / 1e3)
            };
            o.css.zIndex = o.css.zIndex || _this.$self.css('z-index');
            o.css.position = o.css.position || _this.$self.css('position');
            // 先定位 再取top
            _this.$self.css(o.css);

            var oft = o.css.marginTop = _this.$self.offset().top;

            if (o.css.position == 'fixed') {
                o.css.marginTop = fixedcss.marginTop = o.css.bottom >= 0 ? $win.height() - oH - o.css.bottom : oft - $win.scrollTop();
                o.css.bottom = 'auto';
                isIE6 && (o.css.position = 'absolute');
            }
            else {
                if (o.css.position != 'absolute') {
                    // $('<div style="height:' + oH + 'px"></div>').insertBefore(_this.$self);
                    _this.$self.before('<div style="height:' + oH + 'px"></div>');
                    o.css.marginTop = -oH;
                };

                if (o.fixed) {
                    fixedcss.marginTop = o.fixed > oft ? o.margintop : oft - o.fixed;
                }
                else o.fixed = oft;
            }

            o.css.top = 0;
            // 设置对象的宽
            o.css.width = o.css.width || _this.$self.width();
            // 设置初始状态
            _this.$self.css(o.css);
            // 点击关闭
            _this.$self.find(o.close).click(function () {
                _this.$self.css('display', 'none');
                $win.off('scroll.fixed');
            });

            o.fade && _this.$self.on('unfixed', function () {
                _this.$self.one('fixed', function () {
                    _this.$self.css('display', 'none').animate({opacity:'show'});
                })
            })

            var setFixed = function() {
                var st = $win.scrollTop();
                fixedcss.top = isIE6 ? st : 0;
                _this.$self.css(st >= o.fixed && fixedcss || o.css);

                st >= o.fixed &&
                _this.$self.trigger('fixed', [st, oH]).trigger(st > t ? 'scrollUp' : 'scrollDown') ||
                _this.$self.trigger('unfixed');

                setTimeout(function () {t = st}, 0)
            }
            // 页面加载后先执行一次
            setFixed();
            $win.on('scroll.fixed', setFixed)
            if (o.resize) {
                $win.on('resize', function() {
                    var minw = parseInt(_this.$self.css('min-width'));
                        o.css.width = $win.width() > minw ? $win.width() : minw;
                        _this.$self.css('width', o.css.width);
                })
            }
        }
    }

    function Plugin(option) {
        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('jqFixed')
            var options = typeof option == 'object' && option

            if (!data) {
                $this.data('jqFixed', (data = new Fixed(this, options)));
                data.init();
            }

        })
    }

    var old = $.fn.jqFixed;

    $.fn.jqFixed             = Plugin
    $.fn.jqFixed.Constructor = Fixed;

    $.fn.jqFixed.noConflict = function () {
        $.fn.jqFixed = old
        return this
    }

    $(window).on('load', function () {
        $('.jqFixed').each(function() {
            var $this = $(this);
            Plugin.call($this, $this.data())
        });
    })
}(jQuery);