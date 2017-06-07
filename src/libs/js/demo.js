{% include '_js_header.html' %}

define(function(require, exports, moudles) {
	var $ = require('jquery');
	require('modal')($);

	$.jqModal.tip('aaa');
});


(() => console.log(111))();

let [a, b] = [1, 2];

let c = [...[1,2], ...[3,4]];

let d = (...i) => i[0] + 1;