addEventListener("message",function(a){var r=function(a){var r,e=null;try{var n=a.toString().trim();n.length>0&&(r=+n,e=isNaN(r)?null:r)}catch(n){e=null}return e},e=a.data.jsonData,n={},m={},_={},l=null;try{for(var t=0,d=Object.keys(e);t<d.length;t++){var i=d[t],u=new Array,s=e[i];if("object"==typeof s&&"disg"in s){for(var x=s.disg,v={max_d:Number.MIN_VALUE,max_r:-1e3*Math.PI,min_d:Number.MAX_VALUE,min_r:1e3*Math.PI,max_d_m:"0",max_r_m:"0",min_d_m:"0",min_r_m:"0"},c=0,h=Object.keys(x);c<h.length;c++){var o=h[c],g=o.replace("node","");if(!g.includes("n")&&!g.includes("l")){var y=x[o],f=r(y.dx),M=r(y.dy),b=r(y.dz),p=r(y.rx),N=r(y.ry),j=r(y.rz);f=null==f?0:1e3*f,M=null==M?0:1e3*M,b=null==b?0:1e3*b,p=null==p?0:1e3*p,N=null==N?0:1e3*N,j=null==j?0:1e3*j,u.push({id:g,dx:f,dy:M,dz:b,rx:p,ry:N,rz:j});for(var z=0,A=[f,M,b];z<A.length;z++){var E=A[z];v.max_d<E&&(v.max_d=E,v.max_d_m=o),v.min_d>E&&(v.min_d=E,v.min_d_m=o)}for(var I=0,L=[p,N,j];I<L.length;I++){var k=L[I];v.max_r<k&&(v.max_r=k,v.max_r_m=o),v.min_r>k&&(v.min_r=k,v.min_r_m=o)}}}var O=i.replace("Case","");n[O]=u,m[O]=Math.max(Math.abs(v.max_d),Math.abs(v.min_d)),_[O]=v}}}catch(i){l=i}postMessage({disg:n,max_value:m,value_range:_,error:l})});