/**
* author : ahuing
* date   : 2015-04-10
* name   : jqValidate v1.04
* modify : 2015-12-24 13:53:58
 */

!function ($) {
    /*
    v1.01 修复了插件各个方法的参数和jq的参数一致,可以是'#xxx'或者js对象
    v1.02 改进了单个表单对象也可以指定提示框
    v1.03 修复了单选框通过时提示错误
    v1.04 修复字符串长度验证和提示一致，一个中文算两个字符
    events 方法
        validatePass $('form').on('validatePass', function () { 验证通过后的动作 })

        forms 单个表单项的config 
        vadmode : 0 // 验证方式：0=失焦验证 1=逐个验证 2=实时验证
        tipmode : 0 // 提示方式：0=不显示 1=直接显示 2=聚焦显示 expr=逐个验证+提示在单个提示框（长度>1）
        url ajax 验证地址
        ignore 忽略初始验证
        recheck 重复验证，值对应的要验证的表单
        monitor 监控提示，实时提示 1:提示框显示提示内容 expr:对应的标签里面显示提示内容
        offset 提示框偏移位置
        init 初始提示
        pass 通过时的提示
        error 失败时提示
        type 
            string: "*" , "*6-16" , "n" , "n6-16" , "s" , "s6-18" , "p" , "m" , "e" , "url"
            number: 只对多选择有用
            regexp: 直接用表达式验证
    */
    $('<link rel="stylesheet">').appendTo('head').attr('href', (typeof tplurl != 'undefined' ? tplurl : '') + 'css/jqvalidate.css');
    // 中文字符串长度
    String.prototype.Tlength = function() {
        return this.replace(/[^\x00-\xff]/g,'aa').length;
    }

    // 处理type表达式
    function setRegExp(obj, sType) {
        var regex = /^(.+?)(\d+)-(\d+)$/
        , aCustomReg = sType.match(regex);
        
        // type 不在默认规则中&&字符串转化的数组
        !(sType in obj.regType) && aCustomReg && $.each(obj.regType, $.proxy(function (i, n) {
            var defReg = i.match(regex);
            if (defReg && defReg[1] == aCustomReg[1]) {
                var sReg = this.regType[i].toString()
                    , param = sReg.match(/\/[mgi]*/g)[1].replace("\/","")
                    , regxp = new RegExp("\\{" + defReg[2] + "," + defReg[3] + "\\}","g");

                sReg = sReg.replace(/\/[mgi]*/g,"\/")
                        .replace(regxp,"{" + aCustomReg[2] + "," + aCustomReg[3] + "}")
                        .replace(/^\//,"")
                        .replace(/\/$/,"");

                this.regType[sType] = new RegExp(sReg,param);
                this.regTips.w[sType] = this.regTips.w[i].replace(/(.*?)\d+(.+?)\d+(.*)/,"$1" + aCustomReg[2] + "$2" + aCustomReg[3] + "$3");
            };
        }, obj))
    }

    var Validate = function (_self, opt) {
        this.o        = $.extend({}, Validate.defaults, opt)
        this._self    = $(_self)
    }

    Validate.defaults = {
        submit    : '[type="submit"]' // 点击验证的按钮
        , vadmode : 0 // 验证方式：0=失焦验证 1=逐个验证 2=实时验证
        , tipmode : 0 // 提示方式：0=不显示 1=直接显示 2=聚焦显示 expr=逐个验证+提示在单个提示框（长度>1）
        , tipTpl  : '$1' // 提示框的模板，$1:样式名,$2:提示信息
    }

    Validate.prototype = {
        regTips : {
            w : {
                "*"       : "请填写此字段"
                // , "*6-16" : "请填写6到16位任意字符！2-16个字符：英文、数字或中文"
                , "*6-16" : "6-16个字符！"
                , "n"     : "请填写数字！"
                // , "n6-16" : "请填写6到16位数字！"
                , "n6-16" : "6-16个数字！"
                , "s"     : "不能输入特殊字符！"
                , "s6-18" : "请填写6到18位字符！"
                , "p"     : "邮政编码格式不对！"
                , "m"     : "手机号码格式不对！"
                , "e"     : "邮箱地址格式不对！"
                , "url"   : "请填写网址！"
            } 
            // text根据data-type初始化提示
            , "e" : "请填写邮箱地址"
            , "m" : "请填写手机号码"
            , "s" : "请填写字符和数字"
            , "p" : "请填写邮政编码！"
            // 非text根据type初始化提示及错误提示
            , 'password'       : '请填写密码'
            , 'ajax'            : '正在验证...'
            , 'checkbox'        : '请至少选择$1项！'
            , 'date'            : '请输入日期'
            , 'error'           : '填写内容不正确'
            , 'init'            : '请填写此字段'
            , 'monitorTip'      : ['还能输入', '已经超出', '个字符']
            , 'pass'            : '&nbsp;'
            , 'radio'           : '请选择一项'
            , 'recheck'         : '两次填写密码不一致'
            , 'select-multiple' : '按ctrl键进行多选'
            , 'select-one'      : '请选择列表中的一项'
        }
        , regType : {
            "*"       : /[\w\W]+/ // 任意字符
            , "*6-16" : /^[\w\W]{6,16}$/
            , "n"     : /^\d+$/ // 数字
            , "n6-16" : /^\d{6,16}$/
            , "s"     : /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]+$/ // 字符串
            , "s6-18" : /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]{6,18}$/
            , "p"     : /^[0-9]{6}$/ // 邮编
            , "m"     : /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/ // 手机
            , "e"     : /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/ // email
            , "url"   : /^(\w+:\/\/)?\w+(\.\w+)+.*$/ // 网址
        }
        // 设置tip
        , setTip : function (ele, cls, i) {
            var $ele = $(ele)
            , eleData = $ele.data();

            // 获取tip
            if (cls == 1 || typeof cls == 'undefined') {
                var oft = eleData.offset
                , $before = oft && $ele.nextAll().length > 0 && ($ele.nextAll().eq(oft - 1)) || $ele;

                return cls && $before || eleData.tipmode && eleData.tipmode.length > 1 && $(eleData.tipmode) || $before.next();
            }

            var opt = this.o
            // ele = $ele[0];
            // 元素上自定义 || 手动传进来的 || 默认
            , info = eleData[cls] || i || this.regTips[cls]
            , $eleGroup = eleData.group && this._self.find('.' + eleData.group);
            var $tip = opt.tipmode.length > 1 && this._self.find(opt.tipmode) || $eleGroup || this.setTip($ele);
            $tip.html(opt.tipTpl.replace('$1', info)).add(ele).removeClass('error pass ajax').addClass(cls);

            return cls == 'pass';
        }
        // reset表单
        , resetForm : function (e) {
            (e && $(e) || this.$fmItems).each($.proxy(function(i, ele) {
                var $ele  = $(ele)
                , $eleEx  = $ele
                , eleData = $ele.data();

                if (eleData.group) {
                    $eleEx = this._self.find('[data-group="' + eleData.group + '"]').removeClass('error pass ajax').eq(-1);
                };

                $eleEx.removeClass('error pass ajax');
                if (this.o.tipmode.length > 1) {
                    $(this.o.tipmode).removeClass('error');
                    return;
                }
                // 初始化tip
                var $tip = this.setTip($eleEx).removeClass('error init monitor pass ajax')
                    .addClass(this.o.tipmode == 1 && !eleData.ignore && 'init' || '')
                    .html(this.o.tipTpl.replace('$1', eleData.init));
                var sMonitor = eleData.monitor;
                sMonitor && $(sMonitor == 1 && $tip || sMonitor).html(eleData.tip);//.addClass('monitor');
            }, this))

            if (!e) this._self.removeClass('submitted').trigger('resetForm')[0].reset();
            return true;
        }
        // 验证
        , validateBase : function(ele) {
            var $ele    = $(ele)
            , eleData   = $ele.data()
            , eleDType  = eleData.type
            , eleDTypeT = $.type(eleDType)
            , _self     = this._self;
            // 获取js对象方便后面使用
            ele = $ele[0];

            // 为空
            if (!ele.value) {
                return eleData.ignore && this.resetForm(ele) || this.setTip(ele, 'error', eleData['init']);
            }
            else if (ele.type == 'select-one') return this.setTip(ele, 'pass');

            // type是数字 checkbox radio
            if (!isNaN(eleDType)) {
                var checkNum = _self.find('input[data-option="'+ eleData.option +'"]:checked').length
                , rr = checkNum < eleDType;

                if (eleData.ignore && checkNum == 0) return this.resetForm(ele);
                if (eleDType < 0) rr = checkNum > -eleDType || checkNum == 0; 
                return this.setTip(ele, rr && 'error' || 'pass', rr && eleData['init']);
            }
            // type字符串
            else if (eleDTypeT == 'string') {
                        
                var eleRegex = this.regType[eleDType];
                // 正则
                if (/\/.+\//.test(eleDType)) eleRegex = eval(eleDType);

                // 进行两次密码验证
                if (eleData.recheck) return ele.value === _self[0][eleData.recheck].value && this.setTip(ele, 'pass') || this.setTip(ele, 'error', this.regTips.recheck);

                // 未通过
                if (!eleRegex.test(ele.value.replace(/[^\x00-\xff]/g,'aa'))) return this.setTip(ele, 'error', this.regTips.w[eleDType]);
                // 通过后进行ajax验证 isSubmit提交表单时不验证
                else if (eleData.url) {
                    // 13423045270
                    if (!$ele.hasClass('ajax')) {
                        var param = {}, obj = this;
                   
                        eleData.value = param[eleData.alias || ele.name] = ele.value;
                        obj.setTip(ele, 'ajax');
                        _self.addClass('locked');
                        // console.log(ele.className);
                        setTimeout(function () {
                            $.ajax({
                                url: eleData.url,
                                type: eleData.ajaxType || 'GET',
                                dataType: eleData.ajaxDatatype || 'json',
                                data: param
                            }).done(function (res) {
                                _self.removeClass('locked');
                                var doneFun = function (r, i) {
                                    eleData.ajaxRes = [r,i];
                                    obj.setTip(ele, r, i)
                                    if (_self.hasClass('submitted')) {
                                        _self.removeClass('submitted');
                                        obj.validate();
                                    } 
                                }

                                if ($ele.hasEvent('ajaxDone')) {
                                    $ele.trigger('ajaxDone',[res, doneFun]);
                                } else doneFun(res.result, res.info);

                            }).fail(function (res) {
                                obj.setTip(ele, 'error', '服务器请求失败');
                            })
                        }, 300)
                    }
                        
                    return;
                }
            }
           return this.setTip(ele, 'pass');
        }
        , validateForm : function () {
            var _self = this._self;
            _self.addClass('submitted');

            if (_self.hasClass('locked')) return false;

            var validateValue = true;
            // 验证的对象不参用$fmItems,有时表单的项可能会动态删除
            this._self.find('[data-type]').each($.proxy(function(a, b) {
                var $b = $(b), curValVlue;
                if ($b.data('value') != b.value) {
                    curValVlue = this.validate(b);
                } 
                else {
                    var ajaxRes = $b.data('ajaxRes');
                    curValVlue = ajaxRes[0] == 'pass';
                    this.setTip(b, ajaxRes[0], ajaxRes[1]);
                }

                if ($b.hasClass('group-last')) {
                    var oError = _self.find('[data-group="' + $b.data('group') + '"]').filter('.error')[0];
                    oError && (curValVlue = this.validate(oError));
                }

                // 验证错误项聚焦
                if (!curValVlue && validateValue) {
                    validateValue = false;
                    setTimeout(function () {
                        $b.trigger('focus');
                    },0)
                    // 逐个验证 || 提示方式是一个提示框时也逐个验证
                    if (this.o.vadmode == 1 || this.o.tipmode.length > 1) return false;
                };

            }, this))
            // 验证通过的操作，一般作ajax提交
            if (validateValue && _self.hasEvent('validatePass')) {
                _self.trigger('validatePass');
                return false;
            };
            // validateValue && console.log('ok');
            validateValue && _self.trigger('submit');
            return false;
        }
        , validate : function (el) {
            return this[el ? 'validateBase' : 'validateForm'](el);
        }
        , init : function () {
            var _self = this._self.addClass('jqValidate')
            , obj = this;
            // 处理多选,将配置移到最后一个选项上
            _self.find('input[data-type][data-option]').each(function(i, el) {
               var $el = $(el)
               , elData = $el.data();

               var options = _self.find('input[data-option="'+ elData.option +'"]');
               if (options.length > 1) {
                   options.eq(-1).attr('data-type', elData.type).data(elData);
                   $el.removeAttr('data-type');
               }
            });

            obj.$fmItems = _self.find('[data-type]');
            if (!obj.$fmItems) return false;
            _self.attr('novalidate', 'novalidate');
            // document.title = obj.o.tipmode.length > 1;
            if (obj.o.tipmode.length > 1) _self.find(obj.o.tipmode).addClass('tip single');
            obj.$fmItems.each(function(i, ele) {

                var $ele   = $(ele)
                , $eleEx   = $ele
                , eleData  = $ele.data()
                , eleDType = eleData.type
                , tipCls   = 'tip '
                , isItem   = $.inArray(ele.type, ['text','password','select-one','textarea']) >= 0;

                // 处理type
                $.type(eleDType) == 'string' && setRegExp(obj, eleDType);
                // console.log(this.regTips.w);
                if (!isNaN(eleDType)) {
                    // 至多选项
                    eleData['init'] = eleData['init'] || (obj.regTips[ele.type]).replace('$1', Math.abs(eleDType));
                    if (eleDType < 0) eleData['init'] = eleData['init'].replace('少','多');
                };

                var tipInfo = eleData['init'] = eleData['init'] || obj.regTips[ele.type] || obj.regTips[eleDType] || obj.regTips.w[eleDType] || obj.regTips['init'];

                // 相同的设置优先使用表单项的设置
                eleData.tipmode == null && isItem && ($ele.attr('data-tipmode', obj.o.tipmode));
                eleData.vadmode == null && isItem && ($ele.attr('data-vadmode', obj.o.vadmode));

                if (eleData.group) {
                    if (_self.find('.' + eleData.group).length) return;
                    $eleEx = _self.find('[data-group="' + eleData.group + '"]').eq(-1).addClass('group-last');
                    tipCls += eleData.group
                };
                // 初始化tip
                if (obj.o.tipmode <= 2) {
                    if (obj.o.tipmode == 1 && !eleData.ignore) tipCls += ' init';
                    var $tip = eleData.tipmode && eleData.tipmode.length > 1 && $(eleData.tipmode) || $('<div>').insertAfter(obj.setTip($eleEx, 1));
                    $tip.addClass(tipCls).html(obj.o.tipTpl.replace('$1', tipInfo))
                }

                if (eleData.monitor) {
                    var aType = eleDType.match(/^(.+?)(\d+)-(\d+)$/);

                    if (!aType) return; // 没规则,没法提示,返回

                    var sMonitor  = eleData.monitor
                    , maxNum   = aType[3]
                    , monitorTip2 = obj.regTips.monitorTip[2]
                    , moniTipInfo = obj.regTips.monitorTip[0] + '<b class="fco">' + maxNum + "</b>" + monitorTip2;

                    $tip = sMonitor == 1 && $tip || $(sMonitor).html(moniTipInfo);

                    eleData.tip = moniTipInfo;

                    $ele.on('input propertychange', function() {
                        var val = ele.value.Tlength() - maxNum;
                        $tip.html(obj.regTips.monitorTip[val <= 0 ? 0 : 1] + '<b class="fco">' + (val <= 0 ? -1 : 1) * val + '</b>' + monitorTip2)
                        .add(this).removeClass('error pass ajax');
                    })
                    .on('focus', function () {
                        $tip.addClass('monitor')
                    })
                };
            })

            _self
            // 提交表单
            .on('click', obj.o.submit, $.proxy(obj.validateForm, obj))
            // 回车提交
            .on('keypress', 'input[type="text"]', function(e){
               if (e.keyCode == 13) return obj.validate();
            })
            // 下拉列表
            .on('change', 'select[data-type], [data-url]', function () {
                _self.removeClass('submitted');
                obj.validate(this);
            })
            // 单选、多选
            .on('click', 'input[data-option]', function () {
                obj.validate(_self.find('input[data-option=' + $(this).data('option') + ']').get(-1));
            })
            // 聚焦显示初始提示
            .on('focus', '[data-tipmode=2]', function() {
                $(this).data('ignore') || obj.setTip(this, 'init');
            })
            // 实时验证
            .on('input propertychange','[data-vadmode=2]', function () {
                $(this).data('url') || obj.validate(this);
            })
            // 失焦验证
            .on('blur','[data-vadmode=0], [data-vadmode=1]', function() {
                $(this).data('url') && this.value || obj.validate(this);
            })
            .find(this.o.submit).prop('disabled', '');
        }

    }

    $.fn.hasEvent = function(e) {
        var fmEvents = $.data(this[0],'events') || $._data(this[0],'events');
        return fmEvents && fmEvents[e] || false;
    }

    function Plugin(option) {
        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('jqvalidate')
            var options = typeof option == 'object' && option

            if (!data) {
                $this.data('jqvalidate', (data = new Validate(this, options)));
                data.init();
            }
            if (typeof option == 'string') data[option]()
            else if (typeof option == 'function') option.call(this, data);
        })
    }

    var old = $.fn.jqValidate;

    $.fn.jqValidate             = Plugin
    $.fn.jqValidate.Constructor = Validate;

    $.fn.jqValidate.noConflict = function () {
        $.fn.jqValidate = old
        return this
    }

    $(window).on('load', function () {
        $('.jqValidate').each(function() {
            var $this = $(this);
            Plugin.call($this, $this.data())
        });
    })

}(jQuery);