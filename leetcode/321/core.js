(function(root){'use strict';
const cmp=(a,b)=>{for(let i=0;i<Math.min(a.length,b.length);i++){if(a[i]!==b[i])return a[i]-b[i];}return a.length-b.length;};
function pickTrace(nums,take){
 if(!Number.isInteger(take)||take<0||take>nums.length)throw new RangeError('take');
 const frames=[],stack=[];let drop=nums.length-take,processed=0;
 const save=(type,digit=null,before=stack.slice())=>frames.push({type,digit,before:before.slice(),stack:stack.slice(),drop,processed,take});
 save('start');
 nums.forEach((digit,index)=>{
  while(drop&&stack.length&&stack[stack.length-1]<digit){const before=stack.slice(),removed=stack.pop();drop--;save('pop',digit,before);frames.at(-1).removed=removed;frames.at(-1).index=index;}
  const before=stack.slice();stack.push(digit);processed=index+1;save('push',digit,before);frames.at(-1).index=index;
 });
 const before=stack.slice();stack.splice(take);drop=0;save('trim',null,before);
 return frames;
}
const pick=(nums,take)=>pickTrace(nums,take).at(-1).stack;
function mergeTrace(a,b){
 const frames=[{i:0,j:0,out:[],type:'start',left:a.slice(),right:b.slice()}],out=[];let i=0,j=0;
 while(i<a.length||j<b.length){
  const left=a.slice(i),right=b.slice(j);let common=0;while(common<Math.min(left.length,right.length)&&left[common]===right[common])common++;
  // Exact ties choose B, matching canonical Python's strict comparison.
  const source=cmp(left,right)>0?'A':'B',digit=source==='A'?a[i++]:b[j++];out.push(digit);
  frames.push({i,j,out:out.slice(),type:'emit',source,digit,left,right,common,comparison:Math.sign(cmp(left,right))});
 }
 return frames;
}
function splits(a,b,k){const out=[];for(let take=Math.max(0,k-b.length);take<=Math.min(k,a.length);take++){const left=pick(a,take),right=pick(b,k-take),candidate=mergeTrace(left,right).at(-1).out;out.push({take,left,right,candidate});}return out;}
const api={cmp,pick,pickTrace,mergeTrace,splits};if(typeof module==='object')module.exports=api;else root.MaxNumber=api;
})(typeof window==='object'?window:globalThis);
