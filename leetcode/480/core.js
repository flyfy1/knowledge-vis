'use strict';
(function(root){
function trace(nums,k){
 const values=[...new Set(nums)].sort((a,b)=>a-b), ranks=new Map(values.map((x,i)=>[x,i]));
 let size=1; while(size<values.length) size*=2;
 const tree=Array(size*2).fill(0), frames=[], active=[], answers=[];
 function update(x,d){let node=size+ranks.get(x);tree[node]+=d;while((node=Math.floor(node/2)))tree[node]=tree[node*2]+tree[node*2+1];}
 function select(r){let node=1;const route=[];while(node<size){const c=tree[node*2];route.push({node,r,c,left:r<=c});if(r<=c)node*=2;else{r-=c;node=node*2+1;}}return {value:values[node-size],route,leaf:node};}
 function save(kind,i,value=null,selections=[]){frames.push({kind,i,value,active:[...active],tree:[...tree],answers:[...answers],selections:structuredClone(selections)});}
 save('start',-1);
 nums.forEach((x,i)=>{if(i>=k){active.shift();update(nums[i-k],-1);save('remove',i,nums[i-k]);}active.push(x);update(x,1);save('add',i,x);if(i>=k-1){const s=[select(Math.floor((k+1)/2)),select(Math.floor((k+2)/2))];answers.push((s[0].value+s[1].value)/2);save('query',i,null,s);}});
 return {nums:[...nums],k,values,size,frames};
}
const api={trace};if(typeof module!=='undefined')module.exports=api;root.Median480=api;
})(typeof window==='undefined'?globalThis:window);
