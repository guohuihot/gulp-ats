{% include '../_js_header.html' %}
 
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