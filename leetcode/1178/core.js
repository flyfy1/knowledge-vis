window.ValidWordsCore = (() => {
  const presets = [
    {words:['aaaa','asas','able','ability','actt','actor','access'], puzzle:'aboveyz'},
    {words:['apple','pleas','please'], puzzle:'aelpsxy'},
    {words:['aax','abx','bxx','ay'], puzzle:'abxyqrs'}
  ];
  const bit = c => 1 << (c.charCodeAt(0)-97);
  const mask = s => [...new Set(s)].reduce((m,c)=>m|bit(c),0);
  function trace(input){
    const freq={}; input.words.forEach(w=>{const m=mask(w);freq[m]=(freq[m]||0)+1;});
    const pMask=mask(input.puzzle), first=bit(input.puzzle[0]), rows=[]; let sub=pMask,total=0;
    while(sub){const contribution=(sub&first)?(freq[sub]||0):0; if(contribution) total+=contribution; rows.push({mask:sub,letters:[...input.puzzle].filter(c=>sub&bit(c)).join(''),contribution,running:total}); sub=(sub-1)&pMask;}
    return {freq,rows,total,distinct:input.words.map(mask),pMask,first};
  }
  return {presets,mask,trace};
})();
