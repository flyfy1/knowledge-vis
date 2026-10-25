'use strict';
(function(root){
const presets = [
 [[1,2],[0,0]],
 [[1,0,0,0],[0,0,0,0],[0,0,2,-1]],
 [[1,0,0,0],[0,0,0,0],[0,0,0,2]],
 [[0,1],[2,0]],
 [[1,2]],
 [[1,-1,2]]
];
function trace(input){
 const rows=input.length, cols=input[0].length, V=input.flat().filter(x=>x!==-1).length;
 const frames=[], path=[], seen=new Set(); let found=0; const routes=[];
 function snap(kind,at){frames.push({kind,at,path:[...path],remaining:V-path.length,found,routes:routes.map(p=>[...p])});}
 snap('ready',null);
 function dfs(v){
  seen.add(v);path.push(v);snap('enter',v);
  if(input[Math.floor(v/cols)][v%cols]===2){
   if(path.length===V){found++;routes.push([...path]);snap('accept',v);}else snap('early',v);
  }else{
   let children=0;
   for(const [dr,dc] of [[0,1],[1,0],[0,-1],[-1,0]]){
    const nr=Math.floor(v/cols)+dr,nc=v%cols+dc,nv=nr*cols+nc;
    if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&input[nr][nc]!==-1&&!seen.has(nv)){children++;dfs(nv);}
   }
   if(!children)snap('dead',v);
  }
  path.pop();seen.delete(v);snap('undo',v);
 }
 dfs(input.flat().indexOf(1));snap('done',null);return frames;
}
root.Paths980={presets,trace};
if(typeof module!=='undefined')module.exports=root.Paths980;
})(typeof window==='undefined'?globalThis:window);
