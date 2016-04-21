/*!
 * @name -uri2mvc.js
 * @author ahuing
 * @date 2016-04-21 11:25:49
 */
 
define('uri2MVC', [], function(require, exports, module) {
    // 模块代码
    module.exports = function(uri, addFileName) {
        var _split = '/';
        if (!_08_ROUTE_ENTRANCE) {
            var _08_ROUTE_ENTRANCE = 'index.php?/';
        }

        (addFileName == undefined) && (addFileName = true);
        var _uri = '';
        if (typeof uri == 'string') {
            _uri = uri.replace(/&/g, _split).replace(/=/g, _split);
        } else {
            for (var i in uri) {
                _uri += (i + _split + uri[i] + _split);
            }
        }
        var _endstr = _uri.charAt(_uri.length - 1);
        if (_endstr == _split) {
            _uri = _uri.substr(0, _uri.length - 1);
        }

        var newURI = addFileName ? _08_ROUTE_ENTRANCE + _uri : _uri;
        if (!/domain/i.test(newURI)) {
            newURI += (_split + 'domain' + _split + (self.originDomain || document.domain));
        }
        return newURI;
    }
});
/*!
 * @name login.js
 * @author ahuing
 * @date 2016-04-21 11:25:50
 */

define('login', ['$', 'template', 'uri2MVC', 'modal'], function(require){
    var $  = require('$'),
        template = require('template'),
        uri2MVC  = require('uri2MVC');
    require('modal');
    $.getScript(CMS_ABS + uri2MVC('ajax=is_login&varname=test&datatype=js'), function() {
        if (test.user_info.mid) {
            $login.html(template($login.data('login'), {
                data: test.user_info
            }))
        } else {
            $login.html(template($login.data('loginno')))
        }
    })
    $.jqModal.tip('aaa');
});
/*!
 * @name placeholder.js
 * @author ahuing
 * @date 2016-04-21 11:25:50
 */

define('placeholder', ['$'], function(require){
    var $  = require('$');
    if (!('placeholder' in document.createElement('input'))) {
        $('[placeholder]').each(function() {
            var _this       = this,
                $this       = $(this),
                placeholder = $this.attr('placeholder');

            if ($.trim(_this.value) === '') _this.value = placeholder;

            $this.focus(function() {
                if ($.trim(_this.value) === placeholder) _this.value = '';
            }).blur(function() {
                if ($.trim(_this.value) === '') _this.value = placeholder;
            }).closest('form').on('submit', function() {
                if ($.trim(_this.value) === placeholder) _this.value = '';
            });
        });
    }
});
//# sourceMappingURL=..\..\src\libs\js\common.js.map
