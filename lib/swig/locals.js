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
    }
};

module.exports = locals