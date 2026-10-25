'use strict';
(function(root){
  function palindromes(s){
    const found=new Set();
    for(let mask=1;mask<2**s.length;mask++){
      let x='';for(let k=0;k<s.length;k++)if(mask&(1<<k))x+=s[k];
      if(x===[...x].reverse().join(''))found.add(x);
    }
    return [...found].sort((a,b)=>a.length-b.length||a.localeCompare(b));
  }
  function trace(s){
    if(!/^[abcd]{1,6}$/.test(s))throw new Error('Teaching input must be 1–6 letters a–d');
    const n=s.length,dp=Array.from({length:n},()=>Array(n).fill(null));
    const frames=[{i:null,j:null,groups:[],value:null,dp:dp.map(r=>r.slice())}];
    for(let length=1;length<=n;length++)for(let i=0;i+length<=n;i++){
      const j=i+length-1,groups=[];let value=0;
      for(const c of 'abcd'){
        const L=s.indexOf(c,i),R=s.lastIndexOf(c,j);
        let count=0,inner=0;
        if(L!==-1&&L<=j&&R>=i){if(L===R)count=1;else{inner=L+1<=R-1?dp[L+1][R-1]:0;count=2+inner;}}
        groups.push({c,L:L!==-1&&L<=j?L:null,R:R>=i?R:null,inner,count});value+=count;
      }
      dp[i][j]=value;frames.push({i,j,groups,value,dp:dp.map(r=>r.slice())});
    }
    return frames;
  }
  const api={trace,palindromes,presets:['bccb','bcb','a','abcd','aaaa','abccba']};
  if(typeof module!=='undefined')module.exports=api;else root.PalindromeLesson=api;
})(typeof window==='undefined'?globalThis:window);
