/*!
 * @name <%= name %>
 * @author <%= author %>
 * @date <%= date %>
 */

var libs = 'libs/';
var cfg = {
    base : base,
    alias: {
		'$'           : libs + 'js/static/jquery',
		'template'    : libs + 'js/static/template.js',
		'highcharts'  : libs + 'js/static/highcharts.js',
		'clipboard'   : libs + 'js/static/jquery.clipboard.js',
		'login'       : libs + 'js/common.js',
		'uri2MVC'     : libs + 'js/common.js',
		'placeholder' : libs + 'js/common.js',
		'duang'       : libs + 'js/plugin/duang.js',
		'fixed'       : libs + 'js/plugin/fixed.js',
		'lazyload'    : libs + 'js/plugin/lazyload.js',
		'modal'       : libs + 'js/plugin/modal.js',
		'scrollspy'   : libs + 'js/plugin/scrollspy.js'
    }   
};

seajs.config(cfg);