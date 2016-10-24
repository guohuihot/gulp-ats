/***
name:gallery.js
author:ahuing
date:2014-01-15
modify:2014-01-15
***/
;(function($) {
	$.extend(jQuery.easing,{
		easeOutQuint: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		}
	});

	$.extend({
		gallery: function(o) {
			o = $.extend({
				big          : ''//大图的外框
				,small       : ''//子节点的格式value='' data-url='' data-title=''
				,botPrev     : ''//下一个
				,botNext     : ''//上一个
				,visible     : 6//小图显示的个数
				,curClass    : 'hover'//当然图片的class
				,endLayer    : '#endLayer'//最后一个弹出的广告层
				,maxW        : 500//大图的最大宽度
				,maxH        : 400//大图的最大高度
				,circular    : 0//循环
				,showIndex   : 0//显示数字索引
				,showBigBot  : 0//大图上面的上一个下一个
				,now         : 1//激活第now个元素,从1开始
				,keyboard    : 0//允许键盘操作
				,oImg        : ''//原图链接的对象
				,title       : ''//图片的标题的对象
				,numerator   : ''//当前索引的节点
				,denominator : ''//总数的节点
				,effect      : 'css'//css,animate
				,endFun      : null
			},
			o || {});
			if(!$(o.small).length) return;
			var  $thumbs = $(o.small)
			,$li         = $thumbs.children()
			,$big        = $(o.big)
			,$loading    = $('<div class="loading"></div>').insertAfter($big)
			,begin       = parseInt(location.hash.replace("#g=",""))
			,index       = !isNaN(begin)?begin-1:o.now-1
			,nowIndex    = 0
			,size        = $li.length
			,now         = parseInt(o.visible/2)-(o.visible%2==0&&1)
			,$title      = $(o.title)
			,$oImg       = $(o.oImg)
			,$endLayer   = $(o.endLayer)
			,g           = $li.outerWidth(true)
			,pb          = $big.outerWidth()-$big.width()
			, $wrap      = $big.parent();
		//初始化
		$li.on('click',function () {
			if ($(this).hasClass(o.curClass)) return;
			$endLayer.css('display','none');
			index = $li.index(this);
			fadeAB();
			return false;
		})

		$endLayer.css('display','none').click(function(e) {
			e.stopPropagation();
		})

		o.showIndex&&$li.each(function (i) {
			this.innerHTML+='<tt>'+(i+1)+'/'+size+'</tt>';
		})

		o.denominator&&$(o.denominator).text(size);

		$wrap.css({
			width:o.maxW
			,height:o.maxH
			,position:'relative'
			,margin:'0 auto'
			,cursor:'pointer'
		}).attr({
			unselectable : "on"
			,onselectstart : "return false;"
		});

		$big.css({
			position:'absolute'
			,left:'50%'
			,top:'50%'
			,width:0
			,height:0
			,overflow:'hidden'
		})

		$thumbs.css({
			left:0
			,width:99999
			,position:'relative'
		}).parent().css({
			width:g*o.visible
			,overflow:'hidden'
			,margin:'0 auto'
			,position:'relative'
		})

		fadeAB();
		// setInterval(runNext, 3000)
		if (o.showBigBot) {
			$pnBtns = $('<a class="big-prev">&#xe68c;</a><a class="big-next">&#xe68f;</a>').appendTo($wrap);

			var $wrapL = $wrap.offset().left + o.maxW / 2;
			$wrap.mouseenter(function(e) {
				$pnBtns.eq(e.pageX > $wrapL).animate({
					opacity: 'show'
				});
			}).mousemove(function(e) {
				$pnBtns[(e.pageX > $wrapL)*1].style.display = 'block';
				$pnBtns[(e.pageX < $wrapL)*1].style.display = 'none';
			}).mouseleave(function() {
				$pnBtns.css('display','none');
			}).click(function(e) {
				e.pageX  > $wrapL ? runNext() : runPrev();
			})
		};

		//上一个
		o.botPrev && $(o.botPrev).on('click',function () {
			runPrev();
			return false;
		});

		// 下一个
		o.botNext && $(o.botNext).on('click',function () {
			runNext();
			return false;
		});

		function runNext() {
			index = nowIndex + 1;
			if (o.circular)	index %= size;
			else $endLayer.css('display',index==size?'block':'none');

			if(index<size) fadeAB()
			return false;
		}

		function runPrev() {
			$endLayer.css('display','none');
			if (o.circular)	index = (nowIndex + size - 1)%size;
			else index = nowIndex - 1;
			if(index>=0) fadeAB()
			return false;
		}

		// 切换
		function fadeAB() {
			var $nowImg=$big.css('display','none').find('img').css('display','none').filter('.i'+index)
				,$nowLi=$li.removeClass(o.curClass).eq(index).addClass(o.curClass);

			if (!$nowImg.length){
				$loading.css('display','block');
				var $img = $('<img>',{'class':'i'+index,style:'width:100%;height:100%;'})
					,_img = new Image();
				_img.onerror=function () {
	            	bigAnimate([0,0],$img);
				}
				_img.onload=function () {
	            	bigAnimate(getSize(_img,o.maxW,o.maxH),$img);
				}
				_img.src = $nowLi.attr('data-url');
				$big.prepend($img.attr('src',_img.src));
			}else{
	            bigAnimate($nowImg.css('display','block').data('data-size'));
			}
			$oImg.attr('href',$nowLi.attr('data-url'));
			$title.html($nowLi.attr('data-title'));
			if (size>o.visible) move();
			location.hash='#g='+(index+1);
			o.numerator&&$(o.numerator).text(index+1);
			nowIndex = index;
			o.endFun&&o.endFun.call($nowLi,index);
		}

		function bigAnimate (imgSize,$img) {
            if($img){
				$loading.css('display','none');
	            $img.data('data-size',imgSize);
            }
            var _params={
	    			left:(o.maxW-imgSize[0])/2
					,top:(o.maxH-imgSize[1])/2
					,height: imgSize[1]-pb
					,width: imgSize[0]-pb
				};

            o.effect=='css'?$big.stop(0,1).css(_params).animate({opacity:'show'}):$big.stop(0,1).animate($.extend(_params,{opacity:'show'}));
		}

		// 缩放图片
		function getSize(img, iW, iH) {
            var nH, nW
            	,nW = _w = img.width
            	,nH = _H = img.height;
            if (_w > 0 && _H > 0) {
                if (_w / _H >= iW / iH && _w > iW) {
                    nW = iW;
                    nH = parseInt(_H * iW / _w);
                }else if (_H > iH) {
                    nH = iH;
                    nW = parseInt(_w * iH / _H);
                }
            }
            return [nW,nH];
        }

		function move () {
			var step;
			if (index<=now) step=0;
			else if (index>now&&index<size-(now+1)) step=-(index-now);
			if (index>=size-(now+1)) step=-(size-o.visible);

			$thumbs.stop(0,1).animate({left: g*step},400,'easeOutQuint');
		}

		//键盘事件
		if(o.keyboard){
			$(document).on('keydown',function (e) {
				var k = e.which;
				if(k == 33 || k == 37) {
					runPrev();
					return false;
				};
				if (k == 34 || k == 39) {
					runNext();
					return false;
				}
			})
		}

	}
})

})(jQuery);



