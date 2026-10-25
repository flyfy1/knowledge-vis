'use strict';
(function(root){
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const sort=ps=>ps.map(p=>p.slice()).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const unique=ps=>sort([...new Map(ps.map(p=>[p.join(','),p])).values()]);
 const presets=[[[0,0],[1,0],[2,0],[0,2],[2,2],[1,1]],[[1,1],[2,2],[2,0],[2,4],[3,3],[4,2]],[[1,2],[2,2],[4,2]],[[2,3]],[[1,0],[1,1],[1,3],[1,2]],[[0,0],[1,2],[2,5],[3,0]]];
 function trace(input){
   const points=sort(input),frames=[],lower=[],upper=[];
   function save(kind,pass,extra={}){frames.push(JSON.parse(JSON.stringify({kind,pass,lower,upper,...extra})));}
   save('start','lower');
   for(const [pass,sequence,chain] of [['lower',points,lower],['upper',points.slice().reverse(),upper]]){
     save('pass',pass);
     for(const point of sequence){
       while(chain.length>=2){
         const a=chain[chain.length-2],b=chain[chain.length-1],value=cross(a,b,point);
         if(value<0){chain.pop();save('pop',pass,{a,b,point,value});}
         else {save('keep',pass,{a,b,point,value});break;}
       }
       chain.push(point);save('append',pass,{point});
     }
   }
   save('done','upper',{result:unique(lower.concat(upper))});return frames;
 }
 const api={cross,sort,unique,presets,trace};
 if(typeof module!=='undefined')module.exports=api;else root.FenceCore=api;
})(typeof window==='undefined'?globalThis:window);
