/**
* author : ahuing
* date   : 2015-04-10
* name   : jqValidate v1.04
* modify : 2015-12-24 13:53:58
 */

!function ($) {
    /*
    v1.01 �޸��˲�����������Ĳ�����jq�Ĳ���һ��,������'#xxx'����js����
    v1.02 �Ľ��˵���������Ҳ����ָ����ʾ��
    v1.03 �޸��˵�ѡ��ͨ��ʱ��ʾ����
    v1.04 �޸��ַ���������֤����ʾһ�£�һ�������������ַ�
    events ����
        validatePass $('form').on('validatePass', function () { ��֤ͨ����Ķ��� })

        forms ���������config 
        vadmode : 0 // ��֤��ʽ��0=ʧ����֤ 1=�����֤ 2=ʵʱ��֤
        tipmode : 0 // ��ʾ��ʽ��0=����ʾ 1=ֱ����ʾ 2=�۽���ʾ expr=�����֤+��ʾ�ڵ�����ʾ�򣨳���>1��
        url ajax ��֤��ַ
        ignore ���Գ�ʼ��֤
        recheck �ظ���֤��ֵ��Ӧ��Ҫ��֤�ı�
        monitor �����ʾ��ʵʱ��ʾ 1:��ʾ����ʾ��ʾ���� expr:��Ӧ�ı�ǩ������ʾ��ʾ����
        offset ��ʾ��ƫ��λ��
        init ��ʼ��ʾ
        pass ͨ��ʱ����ʾ
        error ʧ��ʱ��ʾ
        type 
            string: "*" , "*6-16" , "n" , "n6-16" , "s" , "s6-18" , "p" , "m" , "e" , "url"
            number: ֻ�Զ�ѡ������
            regexp: ֱ���ñ��ʽ��֤
    */
    $('<link rel="stylesheet">').appendTo('head').attr('href', (typeof tplurl != 'undefined' ? tplurl : '') + 'css/jqvalidate.css');
    // �����ַ�������
    String.prototype.Tlength = function() {
        return this.replace(/[^\x00-\xff]/g,'aa').length;
    }

    // ����type���ʽ
    function setRegExp(obj, sType) {
        var regex = /^(.+?)(\d+)-(\d+)$/
        , aCustomReg = sType.match(regex);
        
        // type ����Ĭ�Ϲ�����&&�ַ���ת��������
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
        submit    : '[type="submit"]' // �����֤�İ�ť
        , vadmode : 0 // ��֤��ʽ��0=ʧ����֤ 1=�����֤ 2=ʵʱ��֤
        , tipmode : 0 // ��ʾ��ʽ��0=����ʾ 1=ֱ����ʾ 2=�۽���ʾ expr=�����֤+��ʾ�ڵ�����ʾ�򣨳���>1��
        , tipTpl  : '$1' // ��ʾ���ģ�壬$1:��ʽ��,$2:��ʾ��Ϣ
    }

    Validate.prototype = {
        regTips : {
            w : {
                "*"       : "����д���ֶ�"
                // , "*6-16" : "����д6��16λ�����ַ���2-16���ַ���Ӣ�ġ����ֻ�����"
                , "*6-16" : "6-16���ַ���"
                , "n"     : "����д���֣�"
                // , "n6-16" : "����д6��16λ���֣�"
                , "n6-16" : "6-16�����֣�"
                , "s"     : "�������������ַ���"
                , "s6-18" : "����д6��18λ�ַ���"
                , "p"     : "���������ʽ���ԣ�"
                , "m"     : "�ֻ������ʽ���ԣ�"
                , "e"     : "�����ַ��ʽ���ԣ�"
                , "url"   : "����д��ַ��"
            } 
            // text����data-type��ʼ����ʾ
            , "e" : "����д�����ַ"
            , "m" : "����д�ֻ�����"
            , "s" : "����д�ַ�������"
            , "p" : "����д�������룡"
            // ��text����type��ʼ����ʾ��������ʾ
            , 'password'       : '����д����'
            , 'ajax'            : '������֤...'
            , 'checkbox'        : '������ѡ��$1�'
            , 'date'            : '����������'
            , 'error'           : '��д���ݲ���ȷ'
            , 'init'            : '����д���ֶ�'
            , 'monitorTip'      : ['��������', '�Ѿ�����', '���ַ�']
            , 'pass'            : '&nbsp;'
            , 'radio'           : '��ѡ��һ��'
            , 'recheck'         : '������д���벻һ��'
            , 'select-multiple' : '��ctrl�����ж�ѡ'
            , 'select-one'      : '��ѡ���б��е�һ��'
        }
        , regType : {
            "*"       : /[\w\W]+/ // �����ַ�
            , "*6-16" : /^[\w\W]{6,16}$/
            , "n"     : /^\d+$/ // ����
            , "n6-16" : /^\d{6,16}$/
            , "s"     : /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]+$/ // �ַ���
            , "s6-18" : /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]{6,18}$/
            , "p"     : /^[0-9]{6}$/ // �ʱ�
            , "m"     : /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/ // �ֻ�
            , "e"     : /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/ // email
            , "url"   : /^(\w+:\/\/)?\w+(\.\w+)+.*$/ // ��ַ
        }
        // ����tip
        , setTip : function (ele, cls, i) {
            var $ele = $(ele)
            , eleData = $ele.data();

            // ��ȡtip
            if (cls == 1 || typeof cls == 'undefined') {
                var oft = eleData.offset
                , $before = oft && $ele.nextAll().length > 0 && ($ele.nextAll().eq(oft - 1)) || $ele;

                return cls && $before || eleData.tipmode && eleData.tipmode.length > 1 && $(eleData.tipmode) || $before.next();
            }

            var opt = this.o
            // ele = $ele[0];
            // Ԫ�����Զ��� || �ֶ��������� || Ĭ��
            , info = eleData[cls] || i || this.regTips[cls]
            , $eleGroup = eleData.group && this._self.find('.' + eleData.group);
            var $tip = opt.tipmode.length > 1 && this._self.find(opt.tipmode) || $eleGroup || this.setTip($ele);
            $tip.html(opt.tipTpl.replace('$1', info)).add(ele).removeClass('error pass ajax').addClass(cls);

            return cls == 'pass';
        }
        // reset��
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
                // ��ʼ��tip
                var $tip = this.setTip($eleEx).removeClass('error init monitor pass ajax')
                    .addClass(this.o.tipmode == 1 && !eleData.ignore && 'init' || '')
                    .html(this.o.tipTpl.replace('$1', eleData.init));
                var sMonitor = eleData.monitor;
                sMonitor && $(sMonitor == 1 && $tip || sMonitor).html(eleData.tip);//.addClass('monitor');
            }, this))

            if (!e) this._self.removeClass('submitted').trigger('resetForm')[0].reset();
            return true;
        }
        // ��֤
        , validateBase : function(ele) {
            var $ele    = $(ele)
            , eleData   = $ele.data()
            , eleDType  = eleData.type
            , eleDTypeT = $.type(eleDType)
            , _self     = this._self;
            // ��ȡjs���󷽱����ʹ��
            ele = $ele[0];

            // Ϊ��
            if (!ele.value) {
                return eleData.ignore && this.resetForm(ele) || this.setTip(ele, 'error', eleData['init']);
            }
            else if (ele.type == 'select-one') return this.setTip(ele, 'pass');

            // type������ checkbox radio
            if (!isNaN(eleDType)) {
                var checkNum = _self.find('input[data-option="'+ eleData.option +'"]:checked').length
                , rr = checkNum < eleDType;

                if (eleData.ignore && checkNum == 0) return this.resetForm(ele);
                if (eleDType < 0) rr = checkNum > -eleDType || checkNum == 0; 
                return this.setTip(ele, rr && 'error' || 'pass', rr && eleData['init']);
            }
            // type�ַ���
            else if (eleDTypeT == 'string') {
                        
                var eleRegex = this.regType[eleDType];
                // ����
                if (/\/.+\//.test(eleDType)) eleRegex = eval(eleDType);

                // ��������������֤
                if (eleData.recheck) return ele.value === _self[0][eleData.recheck].value && this.setTip(ele, 'pass') || this.setTip(ele, 'error', this.regTips.recheck);

                // δͨ��
                if (!eleRegex.test(ele.value.replace(/[^\x00-\xff]/g,'aa'))) return this.setTip(ele, 'error', this.regTips.w[eleDType]);
                // ͨ�������ajax��֤ isSubmit�ύ��ʱ����֤
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
                                obj.setTip(ele, 'error', '����������ʧ��');
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
            // ��֤�Ķ��󲻲���$fmItems,��ʱ��������ܻᶯ̬ɾ��
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

                // ��֤������۽�
                if (!curValVlue && validateValue) {
                    validateValue = false;
                    setTimeout(function () {
                        $b.trigger('focus');
                    },0)
                    // �����֤ || ��ʾ��ʽ��һ����ʾ��ʱҲ�����֤
                    if (this.o.vadmode == 1 || this.o.tipmode.length > 1) return false;
                };

            }, this))
            // ��֤ͨ���Ĳ�����һ����ajax�ύ
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
            // �����ѡ,�������Ƶ����һ��ѡ����
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

                // ����type
                $.type(eleDType) == 'string' && setRegExp(obj, eleDType);
                // console.log(this.regTips.w);
                if (!isNaN(eleDType)) {
                    // ����ѡ��
                    eleData['init'] = eleData['init'] || (obj.regTips[ele.type]).replace('$1', Math.abs(eleDType));
                    if (eleDType < 0) eleData['init'] = eleData['init'].replace('��','��');
                };

                var tipInfo = eleData['init'] = eleData['init'] || obj.regTips[ele.type] || obj.regTips[eleDType] || obj.regTips.w[eleDType] || obj.regTips['init'];

                // ��ͬ����������ʹ�ñ��������
                eleData.tipmode == null && isItem && ($ele.attr('data-tipmode', obj.o.tipmode));
                eleData.vadmode == null && isItem && ($ele.attr('data-vadmode', obj.o.vadmode));

                if (eleData.group) {
                    if (_self.find('.' + eleData.group).length) return;
                    $eleEx = _self.find('[data-group="' + eleData.group + '"]').eq(-1).addClass('group-last');
                    tipCls += eleData.group
                };
                // ��ʼ��tip
                if (obj.o.tipmode <= 2) {
                    if (obj.o.tipmode == 1 && !eleData.ignore) tipCls += ' init';
                    var $tip = eleData.tipmode && eleData.tipmode.length > 1 && $(eleData.tipmode) || $('<div>').insertAfter(obj.setTip($eleEx, 1));
                    $tip.addClass(tipCls).html(obj.o.tipTpl.replace('$1', tipInfo))
                }

                if (eleData.monitor) {
                    var aType = eleDType.match(/^(.+?)(\d+)-(\d+)$/);

                    if (!aType) return; // û����,û����ʾ,����

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
            // �ύ��
            .on('click', obj.o.submit, $.proxy(obj.validateForm, obj))
            // �س��ύ
            .on('keypress', 'input[type="text"]', function(e){
               if (e.keyCode == 13) return obj.validate();
            })
            // �����б�
            .on('change', 'select[data-type], [data-url]', function () {
                _self.removeClass('submitted');
                obj.validate(this);
            })
            // ��ѡ����ѡ
            .on('click', 'input[data-option]', function () {
                obj.validate(_self.find('input[data-option=' + $(this).data('option') + ']').get(-1));
            })
            // �۽���ʾ��ʼ��ʾ
            .on('focus', '[data-tipmode=2]', function() {
                $(this).data('ignore') || obj.setTip(this, 'init');
            })
            // ʵʱ��֤
            .on('input propertychange','[data-vadmode=2]', function () {
                $(this).data('url') || obj.validate(this);
            })
            // ʧ����֤
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