/*!
 * @name <%= name %>
 * @author <%= author %>
 */
var cfg = {
    base : BASE_URL,
    alias: {
		'$'           : 'libs/js/static/jquery',
		'template'    : 'libs/js/static/template',
		'highcharts'  : 'libs/js/static/highcharts',
		'clipboard'   : 'libs/js/static/jquery.clipboard',
		'lazyload'    : 'libs/js/static/lazyload',
		'jscroll'     : 'libs/js/static/perfect-scrollbar',
		'dataFormat'  : 'libs/js/static/data-format',
		'login'       : 'libs/js/common',
		'uri2MVC'     : 'libs/js/common',
		'placeholder' : 'libs/js/common',
		// 'jscroll'     : 'libs/js/plugin/jscroll',
		'duang'       : 'libs/js/plugin/duang',
		'validate'    : 'libs/js/plugin/validate',
		'fixed'       : 'libs/js/plugin/fixed',
		'modal'       : 'libs/js/plugin/modal',
		'scrollspy'   : 'libs/js/plugin/scrollspy'
    },   
    preload: ['$'],
	charset: 'utf-8'
};

seajs.config(cfg);
