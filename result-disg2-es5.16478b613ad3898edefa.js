!function(){function r(r,e){var n="undefined"!=typeof Symbol&&r[Symbol.iterator]||r["@@iterator"];if(!n){if(Array.isArray(r)||(n=function(r,e){if(!r)return;if("string"==typeof r)return t(r,e);var n=Object.prototype.toString.call(r).slice(8,-1);"Object"===n&&r.constructor&&(n=r.constructor.name);if("Map"===n||"Set"===n)return Array.from(r);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return t(r,e)}(r))||e&&r&&"number"==typeof r.length){n&&(r=n);var o=0,a=function(){};return{s:a,n:function(){return o>=r.length?{done:!0}:{done:!1,value:r[o++]}},e:function(r){throw r},f:a}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var u,i=!0,l=!1;return{s:function(){n=n.call(r)},n:function(){var r=n.next();return i=r.done,r},e:function(r){l=!0,u=r},f:function(){try{i||null==n.return||n.return()}finally{if(l)throw u}}}}function t(r,t){(null==t||t>r.length)&&(t=r.length);for(var e=0,n=new Array(t);e<t;e++)n[e]=r[e];return n}addEventListener("message",function(t){var e=t.data.disg,n={},o=null;try{for(var a=0,u=Object.keys(e);a<u.length;a++){var i=u[a];if(!i.includes("max_value")){var l,d=e[i],f=new Array,c=r(d);try{for(c.s();!(l=c.n()).done;){var y=l.value,s=null===y.dx?0:Math.round(1e4*y.dx)/1e4,h=null===y.dy?0:Math.round(1e4*y.dy)/1e4,v=null===y.dz?0:Math.round(1e4*y.dz)/1e4,x=null===y.rx?0:Math.round(1e4*y.rx)/1e4,m=null===y.ry?0:Math.round(1e4*y.ry)/1e4,b=null===y.rz?0:Math.round(1e4*y.rz)/1e4;f.push({id:y.id,dx:s.toFixed(4),dy:h.toFixed(4),dz:v.toFixed(4),rx:x.toFixed(4),ry:m.toFixed(4),rz:b.toFixed(4)})}}catch(g){c.e(g)}finally{c.f()}n[i]=f}}}catch(i){o=i}postMessage({table:n,error:o})})}();