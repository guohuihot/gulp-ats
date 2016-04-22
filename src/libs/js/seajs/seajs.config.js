/*!
 * @name <%= name %>
 * @author <%= author %>
 */
var cfg = {
    base : BASE_URL,
    alias: {
		'$'           : '<%= rPath %>js/static/jquery',
		'template'    : '<%= rPath %>js/static/template',
		'highcharts'  : '<%= rPath %>js/static/highcharts',
		'clipboard'   : '<%= rPath %>js/static/jquery.clipboard',
		'lazyload'    : '<%= rPath %>js/static/lazyload',
		'jscroll'     : '<%= rPath %>js/static/perfect-scrollbar',
		'dataFormat'  : '<%= rPath %>js/static/data-format',
		'login'       : '<%= rPath %>js/common',
		'uri2MVC'     : '<%= rPath %>js/common',
		'placeholder' : '<%= rPath %>js/common',
		// 'jscroll'     : '<%= rPath %>js/plugin/jscroll',
		'duang'       : '<%= rPath %>js/plugin/duang',
		'validate'    : '<%= rPath %>js/plugin/validate',
		'fixed'       : '<%= rPath %>js/plugin/fixed',
		'modal'       : '<%= rPath %>js/plugin/modal',
		'scrollspy'   : '<%= rPath %>js/plugin/scrollspy'
    },   
    preload: ['$'],
	charset: 'utf-8'
};

seajs.config(cfg);
