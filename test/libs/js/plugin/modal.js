/*!
 * @name modal v1.2
 * @author ahuing
 * @date 2015-12-31 09:03:41
 */
define(function(require,exports,t){function o(){var t,o=document.createElement("div"),e={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(t in e)if(void 0!==o.style[t])return{end:e[t]};return!1}function e(t){return this.each(function(){var o=$(this),e=o.data("jqDrag"),s=$.extend({},n.defaults,o.data(),"object"==typeof t&&t);e||(o.data("jqDrag",e=new n(this,s)),e.init()),"string"==typeof t&&e[t]()})}function s(t){return this.each(function(){var o=$(this),e=o.data("jqModal"),s=$.extend({},a.defaults,o.data(),"object"==typeof t&&t);e?"string"==typeof t?e[t]():e["toggle"]():(o.data("jqModal",e=new a(this,s)),e.init(),e.show())})}var i,n,a,d,r,$=require("$");$.fn.emulateTransitionEnd=function(t){var o,e=!1,s=this;return $(this).one("bsTransitionEnd",function(){e=!0}),o=function(){e||$(s).trigger($.support.transition.end)},setTimeout(o,t),this},$(function(){$.support.transition=o(),$.support.transition&&($.event.special.bsTransitionEnd={bindType:$.support.transition.end,delegateType:$.support.transition.end,handle:function(t){return $(t.target).is(this)?t.handleObj.handler.apply(this,arguments):void 0}})}),i=function(t,o,e){var s=$(e?o||window:"body"),i=$(window).scrollTop(),n=t.outerWidth(),a=t.outerHeight(),d=s.width(),r=s.height();return{minL:n>d?d-n:0,minT:a>r?r-a:0,maxL:n>d?0:s.width()-n,maxT:a>r?0:s.height()-a,st:i,h:a}},n=function(t,o){this.o=$.extend({},n.defaults,o),this.$self=$(t),this.$handle=this.o.handle&&this.$self.find(this.o.handle)||this.$self},n.defaults={handle:"",fixed:1,attachment:""},n.prototype.init=function(){var t=this.o,o=this.$self,e=this.$handle;e.css({cursor:"move"}).on("selectstart",function(){return!1}).on("mousedown",function(e){return o.css({opacity:t.opacity,zIndex:parseInt((new Date).getTime()/1e3)}).trigger("_mousemove",[e.pageX,e.pageY]),!1}).on("_mousemove",function(e,s,n){var a,d,r=i(o,t.attachment,t.fixed),l=o.position(),c=l.left-s,h=l.top-n;o.trigger("dragStart",[r]),$(document).on("mousemove",function(t){t.preventDefault();var e=c+t.pageX,s=h+t.pageY;a=e<r.minL?r.minL:e>r.maxL?r.maxL:e,d=s<r.minT?r.minT:s>r.maxT?r.maxT:s,o.css({left:a,top:d}).trigger("drag",[a,d])}).on("mouseup",function(){$(this).off("mousemove"),o.trigger("dragEnd",[a,d])})})},$.fn.jqDrag=e,a=function(t,o){this.o=o,this.Z=parseInt((new Date).getTime()/1e3),this.$self=$(t),this.isShown=!1},a.defaults={mclass:"",head:"",foot:"",remote:"",fixed:1,overlay:.3,drag:1,lock:0,timeout:0,css:{},headcss:{},bodycss:{},footcss:{},animate:"bounceInDown"},a.prototype={init:function(){var t=this,o=t.o,s=(o.target,'<div class="jqModal animated">                                <div class="m-content m-'+o.mclass+'">                                    <div class="m-head">'+o.head+'</div>                                    <div class="m-body"></div>                                    <div class="m-foot">'+o.foot+'</div>                                    <i class="font-modal-close '+(o.head?"":"dn")+'" data-close="1" title="关闭"></i>                                </div>                            </div>');o.overlay&&(t.$overlay=$('<div class="m-overlay"></div>').appendTo("body").css({opacity:o.overlay,zIndex:t.Z}).on("click",!o.lock&&$.proxy(t.hide,t)||$.noop)),t.$box=$(s).appendTo("body").css($.extend({},o.css,{zIndex:t.Z,position:o.fixed&&"fixed"||"absolute"})).on("click","[data-close]",$.proxy(t.hide,t)),t.$hd=t.$box.find(".m-head").css($.extend({},o.headcss,!o.head&&{display:"none"})),t.$bd=t.$box.find(".m-body").css(o.bodycss),t.$ft=t.$box.find(".m-foot").css($.extend({},o.footcss,!o.foot&&{display:"none"})),t.$self.is("iframe")?t.$self.attr({scrolling:"no",allowtransparency:!0,frameborder:0,src:o.remote}).appendTo(this.$bd).load(function(){t.setPos(1)}):t.$bd.append(t.$self.css("display","block")),o.drag&&(t.$drag=$('<div class="jqModal-drag"></div>').insertAfter(t.$box),t.$hd.on("mousedown",function(e){t.$drag.addClass("jqModal-drag"+o.drag),t.$drag.trigger("_mousemove",[e.pageX,e.pageY])}).css("cursor","move"),$(document).on("mouseup",function(){t.$drag.removeClass("jqModal-drag"+o.drag)}),t.$drag.on(o.drag>1?"dragEnd":"drag",function(o,e,s){t.$box.css({left:e,top:s})}),e.call(t.$drag,{fixed:t.o.fixed})),this.setPos(),$(document).on("keydown.modal",function(o){return 27==o.which&&t.hide(),!0}),o.fixed&&$(window).on("resize",$.proxy(t.setPos,t))},show:function(){var t=this;t.isShown||(t.$self.trigger("showFun",[this.o]),t.$overlay&&t.$overlay.fadeIn(),t.$box.css("display","block"),$.support.transition&&t.$box.addClass(t.o.animate),t.$self.trigger("shownFun"),t.isShown=!0,this.o.timeout&&(clearTimeout(this.t),this.t=setTimeout($.proxy(this.hide,this),this.o.timeout)))},hideModal:function(){this.$box.removeClass(this.o.animate+"H").hide(),this.$overlay&&this.$overlay.hide(),this.$self.trigger("hidenFun")},hide:function(t){return this.$self.trigger("hideFun"),setTimeout($.proxy(function(){this.$box.removeClass(this.o.animate).addClass(this.o.animate+"H"),$.support.transition&&this.$box.one("bsTransitionEnd",$.proxy(this.hideModal,this)).emulateTransitionEnd(500)||this.hideModal()},this),t||0),this.isShown=!1,!1},toggle:function(t){return this.isShown?this.hide(t):this.show()},setSize:function(){this.$self.is("iframe")&&this.$self.add(this.$bd).height(this.$self.css("background","none").contents().find("body").height())},setPos:function(t){t&&this.setSize();var o=this,e=o.o,s=i(o.$box,null,e.fixed);o.fixedT=e.css.bottom>=0?s.maxT-e.css.bottom:e.css.top||($(window).height()-s.h)/2,o.$box.css({left:e.css.right>=0?"auto":e.css.left||s.maxL/2,top:o.fixedT+(!e.fixed&&s.st)}),e.drag&&(o.$drag[0].style.cssText=o.$box[0].style.cssText,o.$drag.css({width:o.$box.width()-6,height:o.$box.height()-6}))}},d=$.fn.jqModal,$.fn.jqModal=s,$.fn.jqModal.Constructor=a,$.fn.jqModal.noConflict=function(){return $.fn.jqModal=d,this},$(document).on("click",".btn-jqModal",function(t){var o,e,i,n=$(this),a=n.data("target")||n.attr("href");"string"==typeof a?(o=0==a.indexOf("http"),e=$(o&&'<iframe class="jqiframe"/>'||a.replace(/.*(?=#[^\s]+$)/,"")),n.data("target",e),i=$.extend({remote:o&&a},e.data(),n.data())):(e=a,i="toggle"),n.is("a")&&t.preventDefault(),s.call(e,i)}),r={tip:function(){var t=$(".jqtip"),o=!arguments[1].search(/load/),e=t[0]&&"toggle"||{mclass:"tip",css:{top:150},drag:0,lock:1};t[0]||(t=$('<div class="jqtip"></div>')),t.html('<i class="font-modal-'+arguments[1]+'"></i>'+arguments[0]).on("showFun",function(t,e){e.animate=o?"":"shake",e.timeout=o?0:arguments[2]||1500}),s.call(t,e)},alert:function(){var t=$(".jqalert"),o=t[0]&&"show"||{head:arguments[2]||"提示信息",css:{width:300},foot:'<button data-close="1" class="ok">确定</button>'};t[0]||(t=$('<div class="jqalert"></div>')),s.call(t.html('<i class="font-modal-'+(arguments[1]||"info")+'"></i>'+arguments[0]),o)},confirm:function(){var t=$(".jqconfirm"),o=t[0]&&"show"||{head:arguments[1]||"提示信息",css:{width:300},foot:'<button data-close="1" class="ok" data-btn="ok">确定</button><button data-close="1" data-btn="no">取消</button>'};t[0]||(t=$('<div class="jqconfirm"></div>')),s.call(t.html('<i class="font-modal-'+(arguments[2]||"ask")+'"></i>'+arguments[0]),o)},lay:function(t){var o=t;$(".jqlay").length?("hide"!=t&&$(".jqlay").html(o),$(".jqlay").jqModal(t)):$('<div class="jqlay">'+o+"</div>").appendTo("body").jqModal()}},t.exports=r});