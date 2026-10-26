'use strict';
(function(root){
  function build(s){
    const n=s.length; let rank=Array.from(s,c=>c.charCodeAt(0)-97), sa=Array.from({length:n},(_,i)=>i),k=1;
    const rounds=[{k:0,sa:sa.slice(),rank:rank.slice(),pairs:null}];
    while(k<n){
      const pairs=rank.map((v,i)=>[v,i+k<n?rank[i+k]:-1]);
      const cmp=(a,b)=>pairs[a][0]-pairs[b][0]||pairs[a][1]-pairs[b][1];
      sa.sort(cmp); const next=Array(n).fill(0);
      for(let p=1;p<n;p++)next[sa[p]]=next[sa[p-1]]+(cmp(sa[p],sa[p-1])!==0?1:0);
      rank=next;rounds.push({k,sa:sa.slice(),rank:rank.slice(),pairs});
      if(rank[sa[n-1]]===n-1)break;k*=2;
    }
    const inverse=Array(n);sa.forEach((i,p)=>inverse[i]=p);
    let h=0,bestLen=0,bestStart=0;const scan=[{rows:[],bestLen,bestStart,carry:0}];const rows=[];
    for(let i=0;i<n;i++){
      const p=inverse[i],j=p?sa[p-1]:null, before=h;
      if(p===0)h=0;
      else while(i+h<n&&j+h<n&&s[i+h]===s[j+h])h++;
      const lcp=h;
      if(h>bestLen){bestLen=h;bestStart=i;}
      const extra=p?h-before:0;h=Math.max(0,h-1);
      rows.push({i,p,j,before,extra,lcp,carry:h});
      scan.push({rows:rows.map(r=>({...r})),bestLen,bestStart,carry:h});
    }
    return {s,rounds,scan,sa:sa.slice(),answer:s.slice(bestStart,bestStart+bestLen)};
  }
  const api={build};if(typeof module!=='undefined')module.exports=api;else root.DupCore=api;
})(typeof window!=='undefined'?window:globalThis);
