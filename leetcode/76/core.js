'use strict';
(function(root){
 function trace(s,t){
  if(!/^[A-Za-z]{1,18}$/.test(s)||!/^[A-Za-z]{1,18}$/.test(t))throw new Error('invalid');
  const need={},have={};for(const c of t)need[c]=(need[c]||0)+1;
  for(const c in need)have[c]=0;
  let left=0,right=-1,missing=t.length,best=null;const frames=[];
  function save(type,c='',old=null){frames.push({type,c,old,left,right,missing,need:{...need},have:{...have},best:best?{...best}:null,window:s.slice(left,right+1)});}
  save('start');
  for(right=0;right<s.length;right++){
   const c=s[right],old=have[c]??0;
   if(c in need){if(have[c]<need[c])missing--;have[c]++;}
   save('expand',c,old);
   while(missing===0){
    if(!best||right-left+1<best.length)best={start:left,end:right,length:right-left+1,text:s.slice(left,right+1)};
    save('check');
    const c=s[left],old=have[c]??0;
    if(c in need){have[c]--;if(have[c]<need[c])missing++;}
    left++;save('remove',c,old);
   }
  }
  right=s.length-1;save('done');return {s,t,frames,result:best?best.text:''};
 }
 const api={trace};if(typeof module!=='undefined')module.exports=api;else root.Window76=api;
})(typeof window==='undefined'?globalThis:window);
