var utils = require('../utils');
var filters = {
        merge: function(input, second) {
            if (utils.type(input) == 'array') {
                var len = +second.length,
                    j = 0,
                    i = input.length;

                for ( ; j < len; j++ ) {
                    input[ i++ ] = second[ j ];
                }

                input.length = i;
            } else if (utils.type(input) == 'object') {
                input = $.extend(input, second);
            }
            return input;
        },
        fontUnicode: function(input) {
            return input.charCodeAt(0).toString(16).toUpperCase();
        },
        cssSize: function(input) {
            return input ? input + 'px' : 0;
        },
        length: function(input) {
            return utils.type(input) == 'object' ? Object.keys(input).length : input.length;
        },
        slice: function(input, start, length) {
            if (utils.type(input) == 'array' ) {
                var _input = [];
                _input = input.slice(start, length);
            } else if (utils.type(input) == 'object') {
                var _input = {};
                var arr = Object.keys(input).slice(start, length);
                arr.forEach(function(k) {
                    _input[k] = input[k];
                });
            }
            return _input;
        },
        U: function(input, start, length) {
            return input;
        },
        getAll: function(input, start, length) {
            return input;
        },
        getRow: function(input, start, length) {
            return input;
        },
        getOne: function(input, start, length) {
            return input;
        }
    };

module.exports = filters