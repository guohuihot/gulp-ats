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
		'clipboard'   : '<%= rPath %>js/static/jquery.zeroclipboard',
		'lazyload'    : '<%= rPath %>js/static/lazyload',
		'scrollbar'   : '<%= rPath %>js/static/perfect-scrollbar',
		'dataFormat'  : '<%= rPath %>js/static/jquery-dateFormat',
		'placeholder' : '<%= rPath %>js/static/jquery-placeholder',
		'login'       : '<%= rPath %>js/common',
		'uri2MVC'     : '<%= rPath %>js/common',
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
