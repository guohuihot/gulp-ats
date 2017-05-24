{% include '../_js_header.html' %}

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