addEventListener("message",function(e){for(var d=e.data.disgPickup,r={},t=0,n=Object.keys(d);t<n.length;t++){for(var o=n[t],a=d[o],l={},u=0,s=Object.keys(a);u<s.length;u++){for(var i=s[u],x=(i in a?a[i]:[]),h=new Array,y=0,c=Object.keys(x);y<c.length;y++){var M=c[y],g=x[M],z=null===g.dx?0:Math.round(1e4*g.dx)/1e4,F=null===g.dy?0:Math.round(1e4*g.dy)/1e4,b=null===g.dz?0:Math.round(1e4*g.dz)/1e4,v=null===g.rx?0:Math.round(1e4*g.rx)/1e4,f=null===g.ry?0:Math.round(1e4*g.ry)/1e4,k=null===g.rz?0:Math.round(1e4*g.rz)/1e4;h.push({id:M,dx:z.toFixed(4),dy:F.toFixed(4),dz:b.toFixed(4),rx:v.toFixed(4),ry:f.toFixed(4),rz:k.toFixed(4),case:g.case,comb:g.comb})}l[i]=h}r[o]=l}postMessage({result:r})});