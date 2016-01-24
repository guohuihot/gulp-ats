/*!
 * @name demo.js
 * @author author
 * @date 2016-01-25 03:01:34
 */
define("placeholder",["$"],function(require){var $=require("$");"placeholder"in document.createElement("input")||$("[placeholder]").each(function(){var e=this,l=$(this),t=l.attr("placeholder");""===$.trim(e.value)&&(e.value=t),l.focus(function(){$.trim(e.value)===t&&(e.value="")}).blur(function(){""===$.trim(e.value)&&(e.value=t)}).closest("form").on("submit",function(){$.trim(e.value)===t&&(e.value="")})})});
//# sourceMappingURL=common.js.map
