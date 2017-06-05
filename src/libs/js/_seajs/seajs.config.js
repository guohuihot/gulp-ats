/*!
 * @name {{ name }}
 * @author {{ author }}
 */
var cfg = {
    base : BASE_URL,
    alias: {
		'$'           : '{{ rPath }}js/static/jquery',
		'template'    : '{{ rPath }}js/static/template',
		'highcharts'  : '{{ rPath }}js/static/highcharts',
		'clipboard'   : '{{ rPath }}js/static/jquery.zeroclipboard',
		'lazyload'    : '{{ rPath }}js/static/lazyload',
		'scrollbar'   : '{{ rPath }}js/static/perfect-scrollbar',
		'dataFormat'  : '{{ rPath }}js/static/jquery-dateFormat',
		'placeholder' : '{{ rPath }}js/static/jquery-placeholder',
		'login'       : '{{ rPath }}js/common',
		'uri2MVC'     : '{{ rPath }}js/common',
		'jqduang'     : '{{ rPath }}js/plugin/jqduang',
		'validate'    : '{{ rPath }}js/plugin/jqvalidate',
		'fixed'       : '{{ rPath }}js/plugin/jqfixed',
		'modal'       : '{{ rPath }}js/plugin/jqmodal',
		'scrollspy'   : '{{ rPath }}js/plugin/jqscrollspy'
    },   
    preload: ['$'],
	charset: 'utf-8'
};

seajs.config(cfg);
