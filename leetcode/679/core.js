'use strict';
const Game24 = (()=>{
 const presets=[[4,1,8,7],[3,3,8,8],[1,2,1,2],[1,1,1,1],[1,5,5,5]];
 const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
 function rat(n,d=1){if(!d)throw Error('zero divisor');if(d<0){n=-n;d=-d;}const g=gcd(n,d);return [n/g,d/g];}
 const format=v=>v[1]===1?String(v[0]):v[0]+'/'+v[1];
 function calc(a,b,op){const [n,d]=a,[m,e]=b;if(op==='+')return rat(n*e+m*d,d*e);if(op==='−')return rat(n*e-m*d,d*e);if(op==='×')return rat(n*m,d*e);return m===0?null:rat(n*e,d*m);}
 function solve(v){if(v.length===1)return v[0][0]===24*v[0][1];for(let i=0;i<v.length;i++)for(let j=i+1;j<v.length;j++){const rest=v.filter((_,k)=>k!==i&&k!==j);for(const op of ['+','−','×','÷'])for(const [a,b] of [[v[i],v[j]],[v[j],v[i]]]){const r=calc(a,b,op);if(r&&solve([...rest,r]))return true;}}return false;}
 const initial=cards=>cards.map((v,i)=>({value:rat(v),expr:String(v),ids:[i]}));
 function reduce(nodes,i,j,op){const a=nodes[i],b=nodes[j],value=calc(a.value,b.value,op);if(!value)throw Error('invalid trace');const node={value,expr:'('+a.expr+' '+op+' '+b.expr+')',ids:[...a.ids,...b.ids].sort()};return {nodes:[...nodes.filter((_,k)=>k!==i&&k!==j),node],expr:node.expr,value:format(value)};}
 function trace(p){const cards=presets[p],parent=initial(cards),result=solve(parent.map(n=>n.value));const frames=[];
  const add=(kind,nodes,extra={})=>frames.push(JSON.parse(JSON.stringify({kind,nodes,result,...extra})));
  add('start',parent);let fail=reduce(parent,0,1,p===3?'−':'+');
  if(solve(fail.nodes.map(n=>n.value)))throw Error('excerpt must reject child');
  add('reduce',fail.nodes,fail);add('rejected',fail.nodes);add('restored',parent);
  if(!result){add('exhausted',parent);return frames;}
  let nodes=parent;
  const plans=p===0?[[2,0,'−'],[1,0,'−'],[0,1,'×']]:p===1?[[2,0,'÷'],[0,2,'−'],[0,1,'÷']]:[[0,1,'÷'],[0,2,'−'],[0,1,'×']];
  for(const [i,j,op]of plans){const r=reduce(nodes,i,j,op);nodes=r.nodes;add('reduce',nodes,r);}
  if(nodes.length!==1||format(nodes[0].value)!=='24')throw Error('bad success');add('accepted',nodes);return frames;
 }
 function hand(){let nodes=initial(presets[0]);const frames=[nodes];for(const [i,j,op]of [[2,0,'−'],[1,0,'−'],[0,1,'×']]){nodes=reduce(nodes,i,j,op).nodes;frames.push(nodes);}return frames;}
 return {presets,rat,calc,format,solve,trace,hand};
})();
if(typeof module!=='undefined')module.exports=Game24;
