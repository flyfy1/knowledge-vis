'use strict';
(function(root){
const presets=[{n:4,edges:[[0,1],[1,2],[2,3]]},{n:6,edges:[[0,1],[0,2],[2,3],[2,4],[2,5]]},{n:1,edges:[]},{n:2,edges:[[1,0]]},{n:5,edges:[[0,1],[0,2],[0,3],[0,4]]}];
function prepare({n,edges}){const g=Array.from({length:n},()=>[]);for(const [a,b] of edges){g[a].push(b);g[b].push(a);}const parent=Array(n).fill(-1),order=[0];for(let i=0;i<order.length;i++){const u=order[i];for(const v of g[u])if(v!==parent[u]){parent[v]=u;order.push(v);}}return {g,parent,order};}
function distances(input,s){const {g}=prepare(input),d=Array(input.n).fill(-1),q=[s];d[s]=0;for(let i=0;i<q.length;i++)for(const v of g[q[i]])if(d[v]<0){d[v]=d[q[i]]+1;q.push(v);}return d;}
function trace(input){const {n}=input,{parent,order}=prepare(input),size=Array(n).fill(1),down=Array(n).fill(0),answer=Array(n).fill(null),frames=[],history=[];
const save=(kind,event={})=>frames.push(JSON.parse(JSON.stringify({kind,event,size,down,answer,history,parent,order})));
save('start');for(const v of order.slice(1).reverse()){const u=parent[v],oldSize=size[u],oldDown=down[u];size[u]+=size[v];down[u]+=down[v]+size[v];const e={u,v,oldSize,oldDown,childSize:size[v],childDown:down[v],newSize:size[u],newDown:down[u]};history.push({kind:'merge',...e});save('merge',e);}
answer[0]=down[0];history.push({kind:'root',value:answer[0]});save('root',{value:answer[0]});
for(const v of order.slice(1)){const u=parent[v];answer[v]=answer[u]+n-2*size[v];const e={u,v,old:answer[u],s:size[v],outside:n-size[v],value:answer[v]};history.push({kind:'move',...e});save('move',e);}return frames;}
const api={presets,prepare,distances,trace};if(typeof module!=='undefined')module.exports=api;root.TreeCore=api;
})(typeof window==='undefined'?globalThis:window);
