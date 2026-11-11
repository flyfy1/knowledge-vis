'use strict';
(function(root){
 const presets=['&(t,!(f))','&(|(f))','|(f,f,f,t)','!(&(f,t))','t','f','!(!(!(t)))','&(t,t,t)','|(f,&(t,!(f)),f)'];
 function trace(expression){
  const stack=[],frames=[{i:-1,char:'',kind:'initial',before:[],after:[],reductions:[]}],reductions=[];
  for(let i=0;i<expression.length;i++){
   const char=expression[i],before=[...stack];let kind='push',detail=null;
   if(char===',')kind='comma';
   else if(char!==')')stack.push(char);
   else{
    kind='reduce';const values=[];
    while(stack[stack.length-1]!=='(')values.unshift(stack.pop());
    stack.pop();const operator=stack.pop();
    const hasTrue=values.includes('t'),hasFalse=values.includes('f');
    const result=operator==='!'?!hasTrue:operator==='&'?!hasFalse:hasTrue;
    const value=result?'t':'f';stack.push(value);
    detail={operator,values,value,hasTrue,hasFalse,index:i};reductions.push(detail);
   }
   frames.push({i,char,kind,before,after:[...stack],detail,reductions:reductions.map(r=>({...r,values:[...r.values]}))});
  }
  return frames;
 }
 const api={presets,trace};if(typeof module==='object'&&module.exports)module.exports=api;else root.BooleanLesson=api;
})(typeof window==='undefined'?globalThis:window);
