(function(root){
'use strict';
function trace(s){
 let total=0,sign=1,stack=[],frames=[];
 const save=(kind,start,end,number=null,before=null)=>frames.push({kind,start,end,number,before,total,sign,stack:stack.map(p=>p.slice())});
 save('start',-1,-1);
 for(let i=0;i<s.length;i++){
  const c=s[i]; if(c===' ')continue;
  const before={total,sign,stack:stack.map(p=>p.slice())};let start=i;
  if(/\d/.test(c)){let number=0;while(i<s.length&&/\d/.test(s[i])){number=number*10+Number(s[i]);i++;}i--;total+=sign*number;save('number',start,i,number,before);}
  else{if(c==='+')sign=1;else if(c==='-')sign=-1;else if(c==='('){stack.push([total,sign]);total=0;sign=1;}else if(c===')'){const [a,b]=stack.pop();total=a+b*total;}save(c,start,i,null,before);}
 }
 return {s,frames,result:total};
}
const api={trace,presets:['8-(3-1)','-(2+3)','12 - (4 + 5)','(1+(4+5+2)-3)+(6+8)','1-(-2)','0',' 2-1 + 2 ','1 + 1']};
if(typeof module!=='undefined')module.exports=api;else root.Calculator224=api;
})(typeof window!=='undefined'?window:globalThis);
