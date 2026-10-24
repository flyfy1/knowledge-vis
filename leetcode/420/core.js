'use strict';
(function(root){
const presets=['aaaBBBBccccc'+'aB0'.repeat(4),'a','aA1','1337C0d3','a'.repeat(21),'!'.repeat(50),'aaaB1'];
function inspect(s){let runs=[];for(let i=0;i<s.length;){let j=i+1;while(j<s.length&&s[j]===s[i])j++;runs.push({char:s[i],original:j-i,length:j-i});i=j;}return {runs,missing:Number(!/[a-z]/.test(s))+Number(!/[A-Z]/.test(s))+Number(!/[0-9]/.test(s))};}
function trace(s){const {runs,missing}=inspect(s),n=s.length,D=Math.max(0,n-20);let left=D,spent=0,events=[],frames=[];
 const demand=()=>runs.reduce((v,r)=>v+Math.floor(r.length/3),0);
 const snap=()=>frames.push({runs:runs.map(r=>({...r})),missing,n,D,left,spent,R:demand(),events:events.map(e=>({...e}))});snap();
 while(left){let best=-1,cost=Infinity;runs.forEach((r,i)=>{if(r.length>=3&&r.length%3+1<cost){best=i;cost=r.length%3+1;}});
 if(best<0||cost>left){events.push({kind:'neutral',cost:left,before:demand(),after:demand()});spent+=left;left=0;snap();break;}
 const before=demand(),old=runs[best].length;runs[best].length-=cost;left-=cost;spent+=cost;events.push({kind:'save',cost,index:best+1,old,length:runs[best].length,before,after:demand()});snap();
 }
 const R=demand(),answer=n<6?Math.max(6-n,missing):D+Math.max(missing,R);
 return {frames,answer};
}
const api={presets,inspect,trace};root.PasswordCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
