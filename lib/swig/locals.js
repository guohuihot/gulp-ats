var utils = require('../utils');
var locals = {
    now: function() {
        return new Date();
    },
    dump: function(varible) {
        var _varible;
        if (typeof varible == 'object') {
            _varible = JSON.stringify(varible);
        } else {
            _varible = varible;
        }
        return _varible;
    },
    arr: function(pattern) {
        console.log(this.toString(), 888888888888);
        // 返回
        if (pattern.indexOf('..') == -1) {
            return [];
        }
        var aPattern = pattern.split('..');
        var arr = [];

        if (!/\d+/.test(aPattern[0])) {
            for (var i = aPattern[0].charCodeAt(0); i <= aPattern[1].charCodeAt(0); i++) {
                arr.push(String.fromCharCode(i));
            }
        } else {
            for (var i = aPattern[0]; i <= aPattern[1]; i++) {
                arr.push(i);
            };
        }
        return arr;
    }
};

module.exports = locals