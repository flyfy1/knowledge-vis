'use strict';
(function(root){
  const presets=['abac','abab','aacecaaa','abcd','','a','aaaa','abb'];
  function trace(s){
    if(!/^[a-z]{0,8}$/.test(s))throw new RangeError('教学输入：0..8 个小写字母 / Teaching input: 0..8 lowercase letters');
    const t=s+'#'+[...s].reverse().join(''),pi=Array(t.length).fill(null),frames=[],log=[];
    pi[0]=0;
    function save(i,before,after,kind){
      if(kind!=='initial')log.push({i,before,after,kind,left:t[i],right:t[before]});
      frames.push({s,t,i,before,after,kind,pi:pi.slice(),log:log.map(e=>({...e}))});
    }
    save(0,0,0,'initial');
    for(let i=1;i<t.length;i++){
      let j=pi[i-1];
      while(j>0&&t[i]!==t[j]){
        const old=j;j=pi[j-1];save(i,old,j,'fallback');
      }
      const old=j,match=t[i]===t[j];
      if(match)j++;
      pi[i]=j;save(i,old,j,match?'match':'zero');
    }
    return frames;
  }
  const api={presets,trace};
  if(typeof module!=='undefined')module.exports=api;
  else root.PalindromeLesson=api;
})(typeof window!=='undefined'?window:globalThis);
