'use strict';
(function(root){
const presets=['(let x 2 (add (let x 5 x) x))','(let x 2 (mult x (let x 3 y 4 (add x y))))','(let x 3 x 2 x)','(let x 1 y 2 x (add x y) (add x y))','-12','(let a1 -2 (mult a1 (add 3 4)))','(add 1 (mult 2 3))'];
function trace(expression){
 const tokens=expression.match(/\(|\)|[^ ()]+/g),env={},calls=[],frames=[];let i=0;
 const clone=x=>JSON.parse(JSON.stringify(x));
 function emit(kind,data={}){frames.push({kind,i,env:clone(env),calls:clone(calls),...data});}
 function evaluate(){
  const start=i,token=tokens[i++];
  if(token!=='('){const value=/^[a-z]/.test(token)?env[token].at(-1):Number(token);emit(/^[a-z]/.test(token)?'lookup':'literal',{token,value});return value;}
  const op=tokens[i++];calls.push({op,start});emit('enter',{op,start});
  let value;
  if(op!=='let'){const left=evaluate(),right=evaluate();value=op==='add'?left+right:left*right;i++;calls.pop();emit('combine',{op,left,right,value});return value;}
  const assigned=[];
  while(true){const token=tokens[i];if(!/^[a-z]/.test(token)||tokens[i+1]===')'){value=evaluate();break;}
   const name=tokens[i++],v=evaluate();(env[name]??=[]).push(v);assigned.push(name);emit('bind',{name,value:v});
  }
  i++;for(const name of assigned.reverse()){env[name].pop();if(!env[name].length)delete env[name];}
  calls.pop();emit('leave',{value});return value;
 }
 emit('initial');const value=evaluate();emit('done',{value});return {tokens,frames,value};
}
root.Lisp={presets,trace};
})(typeof window!=='undefined'?window:globalThis);
