/*!
 * @author ahuing
 * @name seajs.config.js
 */

var cfg = {
    base : BASE_URL,
    alias: {
		'$'           : '<%= path %>js/static/jquery',
		'template'    : '<%= path %>js/static/template.js',
		'highcharts'  : '<%= path %>js/static/highcharts.js',
		'clipboard'   : '<%= path %>js/static/jquery.clipboard.js',
		'lazyload'    : '<%= path %>js/static/lazyload.js',
		'login'       : '<%= path %>js/common.js',
		'uri2MVC'     : '<%= path %>js/common.js',
		'placeholder' : '<%= path %>js/common.js',
		'duang'       : '<%= path %>js/plugin/duang.js',
		'fixed'       : '<%= path %>js/plugin/fixed.js',
		'modal'       : '<%= path %>js/plugin/modal.js',
		'scrollspy'   : '<%= path %>js/plugin/scrollspy.js'
    }   
};

seajs.config(cfg);