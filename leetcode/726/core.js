(function(root){
'use strict';
const presets=['Mg(OH)2','H2O','K4(ON(SO3)2)2','He','(H2O)2(OH)3','Be12H2','((H)2O)3H'];
const format=m=>Object.keys(m).sort().map(a=>a+(m[a]===1?'':m[a])).join('');
function trace(formula){
 let i=0,stack=[{}],frames=[];
 const save=(kind,extra={})=>frames.push({i,stack:structuredClone(stack),kind,...extra});
 const count=()=>{let start=i;while(i<formula.length&&/[0-9]/.test(formula[i]))i++;return start===i?1:Number(formula.slice(start,i));};
 save('initial');
 while(i<formula.length){
  const start=i, before=structuredClone(stack);
  if(formula[i]==='('){i++;stack.push({});save('open',{start,before});}
  else if(formula[i]===')'){
   i++;let multiplier=count(),child=stack.pop(),parent=stack.at(-1),terms=[];
   for(const [a,c] of Object.entries(child)){const old=parent[a]||0;parent[a]=old+c*multiplier;terms.push(`${a}: ${old} + ${c} × ${multiplier} = ${parent[a]}`);}
   save('merge',{start,before,multiplier,terms});
  }else{
   i++;while(i<formula.length&&/[a-z]/.test(formula[i]))i++;
   let atom=formula.slice(start,i),c=count(),parent=stack.at(-1),old=parent[atom]||0;parent[atom]=old+c;
   save('atom',{start,before,atom,count:c,old,value:parent[atom]});
  }
 }
 save('done',{result:format(stack[0]),before:structuredClone(stack)});return frames;
}
const api={presets,trace,format};if(typeof module!=='undefined')module.exports=api;else root.Atoms=api;
})(typeof window==='undefined'?globalThis:window);
