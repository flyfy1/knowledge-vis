'use strict';
(function(root){
 const presets = ['a{b,c}', '{a,b}{c,{d,e}}', '{{a,z},a{b,c},{ab,z}}', '{a,a}{b,c}', 'z', 'abc', '{{a,b},c}d'];
 function trace(expression){
  let i=0;const stack=[],frames=[];const sorted=s=>[...s].sort();
  function emit(event,detail={}){frames.push(JSON.parse(JSON.stringify({i,event,detail,stack:stack.map(c=>({start:c.start,union:sorted(c.union),term:sorted(c.term)}))})));}
  function parse(){
   const call={start:i,union:new Set(),term:new Set([''])};stack.push(call);emit('enter');
   while(i<expression.length&&expression[i]!=='}'){
    if(expression[i]===','){
     const before=sorted(call.union),term=sorted(call.term);call.term.forEach(x=>call.union.add(x));call.term=new Set(['']);i++;emit('comma',{before,term,after:sorted(call.union)});
    }else{
     let atom,kind;
     if(expression[i]==='{'){i++;emit('descend');atom=parse();i++;kind='group';}
     else{atom=new Set([expression[i++]]);kind='letter';}
     const before=sorted(call.term);call.term=new Set([...call.term].flatMap(a=>[...atom].map(b=>a+b)));
     emit('product',{before,atom:sorted(atom),after:sorted(call.term),kind});
    }
   }
   const result=new Set([...call.union,...call.term]);emit('return',{result:sorted(result)});stack.pop();return result;
  }
  const result=sorted(parse());emit('done',{result});return frames;
 }
 const api={presets,trace};if(typeof module!=='undefined')module.exports=api;else root.BraceLesson=api;
})(typeof window!=='undefined'?window:globalThis);
