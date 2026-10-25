'use strict';
(function(root){
 const presets=[
  {board:'RRBBRR',hand:'B',moves:[['B',2]],result:1,reason:'why0'},
  {board:'G',hand:'GGGGG',moves:[['G',0],['G',0]],result:2,reason:'why1'},
  {board:'WWRRBBWW',hand:'WRBRW',moves:[['R',2],['B',2]],result:2,reason:'why2'},
  {board:'WRRBBW',hand:'RB',moves:[['R',1],['B',1]],result:-1,reason:'why3'}
 ];
 function removal(row){
  for(let i=0;i<row.length;){let j=i+1;while(j<row.length&&row[j]===row[i])j++;if(j-i>=3)return {row:row.slice(0,i)+row.slice(j),color:row[i],count:j-i,start:i};i=j;}return null;
 }
 function collapse(row){let next;while((next=removal(row)))row=next.row;return row;}
 function trace(p){
  let row=p.board,hand=[...p.hand].sort().join(''),used=0;
  const frames=[{before:row,row,hand,used,kind:'initial',stable:true}];
  for(const [color,gap] of p.moves){
   const k=hand.indexOf(color);if(k<0||gap<0||gap>row.length)throw Error('Invalid teaching move');
   hand=hand.slice(0,k)+hand.slice(k+1);used++;
   const before=row;row=row.slice(0,gap)+color+row.slice(gap);
   frames.push({before,row,hand,used,kind:'insert',color,gap,stable:!removal(row)});
   let next;while((next=removal(row))){const before=row;row=next.row;frames.push({before,row,hand,used,kind:'remove',color:next.color,count:next.count,stable:!removal(row)});}
  }
  return frames;
 }
 const api={presets,removal,collapse,trace};root.ZumaLesson=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
