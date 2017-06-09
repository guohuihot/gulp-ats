/**
 * @module utils
 */
var path = require('path');
var utils = {
        /**
         * 配合$.if使用，含有"文件名or扩展名"
         * @param  {array}  arr ['.js', 'aa.js'] 当前文件扩展名是.js或者文件名是aa.js
         * @param {Boolean} reverse=false 为真时返回相反值，表示不含有"文件名or扩展名"
         * @return {Boolean}        
         */
        hasProp: function(arr, reverse) {
            return function(file) {
                var result;
                if (arr.indexOf(path.extname(file.path)) == -1) {
                    result = false;
                    if (arr.indexOf(path.basename(file.path)) != -1) {
                        result = true;
                    };
                } else {
                    result = true;
                };
                return reverse ? !result : result;
            }
        },
        getInfo: function() {
            // 处理demo
            var tasks = require('./tasks'),
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
        inArray: function(search, array) {
            for (var i in array) {
                if (array[i] == search) {
                    return true;
                }
            }
            return false;
        },
        type: function( obj ) {
            if (Array.isArray(obj)) {
                return 'array';
            } else {
                return typeof obj;
            }
        },
        getRequires: function(str) {
            var aRequires = [];
            if (/@require\(\[*(.+)\]*\)/.test(str)) {
                aRequires = JSON.parse('[' + RegExp.$1.replace(/\'/g, '"') + ']');
            }
            return aRequires;
        }
    };

module.exports = utils;