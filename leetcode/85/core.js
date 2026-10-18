'use strict';
(function(root){
 const presets=[['101','111'],['10100','10111','11111','10010'],['111','111'],['000','000'],['1'],['0'],['1','0','1']];
 function trace(input){
  const matrix=input.map(r=>Array.from(r)),cols=matrix[0].length;
  let heights=Array(cols+1).fill(0),stack=[-1],best=0,ledger=[],frames=[];
  function save(kind,row,i,extra={}){frames.push(JSON.parse(JSON.stringify({kind,row,i,heights,stack,best,ledger,...extra})));}
  save('start',-1,-1);
  for(let row=0;row<matrix.length;row++){
   const old=heights.slice();
   for(let c=0;c<cols;c++)heights[c]=matrix[row][c]==='1'?heights[c]+1:0;
   stack=[-1];save('update',row,-1,{old});
   for(let i=0;i<=cols;i++){
    while(stack[stack.length-1]!==-1&&heights[stack[stack.length-1]]>heights[i]){
     const before=stack.slice(),j=stack.pop(),left=stack[stack.length-1],width=i-left-1,area=heights[j]*width;
     const rect={row,i,j,left,width,height:heights[j],area};ledger.push(rect);best=Math.max(best,area);
     save('pop',row,i,{before,rect});
    }
    stack.push(i);save('push',row,i);
   }
   save('rowDone',row,cols);
  }
  save('done',matrix.length-1,cols);
  return {matrix,cols,frames,result:best};
 }
 const api={trace,presets};root.Rectangle85=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
