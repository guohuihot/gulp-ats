/*!
 * @name <%= name %>
 * @author <%= author %>
 * @date <%= date %>
 */

var libs = 'libs/';
var cfg = {
    base : (typeof baseUrl != 'undefined' && baseUrl || 'http://localhost:8080/') + libs,
    alias: {
		'$'           : 'js/static/jquery',
		'template'    : 'js/static/template.js',
		'highcharts'  : 'js/static/highcharts.js',
		'clipboard'   : 'js/static/jquery.clipboard.js',
		'login'       : 'js/common.js',
		'uri2MVC'     : 'js/common.js',
		'placeholder' : 'js/common.js',
		'duang'       : 'js/plugin/duang.js',
		'fixed'       : 'js/plugin/fixed.js',
		'lazyload'    : 'js/plugin/lazyload.js',
		'modal'       : 'js/plugin/modal.js',
		'scrollspy'   : 'js/plugin/scrollspy.js'
    }   
};

seajs.config(cfg);