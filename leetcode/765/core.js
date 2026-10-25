/* Local teaching simulation: snapshots, not execution of solution.py. */
(function (root) {
  'use strict';
  const presets = [[0,2,1,3],[3,2,0,1],[0,2,3,4,5,1],[0,2,3,4,5,6,7,1],[0,2,1,3,4,6,5,7]];
  function components(row) {
    const n = row.length / 2, adj = Array.from({length:n},()=>[]);
    for(let i=0;i<row.length;i+=2){const a=row[i]>>1,b=row[i+1]>>1;adj[a].push(b);adj[b].push(a);}
    const seen=new Set(), groups=[];
    for(let a=0;a<n;a++) if(!seen.has(a)) {
      const stack=[a],group=[];seen.add(a);
      while(stack.length){const u=stack.pop();group.push(u);for(const v of adj[u])if(!seen.has(v)){seen.add(v);stack.push(v);}}
      groups.push(group.sort((a,b)=>a-b));
    }
    return groups;
  }
  function trace(input) {
    const row=input.slice(),pos=[];row.forEach((x,i)=>pos[x]=i);
    let swaps=0;const frames=[];
    function save(done,op,before,i=-1,j=-1,partner=-1,displaced=-1){frames.push({row:row.slice(),pos:pos.slice(),swaps,done,op,before:before.slice(),i,j,partner,displaced,groups:components(row)});}
    save(0,'initial',row);
    for(let i=0;i<row.length;i+=2) {
      const before=row.slice(),partner=row[i]^1;
      if(row[i+1]===partner){save(i/2+1,'skip',before,i,-1,partner);continue;}
      const j=pos[partner],displaced=row[i+1];
      [row[i+1],row[j]]=[row[j],row[i+1]];
      pos[partner]=i+1;pos[displaced]=j;swaps++;
      save(i/2+1,'swap',before,i,j,partner,displaced);
    }
    return frames;
  }
  const api={presets,trace,components};
  if(typeof module!=='undefined')module.exports=api;else root.Couples=api;
})(typeof window==='undefined'?globalThis:window);
