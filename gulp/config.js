module.exports = function() {
    var config = {
        webdown: {
            ignore: ['cnzz', 'tongji', 'jiathis'], // 忽略地址的关键词
            conLogo: 'attachment', // 内容图片的标识
            cssLogo: '', // css图片的标识，慎用，只会下载包含此标识的css图片
            pageName: 'index', // 页面的名称
            debug: true //下载时打印调试信息
        }
    };
    return config;
};