'use strict';
// Teaching trace for #297. It runs Codec.deserialize from solution.py step for step:
// a stack of open child slots, one token per slot, right pushed before left.
window.Tree297={
 presets:[['1,2,#,#,3,4,#,#,5,#,#','p0'],['8,#,#','p1'],['#','p2'],['1,2,#,#,#','p3'],['-1,0,#,#,2,#,#','p4'],['1,2,3,4,5,#,#,#,#,#,#','p5']],
 trace(text){
  const tokens=text.split(',').map(s=>s.trim());
  const shape=[];            // preorder list of {value, depth}; '∅' marks an empty slot
  const frames=[];
  const label=s=>s.parent.value+(s.side==='left'?'.L':'.R');
  const snap=(cursor,pending,extra)=>frames.push(Object.assign({cursor,shape:shape.slice(),pending:pending.map(label).reverse()},extra));
  let valid=true,error='',root=null;
  if(!tokens.length||tokens[0]===''){return {tokens,frames:[{cursor:0,shape:[],pending:[],event:'start'}],root:null,valid:false,error:'empty'};}
  snap(0,[],{event:'start'});
  const first=tokens[0];
  if(first==='#'){
   shape.push({value:'∅',depth:0});
   snap(1,[],{event:'rootEmpty',token:'#'});
   if(tokens.length>1){valid=false;error='extra tokens';}
   return {tokens,frames,root:null,valid,error};
  }
  if(!/^-?\d+$/.test(first)){return {tokens,frames,root:null,valid:false,error:'bad token'};}
  root={value:first,left:null,right:null,depth:0};
  shape.push({value:first,depth:0});
  const pending=[{parent:root,side:'right'},{parent:root,side:'left'}];
  snap(1,pending,{event:'root',token:first});
  let cursor=1;
  for(;cursor<tokens.length;cursor++){
   if(!pending.length){valid=false;error='extra tokens';break;}
   const token=tokens[cursor],slot=pending.pop(),depth=slot.parent.depth+1;
   if(token==='#'){shape.push({value:'∅',depth,side:slot.side});snap(cursor+1,pending,{event:'empty',token,slot:label(slot)});continue;}
   if(!/^-?\d+$/.test(token)){valid=false;error='bad token';break;}
   const child={value:token,left:null,right:null,depth};
   slot.parent[slot.side]=child;
   shape.push({value:token,depth,side:slot.side});
   pending.push({parent:child,side:'right'},{parent:child,side:'left'});
   snap(cursor+1,pending,{event:'node',token,slot:label(slot)});
  }
  if(valid&&pending.length){valid=false;error='missing token';}
  return {tokens,frames,root,valid,error};
 }
};
