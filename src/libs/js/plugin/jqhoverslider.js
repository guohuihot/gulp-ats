/*!
 * @project: hoverslider
 * @author : <%= author %> <1710035347@qq.com>
 * @date   : 2016-06-17
 * @name   : <%= name %> v 1.0
 * @dependencies: jQuery
 * @description: 鼠标移动出现悬浮区块，目前功能可设置悬浮区块出现的方向
 * @modify : <%= date %>
 */
(function($, window, undefined) {
    var $allHoversliders = $();
    var $allHoverslidersChild = $();
    /**
     * @name  hoverSlider
     * @description 鼠标移到元素上弹出菜单功能
     * @param {Object} options 设置对象
     * @param  {number} options.delay=500 鼠标移出元素后悬浮块延迟消失的时间，单位ms
     * @param  {number} options.hoverDelay=0 鼠标移上悬浮块延迟出现时间 ：默认为0
     * @param  {string} options.direction=bottom  悬浮块出现的方向 方向选择 左边：left  右边：right  上边：top   下边：bottom（默认）
     * @param  {number|String} options.offsetx=0 悬浮块出现时水平方向的偏移量可不设，会根据你所设置的direction自动赋值默认值，默认为0； 当`offsetx=50%`时, 相对居中 
     * @param  {number} options.offsety=0 悬浮块出现时垂直方向的偏移量 可不设，会根据你所设置的direction自动赋值默认值，默认为0；
     * @param  {number} options.zIndex=10 悬浮块的z-index值，默认为10
     * @param {string} options.curclass=open 鼠标以上去当前状态的class  默认:open（注意：此样式是添加在父级元素上的）
     * @param {string} options.obj=null 悬浮块属性或者样式名或id名称
     * @param  {boolean} options.instantlyCloseOthers=true 鼠标移入含有此方法的区域中时是否立即关闭其他的悬浮块，默认为 true ；如设置为false其他的悬浮块将不会立即消失，将会在delay时间过后消失。
     
     * @示例 1
     * ### data启动
     * ```html
     * <div class="wrap">
     *     <div class="hover-slider" data-hover="hoverslider" data-direction="bottom" data-offsetx="-150" data-offsety="100" data-close-others="false" data-curclass="open" data-obj=".hover-slider-menu">
     *         标题
     *     </div>
     *     <div class="hover-slider-menu" data-menu="hoverslider-menu">
     *         悬浮区块
     *     </div>
     * </div>
     * ```
     * ### js启动
     * ```html
     * <div class="wrap">
     *     <div class="hover-slider">
     *         标题
     *     </div>
     *     <div class="hover-slider-menu" data-menu="hoverslider-menu">
     *         悬浮区块
     *     </div>
     * </div>
     * ```
     * js代码
     * ```js
     * $(".head1").hoverSlider({
     *     delay:100,
     *     hoverDelay: 0,
     *    curclass:'open',
     *     direction:'bottom',
     *     offsetx:100,
     *     offsety:100,
     *     instantlyCloseOthers: true
     * })
     * ```
     * ### 设置参数说明
     */
    $.fn.hoverSlider = function(options) {

        //存储所有用到此方法的父级，以便后面统一关闭悬浮块使用
        $allHoversliders = $allHoversliders.add(this.parent());

        return this.each(function() {
            var $this = $(this);
            var $parent = $this.parent();
            // 默认属性值
            var defaults = {
                delay: 500,
                hoverDelay: 0,
                direction: 'bottom',
                offsetx: null,
                offsety: null,
                zIndex: 10,
                curclass: 'open',
                obj: null,
                globalObj: 0, // 启用全局查找
                instantlyCloseOthers: true
            };

            //data启动时的属性值
            /*var data = {
                delay: $this.data('delay'),
                hoverDelay: $this.data('hover-delay'),
                direction: $this.data('direction'),
                offsetx: $this.data('offsetx'),
                offsety: $this.data('offsety'),
                zIndex: $this.data('z-index'),
                curclass: $this.data('curclass'),
                obj:$this.data('obj'),
                instantlyCloseOthers: $this.data('close-others')
            };*/
            var data = $this.data();
            var settings = $.extend({}, defaults, options, data);
            var timeout;
            var timeoutHover;

            //存储子集，以便隐藏全部其他悬浮块
            $allHoverslidersChild = $allHoverslidersChild.add(settings.obj);

            var $obj = settings.globalObj ? $(settings.obj) : $parent.find(settings.obj);

            var _mouseout = function() {

                    //清除延迟加载悬浮块setTimeout方法
                    window.clearTimeout(timeoutHover);

                    //一定时间之后悬浮块消失  取决于delay
                    timeout = window.setTimeout(function() {
                        $parent.removeClass(settings.curclass)
                        $obj.css({
                            'display':'none'
                        });
                    }, settings.delay);
                }

            $parent
                .off('.hoverslider')
                .on('mouseover.hoverslider', function(event) {
                    // if(!$parent.hasClass('open') && !$this.is(event.target)) {
                    //     return true;
                    // };
                    var $this = $(this);
                    directions($this, settings.direction);
                    openHover($obj);
                })
                .on('mouseout.hoverslider', _mouseout)
                .css({
                    'position':'relative'//,
                    // 'zIndex': settings.zIndex//不支持zindex的ie预设
                })

            if (settings.globalObj) {
               $obj.off('.hoverslider')
                   .on('mouseover.hoverslider', function() {
                        clearTimeout(timeout);
                   })  
                   .on('mouseout.hoverslider', _mouseout)        
            };

            $obj.css({
                'display':'none'
            });

            //方向读取方法
            function directions(target, direction) {
                var hoverH = target.outerHeight();
                var hoverW = target.outerWidth();
                var hoverMenu = target.find(settings.obj);
                var hoverMenuW = hoverMenu.outerWidth();
                var hoverMenuH = hoverMenu.outerHeight();
                var x = settings.offsetx;
                var y = settings.offsety;
                var z = settings.zIndex;

                //提取公用属性
                var cssCommonMap = {
                    'display':'block',
                    'z-index': z,
                    'position': 'absolute',
                }
                // 单个的属性
                var cssSingleMap = {};

                if (hoverMenu.length) {

                    switch (direction) {
                        case 'bottom':
                            let menuOuterLeft = hoverMenuW + target.offset().left;
                            // 弹出层超出容器的宽度时，需要右对齐
                            if (menuOuterLeft > $(window).width()) {
                                cssSingleMap = {                
                                    'right': 0,
                                    'top': y ? y : hoverH
                                }
                            } else {
                                //bottom 也是默认值，此方法悬浮块向下方出现  默认位置top:标题的高度，left:0;
                                cssSingleMap = {                
                                    'left': x ? x : 0,
                                    'top': y ? y : hoverH
                                };
                            }
                            break;
                        case 'top':

                            //top 此方法悬浮块向上方出现  默认位置top:-悬浮块高度，left:0;
                            cssSingleMap = {
                                'left': x ? x : 0,
                                'top': y ? y : -hoverMenuH
                            };
                            break;
                        case 'left':

                            //left 此方法悬浮块向左方出现  默认位置top:0，left:悬浮块的宽度;
                            cssSingleMap = {
                                'left': x ? x : -hoverMenuW,
                                'top': y ? y : 0
                            };
                            break;
                        case 'right':

                            //right 此方法悬浮块向右方出现  默认位置top:0，left:标题的宽度;
                            cssSingleMap = {
                                'left': x ? x : hoverW,
                                'top': y ? y : 0
                            };
                            break;
                        default:

                            //默认值   与bottom一样
                            cssSingleMap = {
                                'left': x ? x : 0,
                                'top': y ? y : dropH
                            };
                            break;
                    }
                }
                // 居中处理
                if ($.trim(x) == '50%') {
                    cssSingleMap.marginLeft = -hoverMenu.outerWidth() / 2
                };
                // 最后渲染
                hoverMenu.css($.extend(true, cssCommonMap, cssSingleMap));
            };

            //打开悬浮块方法
            function openHover($obj) {

                //清除鼠标移开时候悬浮块消失的setTimeout方法
                window.clearTimeout(timeout);

                //清除延迟加载悬浮块setTimeout方法
                window.clearTimeout(timeoutHover);

                //延迟加载悬浮块 时间限定是hoverDelay  
                timeoutHover = window.setTimeout(function() {

                    //移到同样含有此效果的元素上是否关闭其他的悬浮窗口
                    if (settings.instantlyCloseOthers === true) {
                        $allHoversliders.removeClass(settings.curclass);
                        $allHoverslidersChild.css({
                            'display':'none'
                        })
                        // $("[data-menu='hover-slider-menu']").css({
                        //   'display':'none'
                        // })
                    }

                    //清除延迟加载悬浮块的setTimeout方法
                    window.clearTimeout(timeoutHover);
                    $parent.addClass(settings.curclass)
                    $obj.css({
                        'display':'block'
                    });
                }, settings.hoverDelay);
            }

        })
    };
    $(function() {
        //在元素加上data-hover="drophover"属性或者添加hoverslider样式即可启动该悬浮方法
        $('[data-hover="hoverslider"],.hoverslider').hoverSlider();
    });
})($, window);