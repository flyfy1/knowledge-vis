'use strict';
(function(root){
 function trace(s){
  let digit=false,dot=false,exp=false,dead=false;
  const frames=[{i:0,digit,dot,exp,dead,kind:'start',char:'',done:s.length===0}];
  for(let i=0;i<s.length;i++){
   const ch=s[i];let kind;
   if(ch>='0'&&ch<='9'){digit=true;kind='digit';}
   else if(ch==='+'||ch==='-'){
    if(i!==0&&!('eE'.includes(s[i-1]))){dead=true;kind='badSign';}else kind='sign';
   }else if(ch==='.'){
    if(dot||exp){dead=true;kind='badDot';}else{dot=true;kind='dot';}
   }else if(ch==='e'||ch==='E'){
    if(exp||!digit){dead=true;kind='badExp';}else{exp=true;digit=false;kind='exp';}
   }else{dead=true;kind='badChar';}
   frames.push({i:i+1,digit,dot,exp,dead,kind,char:ch,done:dead||i===s.length-1});
   if(dead)break;
  }
  return frames;
 }
 const api={trace};if(typeof module!=='undefined')module.exports=api;else root.NumberLesson=api;
})(typeof window==='undefined'?globalThis:window);
