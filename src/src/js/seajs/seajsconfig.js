/**
 * @name seajsconfig
 * @author ahuing
 * @link 08cms.com
 * @date 2015-12-31 09:50:43
 */

seajs.config({
	// base: './js',
    alias:{
		'$'           : 'static/jquery',
		'template'    : 'static/template.js',
		'highcharts'  : 'static/highcharts.js',
		'clipboard'   : 'static/jquery.clipboard.js',
		'login'       : 'common.js',
		'uri2MVC'     : 'common.js',
		'placeholder' : 'common.js',
		'duang'       : 'plugin/duang.js',
		'fixed'       : 'plugin/fixed.js',
		'lazyload'    : 'plugin/lazyload.js',
		'modal'       : 'plugin/modal.js',
		'scrollspy'   : 'plugin/scrollspy.js'
    }   
});