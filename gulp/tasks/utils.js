/**
 * @module utils
 */
module.exports = function(gulp, $) {
    var path = require('path');
    return {
        /**
         * 配合$.if使用，含有"文件名or扩展名"
         * @param  {array}  arr ['.js', 'aa.js'] 当前文件扩展名是.js或者文件名是aa.js
         * @return {Boolean}     
         */
        hasProp: function(arr) {
            return function(file) {
                return arr.indexOf(path.extname(file.path)) != -1 ||
                    arr.indexOf(path.basename(file.path)) != -1;
            }
        },
        
        getInfo: function() {
            // 处理demo
            var tasks = require('../tasks'),
                taskInfo = '',
                params;

            taskInfo += [
                '\n',
                '例：',
                'gulp build -p \'C:\\Users\\Administrator\\Desktop\\test\' -a \'ahuing\' -m 1',
                '显示帮助信息(参数一个字母一个中线，大于一个字母两个中线)',
                '\n'
            ].join('\n');

            for (var i in tasks) {
                params = '';
                for (var j in tasks[i]['argv']) {
                    params += j + '\t' + tasks[i]['argv'][j] + '\n\n\t';
                }
                taskInfo += 'gulp ' + i + '\t' + tasks[i]['title'] + '\n\t' + params + '\n';
            }
            return taskInfo;
        }, 
        /**
         * 检查数组中是否存在某个值
         * @param  {string|number} needle 要检索的值
         * @param  {array} array  要检查的数组
         * @param  {boolean} bool   是否返回索引
         * @return {boolean|number}        返回存在或者不存在或者索引值
         */
        inArray: function(needle, array, bool) {
            if (typeof needle == "string" || typeof needle == "number") {
                var len = array.length;
                for (var i = 0; i < len; i++) {
                    if (needle === array[i]) {
                        if (bool) {
                            return i;
                        }
                        return true;
                    }
                }
                return -1;
            }
        }
    }
}