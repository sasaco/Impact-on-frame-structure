!function(){"use strict";var e,r={},t={};function n(e){var c=t[e];if(void 0!==c)return c.exports;var a=t[e]={id:e,loaded:!1,exports:{}};return r[e].call(a.exports,a,a.exports,n),a.loaded=!0,a.exports}n.m=r,e=[],n.O=function(r,t,c,a){if(!t){var o=1/0;for(f=0;f<e.length;f++){t=e[f][0],c=e[f][1],a=e[f][2];for(var i=!0,u=0;u<t.length;u++)(!1&a||o>=a)&&Object.keys(n.O).every(function(e){return n.O[e](t[u])})?t.splice(u--,1):(i=!1,a<o&&(o=a));if(i){e.splice(f--,1);var d=c();void 0!==d&&(r=d)}}return r}a=a||0;for(var f=e.length;f>0&&e[f-1][2]>a;f--)e[f]=e[f-1];e[f]=[t,c,a]},n.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(r,{a:r}),r},n.d=function(e,r){for(var t in r)n.o(r,t)&&!n.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:r[t]})},n.f={},n.e=function(e){return Promise.all(Object.keys(n.f).reduce(function(r,t){return n.f[t](e,r),r},[]))},n.u=function(e){return({75:"combine-disg2",86:"combine-fsec2",92:"result-disg1",141:"LL-disg1",228:"result-reac1",244:"pickup-disg2",333:"pickup-reac2",384:"pickup-fsec1",401:"LL-disg2",413:"LL-reac1",455:"result-fsec2",481:"LL-fsec2",533:"combine-reac1",561:"pickup-fsec2",586:"result-fsec1",608:"LL-fsec1",619:"pickup-disg1",632:"combine-reac2",669:"combine-disg1",734:"result-reac2",810:"result-disg2",848:"combine-fsec1",912:"LL-reac2",941:"pickup-reac1"}[e]||e)+"-es5."+{75:"27711320c9f70f8cd47b",86:"0595bf653abb935f36c8",92:"197a1df59627a7b523a0",141:"6b5e55728d6244132412",228:"956fcdd3376ade863c6e",244:"40f0dd6f71e1d4b0ddf8",333:"5fdfb68fa7e669848a1e",336:"00fe49a93e760220267e",384:"16309c889868331e70cd",401:"814a4dc09721716fd06f",413:"10ac487690b362a25fd4",455:"652294ec91bda0585c45",481:"a6c2de00d422e908d64d",533:"3165245fd5e220f6599d",561:"227eea65f54842dc66c7",586:"5a217c737a2601e38420",608:"3ff310106bbc1aeaf5a0",619:"026b0011d477fdd335dd",632:"34bf79a1076f1575efb2",669:"092c270e4a6165142d80",734:"0420ee5c7a7608067c76",810:"16478b613ad3898edefa",848:"94bc876db9a7f664be31",912:"56797291a8650a527ea2",941:"995ea6734b1da3caa1f6"}[e]+".js"},n.miniCssF=function(e){return"styles.a16e59b7dd383522d271.css"},n.hmd=function(e){return(e=Object.create(e)).children||(e.children=[]),Object.defineProperty(e,"exports",{enumerable:!0,set:function(){throw new Error("ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: "+e.id)}}),e},n.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},function(){var e={},r="impact-on-frame-structure:";n.l=function(t,c,a,o){if(e[t])e[t].push(c);else{var i,u;if(void 0!==a)for(var d=document.getElementsByTagName("script"),f=0;f<d.length;f++){var s=d[f];if(s.getAttribute("src")==t||s.getAttribute("data-webpack")==r+a){i=s;break}}i||(u=!0,(i=document.createElement("script")).charset="utf-8",i.timeout=120,n.nc&&i.setAttribute("nonce",n.nc),i.setAttribute("data-webpack",r+a),i.src=n.tu(t)),e[t]=[c];var l=function(r,n){i.onerror=i.onload=null,clearTimeout(p);var c=e[t];if(delete e[t],i.parentNode&&i.parentNode.removeChild(i),c&&c.forEach(function(e){return e(n)}),r)return r(n)},p=setTimeout(l.bind(null,void 0,{type:"timeout",target:i}),12e4);i.onerror=l.bind(null,i.onerror),i.onload=l.bind(null,i.onload),u&&document.head.appendChild(i)}}}(),n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},function(){var e;n.tu=function(r){return void 0===e&&(e={createScriptURL:function(e){return e}},"undefined"!=typeof trustedTypes&&trustedTypes.createPolicy&&(e=trustedTypes.createPolicy("angular#bundler",e))),e.createScriptURL(r)}}(),n.p="",function(){n.b=document.baseURI||self.location.href;var e={666:0};n.f.j=function(r,t){var c=n.o(e,r)?e[r]:void 0;if(0!==c)if(c)t.push(c[2]);else if(666!=r){var a=new Promise(function(t,n){c=e[r]=[t,n]});t.push(c[2]=a);var o=n.p+n.u(r),i=new Error;n.l(o,function(t){if(n.o(e,r)&&(0!==(c=e[r])&&(e[r]=void 0),c)){var a=t&&("load"===t.type?"missing":t.type),o=t&&t.target&&t.target.src;i.message="Loading chunk "+r+" failed.\n("+a+": "+o+")",i.name="ChunkLoadError",i.type=a,i.request=o,c[1](i)}},"chunk-"+r,r)}else e[r]=0},n.O.j=function(r){return 0===e[r]};var r=function(r,t){var c,a,o=t[0],i=t[1],u=t[2],d=0;for(c in i)n.o(i,c)&&(n.m[c]=i[c]);if(u)var f=u(n);for(r&&r(t);d<o.length;d++)n.o(e,a=o[d])&&e[a]&&e[a][0](),e[o[d]]=0;return n.O(f)},t=self.webpackChunkimpact_on_frame_structure=self.webpackChunkimpact_on_frame_structure||[];t.forEach(r.bind(null,0)),t.push=r.bind(null,t.push.bind(t))}()}();