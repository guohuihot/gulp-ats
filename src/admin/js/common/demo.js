/*!
 * @name <%= name %>
 * @author <%= author %>
 * @date <%= date %>
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