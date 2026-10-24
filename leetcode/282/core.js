'use strict';
window.EXPR_CORE={
 evalExpr(s){const nums=[];let num='';let op='+';const flush=()=>{if(num==='')return;const x=Number(num);if(op==='+')nums.push(x);else if(op==='-')nums.push(-x);else nums[nums.length-1]*=x;num='';};for(const c of s){if(/[0-9]/.test(c))num+=c;else{flush();op=c;}}flush();return nums.reduce((a,b)=>a+b,0);},
 frames(){return [
  {text:'fStart',kind:'choose',value:1,last:1},
  {text:'fPlus',kind:'plus',value:1,last:0},
  {text:'fHit',kind:'hit',value:6,last:5},
  {text:'fMinus',kind:'minus',value:-4,last:-5},
  {text:'fMultiply',kind:'multiply',value:1,last:0},
  {text:'fPrune',kind:'prune',value:0,last:0},
  {text:'fTen',kind:'hit',value:5,last:-5}
 ];}
};
