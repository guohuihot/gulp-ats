/**
 * @module utils
 */
var path = require('path');
// 处理字符串 e\a\a\b.html => e/a/a/b.html
String.prototype.normal = function() {
    return this.split(path.sep).join('/');
}
// 去掉首数字  
// 11aaa => aaa 
// 111 => 111 
// aaa => aaa
String.prototype.filterPreNumbers = function() {
    var reg = new RegExp('(^\\d*)(\\D+\\s?)')
    return this.replace(reg, '$2');
}
// [a, b, c, d].chunk(2) => [[a, b], [c, d]]
Array.prototype.chunk = function(n) {
    for (var i = 0, temp = [], l = ~~this.length / n; temp.length < l; temp[i++] = this.splice(0, n));
    return temp;
}
// 按首字母排序
Array.prototype.sortByPreNumbers = function() {
    return this.sort(function(a, b) {
        return (parseInt(a) || 1000) - (parseInt(b) || 1000);
    });
}

// [1, 2, 3, 4, 5, 6].chunk(2)

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
        },
        /**
         * @method getImgSize
         * @description  获取图片的显示大小
         * @param {Object} img 对象
         * @param {Number} maxW 允许的最大宽度
         * @param {Number} maxH 允许的最大高度
         */
        getImgSize: function(img, maxW, maxH) {
            var nH, nW, _W, _H;

            nW = _W = img.width;
            nH = _H = img.height;

            if (_W > 0 && _H > 0) {
                if (_W / _H >= maxW / maxH && _W > maxW) {
                    nW = maxW;
                    nH = parseInt(_H * maxW / _W);
                } else if (_H > maxH) {
                    nH = maxH;
                    nW = parseInt(_W * maxH / _H);
                }
            }
            return [nW, nH];
        },
        getTasks: function(str) {
            var reg = new RegExp('gulp.task\\([\'\"]\\s?(\\S+)\\s?[\'\"]', 'g');
            var arr = reg.exec(str);
            var tasks = [];

            while (arr) {
                tasks.push(arr[1]);
                arr = reg.exec(str);
            }

            return tasks;
        },
        isEmptyObject: function(e) {
            var t;  
            for (t in e)  
                return !1;  
            return !0  
        }
    };

module.exports = utils;