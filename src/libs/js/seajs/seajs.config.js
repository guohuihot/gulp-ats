/*!
 * @author ahuing
 * @name seajs.config.js
 */

var cfg = {
    base : BASE_URL,
    alias: {
		'$'           : '<%= rPath %>js/static/jquery',
		'template'    : '<%= rPath %>js/static/template.js',
		'highcharts'  : '<%= rPath %>js/static/highcharts.js',
		'clipboard'   : '<%= rPath %>js/static/jquery.clipboard.js',
		'lazyload'    : '<%= rPath %>js/static/lazyload.js',
		'login'       : '<%= rPath %>js/common.js',
		'uri2MVC'     : '<%= rPath %>js/common.js',
		'placeholder' : '<%= rPath %>js/common.js',
		'duang'       : '<%= rPath %>js/plugin/duang.js',
		'fixed'       : '<%= rPath %>js/plugin/fixed.js',
		'modal'       : '<%= rPath %>js/plugin/modal.js',
		'scrollspy'   : '<%= rPath %>js/plugin/scrollspy.js'
    }   
};

seajs.config(cfg);