addEventListener("message",({data:n})=>{const e=n=>{let e=null;try{const a=n.toString().trim();a.length>0&&(t=+a,e=isNaN(t)?null:t)}catch(a){e=null}var t;return e},t=n.jsonData,a={},r={},m={};let _=null;try{for(const n of Object.keys(t)){const _=new Array,l=t[n];if("object"!=typeof l||!("disg"in l))continue;const s=l.disg;let d={max_d:Number.MIN_VALUE,max_r:-1e3*Math.PI,min_d:Number.MAX_VALUE,min_r:1e3*Math.PI,max_d_m:"0",max_r_m:"0",min_d_m:"0",min_r_m:"0"};for(const n of Object.keys(s)){const t=n.replace("node","");if(t.includes("n")||t.includes("l"))continue;const a=s[n];let r=e(a.dx),m=e(a.dy),l=e(a.dz),o=e(a.rx),i=e(a.ry),c=e(a.rz);r=null==r?0:1e3*r,m=null==m?0:1e3*m,l=null==l?0:1e3*l,o=null==o?0:1e3*o,i=null==i?0:1e3*i,c=null==c?0:1e3*c,_.push({id:t,dx:r,dy:m,dz:l,rx:o,ry:i,rz:c});for(const e of[r,m,l])d.max_d<e&&(d.max_d=e,d.max_d_m=n),d.min_d>e&&(d.min_d=e,d.min_d_m=n);for(const e of[o,i,c])d.max_r<e&&(d.max_r=e,d.max_r_m=n),d.min_r>e&&(d.min_r=e,d.min_r_m=n)}const o=n.replace("Case","");a[o]=_,r[o]=Math.max(Math.abs(d.max_d),Math.abs(d.min_d)),m[o]=d}}catch(l){_=l}postMessage({disg:a,max_value:r,value_range:m,error:_})});