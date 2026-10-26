'use strict';
(function(root){
 const presets=['8-3--6-5','1-2--3--4-5--6--7','1-2--3---4-5--6---7','1-401--349---90--88','1000000000','2-2--2---2','8-3--6---2-5','9-4--1--4-4'];
 function trace(input){
  let i=0,path=[],nodes=[],history=[],token=null;
  const frames=[];
  function save(phase,popped=null){frames.push(JSON.parse(JSON.stringify({phase,i,path,nodes,token,popped,history})));}
  save('initial');
  while(i<input.length){
   const start=i;let depth=0,value=0;
   while(input[i]==='-'){depth++;i++;}
   while(i<input.length && input[i]>='0' && input[i]<='9'){value=value*10+Number(input[i++]);}
   token={id:nodes.length,depth,value,start,end:i};history.push({phase:'parse',id:token.id,depth,value});save('parse');
   while(path.length>depth){const popped=path.pop();history.push({phase:'pop',id:popped});save('pop',popped);}
   const parent=path.length?path[path.length-1]:null;
   const side=parent===null?'root':nodes[parent].left===null?'left':'right';
   const node={id:token.id,value,depth,parent,side,left:null,right:null};
   if(parent!==null)nodes[parent][side]=node.id;
   nodes.push(node);path.push(node.id);history.push({phase:'attach',id:node.id,parent,side});save('attach');
  }
  return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;root.LessonCore=api;
})(typeof window==='undefined'?globalThis:window);
