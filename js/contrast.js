/*
 * 产品对比功能包
 * @package product compare
 * @author wiki <2009-02-15>
 * @since 1.3
 *
 * contrast
 * @param  {String} pro_name 对比项的标题                      
 * @param  {String} pro_link 对比项的链接                    
 * @param  {Object} pro_id  对比项的id 
 *
 * @说明
 * 这是html上的对比按钮的结构
 * ```html
 * <input type="checkbox" data-contrast="1" data-contrast-cfg="{obj:this, pro_name:'', pro_link:'houses/detail', pro_id:''}" value="" name="" id="pro_">
 * ```
 *
 * @说明
 * 要在js上写以下几个全局变量的配置，其中child=4代表新房，child=3代表二手房，child=2代表出租
 * ```js
 * var comp_boxMXY = [1,0,300];
 * var chid = '4';
 * var comp_action= 'houses/contrast' + '&chid=' + chid + '#aids=';
 * ```
 *
 * @模板一 最外层的div
 *  <script id="compBox" type="text/html">
 *		<div id="comp_box">
 *		    <form action="" method="get" target="_blank">
 *		        <div id="comp_top">
 *		            <a class="close font-icons-28" href="javascript:;" data-role="hidden"></a>
 *		            <div class="top_l">[<b id="comp_num">0</b>/5]<%= 'data.otit' %>对比</div>
 *		        </div>
 *		        <ul id="comp_items"></ul>
 *		        <div id="comp_boot">
 *		            <input type="submit" class="prosubmit" value="楼盘对比">
 *		            <a class="clear" data-role="clear-all" href="javascript:;">
 *		                <i class="font-icons-29 fz16 mr5"></i>清空楼盘
 *		            </a>
 *		            <input id="subid_obj" name="subcatid" type="hidden" value="4">
 *		        </div>
 *		    </form>
 *		</div>
 *	</script>
 *
 * @模板二 楼盘对比项 (例子中模板的数据在实际使用时要去掉单引号)
 *<script id="compItem" type="text/html">
 *	<li id="<%= 'data.id' %>">
 *	    <a class="icon font-icons-28" data-role="clear-one" data-id="<%= 'data.pro_id' %>" href="javascript:;"></a>
 *	    <p class="title">
 *	        <a href="<%= 'data.pro_link' %>" title="<%= 'data.pro_title' %>" target="_blank"><%= 'data.pro_title' %></a>
 *	    </p>
 *	      <input type="hidden" name="pro_id[]" value="<%= 'data.pro_id' %>">
 *	</li>
 *</script>
 *
 * @模板三 关闭后的按钮
 *<script id="btnShow" type="text/html">
 *    <a class="btnshow" data-role="show"><i class="font-icons-35"></i></a>
 *</script>
 * modify : 2017-03-27
 */

define(['jqmodal', 'template', 'cookie'], function(require, exports, module) {
	var template = require('template');

	var comp = {};

	// 初始化对象
	comp.init = function(sub_id) {
		if (!sub_id) {
			sub_id = 0; //全局搜索用
		}
		this.create_box('#comp_box');
		this.eventHandle();
		this.counter = parseInt(this.$counterContainer.html());
		this.sub_id = sub_id;
		this.pro_arr = {};
		this.last_sub_id = 0; //标记最后一次插入的产品SUBID
		this.$subid_obj.val(this.sub_id);
		this.cookie_name = 'comp_pro_str_' + this.sub_id;
		this.hasOnBeforeUnload = false;
		var pro_str = $.cookie(this.cookie_name);
		if (!pro_str) {
			this.hidden();
			return;
		}
		var items_arr = pro_str.split('@@@');
		var pro_num = items_arr.length;
		if (pro_num) {
			for (var i = 0; i < pro_num; i++) {
				var one_item_arr = items_arr[i].split('|');
				this.add_item(one_item_arr);
			}
		} else {
			this.hidden();
		}
	};

	comp.eventHandle = function() {
		// 添加
		$(document).off('.contrast').on('click.contrast', '[data-contrast="1"]', function() {
			var config = parseJSON($(this).data('contrast-cfg'));
			config.obj = this;
			add_comp(config);
		});
		// 清空
		$(document).off('.clear').on('click.clear', '[data-role="clear-all"]', function() {
			comp.remove_all();
		});
		// 移除
		$(document).off('.remove').on('click.remove', '[data-role="clear-one"]', function() {
			var id = $(this).data('id');
			comp.remove(id);
		});

		$(document).off('.hide').on('click.hide', '[data-role="hidden"]', function() {
			comp.hidden();
		});

		$(document).off('.show').on('click.show', '[data-role="show"]', function() {
			comp.show();
		});
	};

	comp.create_box = function(comp_id) {
		if ($(comp_id).length <= 0) {

			var data = {};
			data.otit = this.sub_id == 4 ? '楼盘' : '房源';

			var temp = template('compBox', {
				data: data
			});

			$('body').append($(temp));



		}

		var btnShow = template('btnShow', {});
		$('body').append($(btnShow));

		this.$comp_box = $(comp_id);
		this.comp_box = document.getElementById(comp_id.substr(1));
		this.$comp_form = this.$comp_box.find('form');
		this.$comp_top = $('#comp_top');
		this.$subid_obj = $('#subid_obj');
		this.$counterContainer = $('#comp_num');
		this.$itemContainer = $('#comp_items');
		this.$comp_boot = $('#comp_boot');
		this.$btnShow = $('.btnshow');

		this.$comp_form.attr('action', comp_action).off('submit').on('submit', function() {
			if (comp.exec()) {
				makeUrl();
			}
			return false;
		});



	};
	// 删除所有对比产品

	comp.remove_all = function() {
		var $items = this.$itemContainer.children('li');
		var items_num = $items.length;
		var pro_id_arr = [];
		if (items_num) {
			for (var k = 0; k < items_num; k++) {
				pro_id_arr[k] = $items[k].id.substr(3)
			}
			for (var i = 0; i < pro_id_arr.length; i++) {
				var pro_id = pro_id_arr[i];
				this.remove(pro_id);
			}
		}
	};

	comp.remove = function(id) {
		var $checkbox = $('#pro_' + id);
		var cp_id = '#cp_' + id;
		var $remove_item = $(cp_id);
		delete comp.pro_arr['pro_' + id];
		$(cp_id).remove();
		this.counter--;
		this.$counterContainer.html(this.counter);
		if ($checkbox.length > 0) {
			$checkbox.prop('checked', false);
			this.hasOnBeforeUnload || this.destruct(); //不支持onbeforeunload事件的话，现在就处理COOKIE
		}
	};

	comp.add_item = function(pro_id, pro_title, pro_link, sub_id) {
		if (typeof pro_id == 'object') {
			var option = pro_id;
			var pro_id = option[0];
			var pro_title = option[1];
			var pro_link = option[2];
			var sub_id = option[3];
		} else {
			var option = [pro_id, pro_title, pro_link, sub_id];
		}
		var params = {
			pro_id: pro_id,
			pro_title: pro_title,
			pro_link: pro_link,
			id: 'cp_' + pro_id
		};

		if (this.last_sub_id) {
			if (sub_id != this.last_sub_id) {
				this.last_sub_id = sub_id;
				this.$subid_obj.val(this.sub_id);
				this.remove_all();
			}
		} else {
			this.last_sub_id = sub_id;
		}

		if (this.pro_arr['pro_' + pro_id]) {
			return;
		}


		var item = template('compItem', {
			data: params
		});
		this.$itemContainer.append($(item));
		var $this_item = $(item);

		this.pro_arr['pro_' + pro_id] = option; //缓存变量
		this.counter++;

		// var counter = this.$counterContainer.html();
		this.$counterContainer.html(this.counter);
		if ($('#pro_' + pro_id).length > 0 && !$('#pro_' + pro_id).attr('checked')) {
			$('#pro_' + pro_id).prop('checked', true);
		}
		$this_item.fadeIn();
		this.hasOnBeforeUnload || this.destruct(); //不支持onbeforeunload事件的话，现在就处理COOKIE
		return $this_item;
	};

	comp.hidden = function() {
		this.$comp_box.hide();
		this.$btnShow.show();
	};

	comp.show = function() {
		this.$comp_box.show();
		this.$btnShow.hide();
		comp_scroll.play();
	};

	comp.destruct = function() {
		var pro_join = [];
		if (this.pro_arr) {
			$.each(this.pro_arr, function(index, val) {
				pro_join.push(val.join('|'));
			});
			var pro_str = pro_join.join('@@@');
			$.cookie(this.cookie_name, pro_str);
		}
	};

	comp.exec = function() {
		if (this.counter < 2) {
			$.jqModal.tip('至少选择两项对比~');
			return false;
		}
		if (this.counter > 5) {
			$.jqModal.tip('最多5项对比~');
			return false;
		}

		return true;
	};

	/**
	 * 滚动跟随类
	 * @author wiki <2009-02-16>
	 */
	function scroll(settings) {
		var self = this;
		this.settings = settings;
		this.delta = this.settings.delta || 0.05; //滚动系数
		this.rate = this.settings.rate || 30; //速度
		this.items = [];
		this.addItem = function(element, x, y) {
			with(element.style) {
				position = 'absolute';
				zIndex = '9999';
				left = typeof(x) == 'string' ? eval(x) : x;
				top = typeof(y) == 'string' ? eval(y) : y;
			}
			var newItem = {};
			newItem.obj = element;
			newItem.x = x;
			newItem.y = y;
			this.items[this.items.length] = newItem;
		}
		this.play = function() {
			for (var i = 0; i < self.items.length; i++) {
				var this_item = self.items[i];
				var this_item_x = typeof(this_item.x) == 'string' ? eval(this_item.x) : this_item.x;
				var this_item_y = typeof(this_item.y) == 'string' ? eval(this_item.y) : this_item.y;
				var doc = document.documentElement,
					body = document.body;
				var doc_left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
				var doc_top = (doc && doc.scrollTop || body && body.scrollTop || 0);

				if (this_item.obj.offsetLeft != (doc_left + this_item_x)) {
					var dx = (doc_left + this_item_x - this_item.obj.offsetLeft) * self.delta;
					dx = (dx > 0 ? 1 : -1) * Math.ceil(Math.abs(dx));
					this_item.obj.style.left = (this_item.obj.offsetLeft + dx) + 'px';
				}
				if (this_item.obj.offsetTop != (doc_top + this_item_y)) {
					var dy = (doc_top + this_item_y - this_item.obj.offsetTop) * self.delta;
					dy = (dy > 0 ? 1 : -1) * Math.ceil(Math.abs(dy));
					this_item.obj.style.top = (this_item.obj.offsetTop + dy) + 'px';
				}
			}
			if (this_item.obj.style.display == 'block' || this_item.obj.style.display == '')
				window.setTimeout(function() {
					self.play()
				}, self.rate);
		}
	}

	function add_comp(option) {
		var opt = $.extend({}, {
			obj: null,
			pro_name: '',
			pro_link: '',
			pro_id: ''
		}, option);

		var display = comp.$comp_box.css('display');

		if (display === 'none') {
			comp.$comp_box.show();
			comp.$btnShow.hide();
			display = 'block';
			comp_scroll.play();
		}

		if (comp.pro_arr['pro_' + opt.pro_id]) {
			// if (display === 'block') {
			// 	$.jqModal.tip('该房源已经在对比栏中了~');
			// }
			opt.obj.checked = true;
			return false;
		};



		if (opt.obj.checked) {
			if (comp.counter >= 5) {
				opt.obj.checked = false;
				$.jqModal.tip('最多选择5套~');
				return false;
			} else {
				var result_obj = comp.add_item(opt.pro_id, opt.pro_name, opt.pro_link, chid);
			}
		}
	};

	// 对比已钩选的产品

	function do_comp() {
		comp.exec() && makeUrl();
		return false;
	}

	function makeUrl() {
		var k, ret = '';
		for (var k in comp.pro_arr) {
			ret += ',' + k.substr(4);
		}
		window.open(comp_action + ret.substr(1), '_blank');
	}

	function parseJSON(jsonStr) {
		return jsonStr = typeof jsonStr == 'object' ? jsonStr : (new Function('return ' + jsonStr))();
	};

	comp.onload = function(opt) {
		var comp_boxMXY = opt.comp_boxMXY;
		comp_boxMXY[1] = comp_boxMXY[0] ? 'document.documentElement.clientWidth-174-' + comp_boxMXY[1] : comp_boxMXY[1];
		comp.init(opt.chid);
		comp.eventHandle();
		comp_scroll = new scroll({
			delta: 0.3,
			rate: 50
		});
		window.comp_action = opt.comp_action;
		window.chid = opt.chid;
		comp_scroll.addItem(comp.comp_box, comp_boxMXY[1], comp_boxMXY[2]);
		comp_scroll.play();
		//离开页面时触发
		window.onbeforeunload = function() {
			comp.destruct();
		}
	};

	// window.onload = function() {
	// 	//var chid = comp_action.match(/\bchid=(\d+)/);
	// 	//chid = chid ? chid[1] : 0; 页面上直接定义了chid不用这一步

	// }

	module.exports = comp;

});
//# sourceMappingURL=http://localhost:8888/js/contrast.js.map
