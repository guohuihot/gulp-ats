/*!
 * @author ahuing
 * @name seajs.config.js
 */

var cfg = {
    base : BASE_URL,
    alias: {
		'$'           : '<%= libs %>js/static/jquery',
		'template'    : '<%= libs %>js/static/template.js',
		'highcharts'  : '<%= libs %>js/static/highcharts.js',
		'clipboard'   : '<%= libs %>js/static/jquery.clipboard.js',
		'lazyload'    : '<%= libs %>js/static/lazyload.js',
		'login'       : '<%= libs %>js/common.js',
		'uri2MVC'     : '<%= libs %>js/common.js',
		'placeholder' : '<%= libs %>js/common.js',
		'duang'       : '<%= libs %>js/plugin/duang.js',
		'fixed'       : '<%= libs %>js/plugin/fixed.js',
		'modal'       : '<%= libs %>js/plugin/modal.js',
		'scrollspy'   : '<%= libs %>js/plugin/scrollspy.js'
    }   
};

seajs.config(cfg);