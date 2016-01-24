/*!
 * Sea.js 3.0.1 | seajs.org/LICENSE.md
 */
!function(e,t){function r(e){return function(t){return{}.toString.call(t)=="[object "+e+"]"}}function n(){return D++}function i(e){return e.match(T)[0]}function s(e){for(e=e.replace(C,"/"),e=e.replace(I,"$1/");e.match(U);)e=e.replace(U,"/");return e}function o(e){var t=e.length-1,r=e.charCodeAt(t);return 35===r?e.substring(0,t):".js"===e.substring(t-2)||e.indexOf("?")>0||47===r?e:e+".js"}function a(e){var t=b.alias;return t&&w(t[e])?t[e]:e}function u(e){var t,r=b.paths;return r&&(t=e.match(G))&&w(r[t[1]])&&(e=r[t[1]]+t[2]),e}function c(e){var t=b.vars;return t&&e.indexOf("{")>-1&&(e=e.replace(R,function(e,r){return w(t[r])?t[r]:e})),e}function f(e){var t,r,n,i=b.map,s=e;if(i)for(t=0,r=i.length;r>t&&(n=i[t],s=_(n)?n(e)||e:e.replace(n[0],n[1]),s===e);t++);return s}function d(e,t){var r,n,o=e.charCodeAt(0);return k.test(e)?r=e:46===o?r=(t?i(t):b.cwd)+e:47===o?(n=b.cwd.match(L),r=n?n[0]+e.substring(1):e):r=b.base+e,0===r.indexOf("//")&&(r=location.protocol+r),s(r)}function l(e,t){if(!e)return"";e=a(e),e=u(e),e=a(e),e=c(e),e=a(e),e=o(e),e=a(e);var r=d(e,t);return r=a(r),r=f(r)}function h(e){return e.hasAttribute?e.src:e.getAttribute("src",4)}function p(e,t,r,n){var i;try{importScripts(e)}catch(s){i=s}t(i)}function v(e,t,r,n){var i=W.createElement("script");r&&(i.charset=r),S(n)||i.setAttribute("crossorigin",n),y(i,t,e),i.async=!0,i.src=e,re=i,te?ee.insertBefore(i,te):ee.appendChild(i),re=null}function y(e,t,r){function n(r){e.onload=e.onerror=e.onreadystatechange=null,b.debug||ee.removeChild(e),e=null,t(r)}var i="onload"in e;i?(e.onload=n,e.onerror=function(){N("error",{uri:r,node:e}),n(!0)}):e.onreadystatechange=function(){/loaded|complete/.test(e.readyState)&&n()}}function g(){var e,t,r;if(re)return re;if(ne&&"interactive"===ne.readyState)return ne;for(e=ee.getElementsByTagName("script"),t=e.length-1;t>=0;t--)if(r=e[t],"interactive"===r.readyState)return ne=r}function E(e){function t(){d=e.charAt(f++)}function r(){return/\s/.test(d)}function n(){return'"'==d||"'"==d}function i(){var r=f,n=d,i=e.indexOf(n,r);if(-1==i)f=l;else if("\\"!=e.charAt(i-1))f=i+1;else for(;l>f;)if(t(),"\\"==d)f++;else if(d==n)break;p&&(v.push(e.substring(r,f-1)),p=0)}function s(){for(f--;l>f;)if(t(),"\\"==d)f++;else{if("/"==d)break;if("["==d)for(;l>f;)if(t(),"\\"==d)f++;else if("]"==d)break}}function o(){return/[a-z_$]/i.test(d)}function a(){var t=e.slice(f-1),r=/^[\w$]+/.exec(t)[0];y={"if":1,"for":1,"while":1,"with":1}[r],h={"break":1,"case":1,"continue":1,"debugger":1,"delete":1,"do":1,"else":1,"false":1,"if":1,"in":1,"instanceof":1,"return":1,"typeof":1,"void":1}[r],x="return"==r,E={"instanceof":1,"delete":1,"void":1,"typeof":1,"return":1}.hasOwnProperty(r),p=/^require\s*(?:\/\*[\s\S]*?\*\/\s*)?\(\s*(['"]).+?\1\s*[),]/.test(t),p?(r=/^require\s*(?:\/\*[\s\S]*?\*\/\s*)?\(\s*['"]/.exec(t)[0],f+=r.length-2):f+=/^[\w$]+(?:\s*\.\s*[\w$]+)*/.exec(t)[0].length-1}function u(){return/\d/.test(d)||"."==d&&/\d/.test(e.charAt(f))}function c(){var t,r=e.slice(f-1);t="."==d?/^\.\d+(?:E[+-]?\d*)?\s*/i.exec(r)[0]:/^0x[\da-f]*/i.test(r)?/^0x[\da-f]*\s*/i.exec(r)[0]:/^\d+\.?\d*(?:E[+-]?\d*)?\s*/i.exec(r)[0],f+=t.length-1,h=0}var f,d,l,h,p,v,y,g,E,m,x,b,O;if(-1==e.indexOf("require"))return[];for(f=0,l=e.length,h=1,p=0,v=[],y=0,g=[],m=[];l>f;)t(),r()?!x||"\n"!=d&&"\r"!=d||(E=0,x=0):n()?(i(),h=1,x=0,E=0):"/"==d?(t(),"/"==d?(f=e.indexOf("\n",f),-1==f&&(f=e.length)):"*"==d?(b=e.indexOf("\n",f),f=e.indexOf("*/",f),-1==f?f=l:f+=2,x&&-1!=b&&f>b&&(E=0,x=0)):h?(s(),h=0,x=0,E=0):(f--,h=1,x=0,E=1)):o()?a():u()?(c(),x=0,E=0):"("==d?(g.push(y),h=1,x=0,E=1):")"==d?(h=g.pop(),x=0,E=0):"{"==d?(x&&(E=1),m.push(E),x=0,h=1):"}"==d?(E=m.pop(),h=!E,x=0):(O=e.charAt(f),";"==d?E=0:"-"==d&&"-"==O||"+"==d&&"+"==O||"="==d&&">"==O?(E=0,f++):E=1,h="]"!=d,x=0);return v}function m(e,t){this.uri=e,this.dependencies=t||[],this.deps={},this.status=0,this._entry=[]}var x,b,O,w,A,_,S,D,q,N,T,C,U,I,G,R,k,L,j,P,X,B,F,V,H,z,M,J,K,Q,W,Y,Z,ee,te,re,ne,ie,se,oe,ae,ue,ce;if(!e.seajs){if(x=e.seajs={version:"3.0.1"},b=x.data={},O=r("Object"),w=r("String"),A=Array.isArray||r("Array"),_=r("Function"),S=r("Undefined"),D=0,q=b.events={},x.on=function(e,t){var r=q[e]||(q[e]=[]);return r.push(t),x},x.off=function(e,t){var r,n;if(!e&&!t)return q=b.events={},x;if(r=q[e])if(t)for(n=r.length-1;n>=0;n--)r[n]===t&&r.splice(n,1);else delete q[e];return x},N=x.emit=function(e,t){var r,n,i=q[e];if(i)for(i=i.slice(),r=0,n=i.length;n>r;r++)i[r](t);return x},T=/[^?#]*\//,C=/\/\.\//g,U=/\/[^\/]+\/\.\.\//,I=/([^:\/])\/+\//g,G=/^([^\/:]+)(\/.+)$/,R=/{([^{]+)}/g,k=/^\/\/.|:\//,L=/^.*?\/\/.*?\//,x.resolve=l,j="undefined"==typeof window&&"undefined"!=typeof importScripts&&_(importScripts),P=/^(about|blob):/,F=!location.href||P.test(location.href)?"":i(location.href),j){try{throw H=new Error}catch(fe){V=fe.stack.split("\n")}for(V.shift(),M=/.*?((?:http|https|file)(?::\/{2}[\w]+)(?:[\/|\.]?)(?:[^\s"]*)).*?/i,J=/(.*?):\d+:\d+\)?$/;V.length>0&&(K=V.shift(),z=M.exec(K),null==z););null!=z&&(Q=J.exec(z[1])[1]),B=Q,X=i(Q||F),""===F&&(F=X)}else W=document,Y=W.scripts,Z=W.getElementById("seajsnode")||Y[Y.length-1],B=h(Z),X=i(B||F);j?x.request=p:(W=document,ee=W.head||W.getElementsByTagName("head")[0]||W.documentElement,te=ee.getElementsByTagName("base")[0],x.request=v),ie=x.cache={},oe={},ae={},ue={},ce=m.STATUS={FETCHING:1,SAVED:2,LOADING:3,LOADED:4,EXECUTING:5,EXECUTED:6,ERROR:7},m.prototype.resolve=function(){var e,t,r=this,n=r.dependencies,i=[];for(e=0,t=n.length;t>e;e++)i[e]=m.resolve(n[e],r.uri);return i},m.prototype.pass=function(){var e,t,r,n,i,s=this,o=s.dependencies.length;for(e=0;e<s._entry.length;e++){for(t=s._entry[e],r=0,n=0;o>n;n++)i=s.deps[s.dependencies[n]],i.status<ce.LOADED&&!t.history.hasOwnProperty(i.uri)&&(t.history[i.uri]=!0,r++,i._entry.push(t),i.status===ce.LOADING&&i.pass());r>0&&(t.remain+=r-1,s._entry.shift(),e--)}},m.prototype.load=function(){var e,t,r,n,i,s,o=this;if(!(o.status>=ce.LOADING)){for(o.status=ce.LOADING,e=o.resolve(),N("load",e),t=0,r=e.length;r>t;t++)o.deps[o.dependencies[t]]=m.get(e[t]);if(o.pass(),o._entry.length)return void o.onload();for(n={},t=0;r>t;t++)i=ie[e[t]],i.status<ce.FETCHING?i.fetch(n):i.status===ce.SAVED&&i.load();for(s in n)n.hasOwnProperty(s)&&n[s]()}},m.prototype.onload=function(){var e,t,r,n=this;for(n.status=ce.LOADED,e=0,t=(n._entry||[]).length;t>e;e++)r=n._entry[e],0===--r.remain&&r.callback();delete n._entry},m.prototype.error=function(){var e=this;e.onload(),e.status=ce.ERROR},m.prototype.exec=function(){function require(e){var t=i.deps[e]||m.get(require.resolve(e));if(t.status==ce.ERROR)throw new Error("module was broken: "+t.uri);return t.exec()}var e,r,exports,i=this;return i.status>=ce.EXECUTING?i.exports:(i.status=ce.EXECUTING,i._entry&&!i._entry.length&&delete i._entry,i.hasOwnProperty("factory")?(e=i.uri,require.resolve=function(t){return m.resolve(t,e)},require.async=function(t,r){return m.use(t,r,e+"_async_"+n()),require},r=i.factory,exports=_(r)?r.call(i.exports={},require,i.exports,i):r,exports===t&&(exports=i.exports),delete i.factory,i.exports=exports,i.status=ce.EXECUTED,N("exec",i),i.exports):void(i.non=!0))},m.prototype.fetch=function(e){function t(){x.request(n.requestUri,n.onRequest,n.charset,n.crossorigin)}function r(e){delete oe[i],ae[i]=!0,se&&(m.save(o,se),se=null);var t,r=ue[i];for(delete ue[i];t=r.shift();)e===!0?t.error():t.load()}var n,i,s=this,o=s.uri;return s.status=ce.FETCHING,n={uri:o},N("fetch",n),i=n.requestUri||o,!i||ae.hasOwnProperty(i)?void s.load():oe.hasOwnProperty(i)?void ue[i].push(s):(oe[i]=!0,ue[i]=[s],N("request",n={uri:o,requestUri:i,onRequest:r,charset:_(b.charset)?b.charset(i):b.charset,crossorigin:_(b.crossorigin)?b.crossorigin(i):b.crossorigin}),void(n.requested||(e?e[n.requestUri]=t:t())))},m.resolve=function(e,t){var r={id:e,refUri:t};return N("resolve",r),r.uri||x.resolve(r.id,t)},m.define=function(e,r,n){var i,s,o=arguments.length;1===o?(n=e,e=t):2===o&&(n=r,A(e)?(r=e,e=t):r=t),!A(r)&&_(n)&&(r="undefined"==typeof E?[]:E(n.toString())),i={id:e,uri:m.resolve(e),deps:r,factory:n},j||i.uri||!W.attachEvent||"undefined"==typeof g||(s=g(),s&&(i.uri=s.src)),N("define",i),i.uri?m.save(i.uri,i):se=i},m.save=function(e,t){var r=m.get(e);r.status<ce.SAVED&&(r.id=t.id||e,r.dependencies=t.deps||[],r.factory=t.factory,r.status=ce.SAVED,N("save",r))},m.get=function(e,t){return ie[e]||(ie[e]=new m(e,t))},m.use=function(t,r,n){var i=m.get(n,A(t)?t:[t]);i._entry.push(i),i.history={},i.remain=1,i.callback=function(){var t,n,exports=[],s=i.resolve();for(t=0,n=s.length;n>t;t++)exports[t]=ie[s[t]].exec();r&&r.apply(e,exports),delete i.callback,delete i.history,delete i.remain,delete i._entry},i.load()},x.use=function(e,t){return m.use(e,t,b.cwd+"_use_"+n()),x},m.define.cmd={},e.define=m.define,x.Module=m,b.fetchedList=ae,b.cid=n,x.require=function(e){var t=m.get(m.resolve(e));return t.status<ce.EXECUTING&&(t.onload(),t.exec()),t.exports},b.base=X,b.dir=X,b.loader=B,b.cwd=F,b.charset="utf-8",x.config=function(e){var t,r,n,i;for(t in e)if(r=e[t],n=b[t],n&&O(n))for(i in r)n[i]=r[i];else A(n)?r=n.concat(r):"base"===t&&("/"!==r.slice(-1)&&(r+="/"),r=d(r)),b[t]=r;return N("config",e),x}}}(this);
/*!
 * @author ahuing
 * @name seajs.config.js
 */
var cfg={base:BASE_URL,alias:{$:"test/libs/js/static/jquery",template:"test/libs/js/static/template.js",highcharts:"test/libs/js/static/highcharts.js",clipboard:"test/libs/js/static/jquery.clipboard.js",lazyload:"test/libs/js/static/lazyload.js",login:"test/libs/js/common.js",uri2MVC:"test/libs/js/common.js",placeholder:"test/libs/js/common.js",duang:"test/libs/js/plugin/duang.js",fixed:"test/libs/js/plugin/fixed.js",modal:"test/libs/js/plugin/modal.js",scrollspy:"test/libs/js/plugin/scrollspy.js"}};seajs.config(cfg);
//# sourceMappingURL=seajs.js.map
