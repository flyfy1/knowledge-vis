'use strict';
const CalcIV = (() => {
 const presets=[
  {expression:'(a + 2) * (a - 1)',values:{}},
  {expression:'e + 8 - a + 5',values:{e:1}},
  {expression:'(e + 8) * (e - 8)',values:{}},
  {expression:'b * a + a * b - a * a * b',values:{}},
  {expression:'a - a',values:{}},
  {expression:'1 + 2 * 3',values:{}},
  {expression:'temperature * a - temperature * a + pressure',values:{temperature:-2,pressure:0}},
  {expression:'(a + b) * (a + b)',values:{a:2}}
 ];
 const encode=k=>JSON.stringify(k),entries=p=>[...p].map(([k,c])=>[JSON.parse(k),c]);
 function put(p,k,c){const key=encode(k),next=(p.get(key)||0)+c;if(next)p.set(key,next);else p.delete(key);}
 function sorted(p){return entries(p).sort((a,b)=>b[0].length-a[0].length||compare(a[0],b[0]));}
 function compare(a,b){for(let i=0;i<Math.min(a.length,b.length);i++){if(a[i]!==b[i])return a[i]<b[i]?-1:1;}return a.length-b.length;}
 function output(p){return sorted(p).map(([k,c])=>[c,...k].join('*'));}
 function trace({expression,values}){
  const tokens=expression.match(/[a-z]+|\d+|[()+*\-]/g),frames=[],calls=[];let pos=0;
  function emit(kind,start,result,left=new Map(),right=new Map(),pairs=[],operator=''){
   frames.push(JSON.parse(JSON.stringify({kind,start,end:pos,result:entries(result),left:entries(left),right:entries(right),pairs,operator,calls})));
  }
  emit('start',0,new Map());
  function atom(){const start=pos;calls.push({name:'atom',start});const token=tokens[pos++];let result=new Map();
   if(token==='('){result=expr();pos++;emit('group',start,result);}
   else {if(/^\d+$/.test(token))put(result,[],Number(token));else if(Object.hasOwn(values,token))put(result,[],values[token]);else put(result,[token],1);emit('atom',start,result);}
   calls.pop();return result;
  }
  function operation(left,right,operator,start){const result=new Map(),pairs=[];
   if(operator==='*')for(const [a,ca]of entries(left))for(const[b,cb]of entries(right)){const key=[...a,...b].sort();put(result,key,ca*cb);pairs.push({a,ca,b,cb,key,c:ca*cb});}
   else {for(const[k,c]of entries(left))put(result,k,c);for(const[k,c]of entries(right))put(result,k,(operator==='+'?1:-1)*c);}
   emit('operation',start,result,left,right,pairs,operator);return result;
  }
  function term(){const start=pos;calls.push({name:'term',start});let result=atom();while(tokens[pos]==='*'){pos++;const right=atom();result=operation(result,right,'*',start);}calls.pop();return result;}
  function expr(){const start=pos;calls.push({name:'expr',start});let result=term();while(tokens[pos]==='+'||tokens[pos]==='-'){const op=tokens[pos++],right=term();result=operation(result,right,op,start);}calls.pop();return result;}
  const result=expr();emit('done',0,result);return {tokens,frames,output:output(result)};
 }
 return {presets,trace,output,sorted,entries};
})();
if(typeof window!=='undefined')window.CalcIV=CalcIV;
if(typeof module!=='undefined')module.exports=CalcIV;
