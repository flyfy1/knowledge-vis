'use strict';
window.EXPR_CORE={
 evalExpr(s){const nums=[];let num='';let op='+';const flush=()=>{if(num==='')return;const x=Number(num);if(op==='+')nums.push(x);else if(op==='-')nums.push(-x);else nums[nums.length-1]*=x;num='';};for(const c of s){if(/[0-9]/.test(c))num+=c;else{flush();op=c;}}flush();return nums.reduce((a,b)=>a+b,0);},
 frames(){return [
 {text:'trace1',index:1,expression:'1',value:1,last:1,slice:'slice0',parent:'parentRoot'},
 {text:'trace2',index:2,expression:'1+0',value:1,last:0,slice:'slice1',parent:'parent1'},
 {text:'trace3',index:3,expression:'1+0+5',value:6,last:5,slice:'slice2',parent:'parent10'},
 {text:'trace4',index:2,expression:'1+0',value:1,last:0,slice:'next5',parent:'parent1'},
 {text:'trace5',index:3,expression:'1+0-5',value:-4,last:-5,slice:'slice2',parent:'parent10'},
 {text:'trace6',index:2,expression:'1+0',value:1,last:0,slice:'next5',parent:'parent1'},
 {text:'trace7',index:3,expression:'1+0*5',value:1,last:0,slice:'slice2',parent:'parent10'},
 {text:'trace8',index:1,expression:'1',value:1,last:1,slice:'bad05',parent:'parentRoot'},
 {text:'trace9',index:2,expression:'10',value:10,last:10,slice:'slice10',parent:'parentRoot'},
 {text:'trace10',index:3,expression:'10-5',value:5,last:-5,slice:'slice2',parent:'parentTen'}
 ];}
};
