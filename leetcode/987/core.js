(function (root) {
'use strict';
const presets = [
 [8,4,6,null,9,2],
 [3,9,20,null,null,15,7],
 [0],
 [5,5,5,null,5,5],
 [8,6,null,4,null,2]
];
function nodesFromLevel(a) {
 if (!a.length || a[0] == null) return [];
 const nodes=[{id:'root',value:a[0],row:0,col:0,left:null,right:null}], q=[0]; let i=1;
 while(q.length && i<a.length){const p=q.shift(), parent=nodes[p];
  for(const [side,letter,delta] of [['left','L',-1],['right','R',1]]) {
   const value=a[i++]; if(value==null)continue;
   const n={id:(parent.id==='root'?'':parent.id)+letter,value,row:parent.row+1,col:parent.col+delta,left:null,right:null};
   parent[side]=nodes.length;q.push(nodes.length);nodes.push(n);
  }
 }
 return nodes;
}
function trace(a){
 const nodes=nodesFromLevel(a),frames=[],records=[],seen=[];
 const save=(phase,current=null,output=null)=>frames.push({phase,current,records:records.map(r=>({...r})),seen:[...seen],output:output&&output.map(x=>[...x])});
 save('start');const stack=nodes.length?[0]:[];
 while(stack.length){const i=stack.pop(),n=nodes[i];records.push({id:n.id,col:n.col,row:n.row,value:n.value});seen.push(n.id);save('collect',n.id);if(n.right!==null)stack.push(n.right);if(n.left!==null)stack.push(n.left);}
 records.sort((a,b)=>a.col-b.col||a.row-b.row||a.value-b.value);save('sorted');
 const output=[];let col=null;for(const r of records){if(r.col!==col){output.push([]);col=r.col;}output[output.length-1].push(r.value);}save('grouped',null,output);
 return {nodes,frames};
}
const api={presets,nodesFromLevel,trace};if(typeof module!=='undefined')module.exports=api;else root.LessonCore=api;
})(typeof window!=='undefined'?window:globalThis);
