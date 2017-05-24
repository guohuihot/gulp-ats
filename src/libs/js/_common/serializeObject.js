{% include '../_js_header.html' %}
    
Array.prototype.intersect = function(b) {
    var flip = {}, res = [];
    for (var i = 0; i < b.length; i++) flip[b[i]] = i;
    for (i = 0; i < this.length; i++)
        if (flip[this[i]] != undefined) res.push(this[i]);
    return res;
}

 $.fn.serializeObject = function() {
    var o = {};    
    $.each(this, function(i, el) {
         var $this = $(this);
         var k = $this.data('name') || this.name,
             v = $this.data('value') || this.value;

         if (!v) return;

         if (o[k] && o[k].indexOf('in|') === 0) {
             var a = o[k].slice(3).split(','),
                 b = v.slice(3).split(',');
             v = 'in|' + a.intersect(b).join(',')
         }
         o[k] = v || '';
    });    
    return o;    
 };