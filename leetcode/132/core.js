(function(root){
  'use strict';
  const presets = ['aab','aaba','abba','abc','a','aaaa','abacdc'];
  function trace(s) {
    const n=s.length;
    if(n<1 || n>6 || !/^[a-z]+$/.test(s)) throw new Error('Teaching input must contain 1–6 lowercase letters');
    const p=Array.from({length:n},()=>Array(n).fill(null));
    const dp=[0,...Array(n).fill(null)], frames=[]; const log=[];
    const save=e=>frames.push(JSON.parse(JSON.stringify({s,p,dp,log,...e})));
    save({r:null,l:null,done:0});
    for(let r=0;r<n;r++) {
      dp[r+1]=n+1;
      for(let l=0;l<=r;l++) {
        const equal=s[l]===s[r], short=r-l<2;
        const inner=short?null:p[l+1][r-1];
        p[l][r]=equal && (short || inner===true);
        const old=dp[r+1], candidate=p[l][r]?dp[l]+1:null;
        if(candidate!==null) dp[r+1]=Math.min(old,candidate);
        const e={r,l,equal,short,inner,old,candidate,after:dp[r+1],done:l===r?r+1:r};
        log.push({...e});save(e);
      }
    }
    return frames;
  }
  const api={presets,trace};root.PalindromeLesson=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
