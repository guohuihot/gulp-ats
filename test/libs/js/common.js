/*!
 * @name -uri2mvc.js
 * @author ahuing
 * @date 2016-01-20 17:30:57
 */
define("uri2MVC",[],function(require,exports,e){e.exports=function(e,n){var i,t,o,r,a,d="/";if(i||(i="index.php?/"),void 0==n&&(n=!0),t="","string"==typeof e)t=e.replace(/&/g,d).replace(/=/g,d);else for(o in e)t+=o+d+e[o]+d;return r=t.charAt(t.length-1),r==d&&(t=t.substr(0,t.length-1)),a=n?i+t:t,/domain/i.test(a)||(a+=d+"domain"+d+(self.originDomain||document.domain)),a}});
/*!
 * @name login.js
 * @author ahuing
 * @date 2016-01-20 17:30:58
 */
define("login",["$","template","uri2MVC","modal"],function(require){var $=require("$"),t=require("template"),a=require("uri2MVC");require("modal"),$.getScript(CMS_ABS+a("ajax=is_login&varname=test&datatype=js"),function(){test.user_info.mid?$login.html(t($login.data("login"),{data:test.user_info})):$login.html(t($login.data("loginno")))}),$.jqModal.tip("aaa")});
/*!
 * @name placeholder.js
 * @author ahuing
 * @date 2016-01-20 17:30:58
 */
define("placeholder",["$"],function(require){var $=require("$");"placeholder"in document.createElement("input")||$("[placeholder]").each(function(){var e=this,l=$(this),t=l.attr("placeholder");""===$.trim(e.value)&&(e.value=t),l.focus(function(){$.trim(e.value)===t&&(e.value="")}).blur(function(){""===$.trim(e.value)&&(e.value=t)}).closest("form").on("submit",function(){$.trim(e.value)===t&&(e.value="")})})});
//# sourceMappingURL=../../maps/libs/js/common.js.map
