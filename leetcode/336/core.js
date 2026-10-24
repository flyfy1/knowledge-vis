'use strict';
(function(root){
  const presets=[['lls','s'],['abcd','dcba','lls','s','sssll'],['bat','tab','cat'],['a',''],['abc'],['a','aa','aaa','']];
  const palindrome=s=>s===[...s].reverse().join('');
  // Teaching simulator uses direct palindrome checks; Python uses linear radii.
  function build(words){
    const nodes=[{child:{},end:-1,pal:[],path:''}];
    words.forEach((w,j)=>{
      let id=0;
      for(let k=w.length-1;k>=0;k--){
        if(palindrome(w.slice(0,k+1)))nodes[id].pal.push(j);
        const c=w[k];
        if(nodes[id].child[c]===undefined){nodes[id].child[c]=nodes.length;nodes.push({child:{},end:-1,pal:[],path:nodes[id].path+c});}
        id=nodes[id].child[c];
      }
      nodes[id].end=j;nodes[id].pal.push(j);
    });return nodes;
  }
  function trace(words){
    const nodes=build(words),frames=[],pairs=[];
    function save(kind,i,k,id,extra={}){frames.push({kind,i,k,id,path:id<0?'':nodes[id].path,end:id<0?-1:nodes[id].end,pal:id<0?[]:[...nodes[id].pal],pairs:pairs.map(p=>[...p]),...extra});}
    save('initial',-1,0,0);
    words.forEach((w,i)=>{
      let id=0;save('start',i,0,id);
      for(let k=0;k<w.length;k++){
        const node=nodes[id],suffix=w.slice(k),ok=palindrome(suffix),j=node.end;
        if(j!==-1&&j!==i&&ok)pairs.push([i,j]);
        save('check',i,k,id,{suffix,ok,emitted:j!==-1&&j!==i&&ok?[[i,j]]:[]});
        const next=node.child[w[k]];
        if(next===undefined){save('miss',i,k,id,{char:w[k]});id=-1;break;}
        id=next;save('edge',i,k+1,id,{char:w[k]});
      }
      if(id!==-1){const emitted=nodes[id].pal.filter(j=>j!==i).map(j=>[i,j]);pairs.push(...emitted);save('finish',i,w.length,id,{emitted});}
    });save('done',-1,0,0);return frames;
  }
  const api={presets,palindrome,build,trace};root.PairLesson=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
