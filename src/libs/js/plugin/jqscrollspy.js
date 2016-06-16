/**
* author : ahuing
* date   : 2015-8-7
* name   : jqscrollspy v1.0
* modify : 2015-8-12 15:17:32
 */
!function ($) {
    var Scrollspy = function (self, opt) {
        this.o     = $.extend({}, Scrollspy.defaults, opt)
        this.$cell = $(self).find(this.o.obj)
    }

    Scrollspy.defaults = {
        offset : 10
        , obj : 'a'
    }

    Scrollspy.prototype = {
        init : function () {
            var _this = this
            , $win    = $(window)
            , wH      = $win.height()
            , bH      = $('body').height()
            , hasCls  = _this.$cell.eq(0).hasClass('act')
            , ScrollTo = function () {
                var st = $win.scrollTop() + _this.o.offset, iIndex = hasCls ? 0 : undefined;
                if (st < bH - wH) {
                    for (var i = 0; i < _this.aTop.length; i++) {
                        st >= _this.aTop[i] && _this.aTop[i] > 0 && (iIndex = i);
                    };
                }
                else iIndex = -1;

                _this.$cell.removeClass('act').eq(iIndex).addClass('act');
            }

            _this.aTop = [];
            _this.$cell.each(function(i, el) {
                var $obj = $($(el).attr('href'));
                _this.aTop.push($obj.length ? $obj.offset().top : null);
            })
            .on('click', function () {
                var t = _this.aTop[_this.$cell.index(this)];
                t != null && $('body,html').animate({scrollTop: t - _this.o.offset});
                return false;
            });

            if (_this.aTop.length < 2) return;
            ScrollTo();
            $win.on('scroll', ScrollTo);
        }
    }

    function Plugin(option) {
        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('jqScrollspy')
            var options = typeof option == 'object' && option

            if (!data) {
                $this.data('jqScrollspy', (data = new Scrollspy(this, options)));
                data.init();
            }

        })
    }

    var old = $.fn.jqScrollspy;

    $.fn.jqScrollspy             = Plugin
    $.fn.jqScrollspy.Constructor = Scrollspy;

    $.fn.jqScrollspy.noConflict = function () {
        $.fn.jqScrollspy = old
        return this
    }

    $(window).on('load', function () {
        $('.jqScrollspy').each(function() {
            var $this = $(this);
            Plugin.call($this, $this.data())
        });
    })
}(jQuery);