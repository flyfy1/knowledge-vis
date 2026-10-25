'use strict';
(function(root){
  const rows=(ids,people)=>ids.map((id,i)=>({id,people:people[i],visit_date:`2026-01-${String(2*i+1).padStart(2,'0')}`}));
  const presets=[
    rows([4,5,6,7],[110,100,140,120]),
    [10,109,150,99,145,1455,199,188].map((people,i)=>({id:i+1,people,visit_date:`2017-01-${String(i===7?9:i+1).padStart(2,'0')}`})),
    rows([4,5,7],[110,100,140]),
    rows([4,5,6,7],[110,99,140,120]),
    rows([1,2,3,7,8,9],[100,100,100,100,100,100]),
    rows([1,2],[100,100]),
    rows([1,2,3],[99,0,50]),
    []
  ];
  function trace(input){
    const data=input.map(r=>({...r})).sort((a,b)=>a.id-b.id);
    const eligible=[...new Set(data.filter(r=>r.people>=100).map(r=>r.id))].sort((a,b)=>a-b);
    const ids=new Set(eligible),marked=new Set(),frames=[{marked:[],event:null}];
    eligible.forEach(s=>{
      const missing=[s+1,s+2].filter(x=>!ids.has(x));
      const before=[...marked].sort((a,b)=>a-b);
      if(!missing.length)[s,s+1,s+2].forEach(x=>marked.add(x));
      frames.push({marked:[...marked].sort((a,b)=>a-b),event:{s,missing,before,kind:missing.length?'miss':'hit'}});
    });
    return {rows:data,eligible,frames};
  }
  const api={presets,trace};root.StadiumLesson=api;
  if(typeof module==='object')module.exports=api;
})(typeof window==='object'?window:globalThis);
