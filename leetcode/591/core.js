'use strict';
(function(root){
 const presets=[
  '<A><B>x</B></A>',
  '<A><B></A></B>',
  '<A><![CDATA[</B><x>]]></A>',
  '<A></A><B></B>',
  '<A><![CDATA[x</A>',
  '<ABCDEFGHIJ></ABCDEFGHIJ>',
  '<A>></A>',
  '<A>',
  '<A></A>',
  '<![CDATA[x]]>'
 ];
 function trace(code){
  let i=0,stack=[],frames=[{a:0,b:0,i:0,before:[],stack:[],kind:'initial',token:'',result:null}],result=null;
  const save=(a,b,kind,extra={})=>frames.push({a,b,i,before:frames.at(-1).stack.slice(),stack:stack.slice(),kind,token:code.slice(a,b),result,...extra});
  const fail=(a,b,kind,extra)=>{result=false;save(a,b,kind,extra);};
  while(i<code.length){
   const a=i;
   if(i>0&&!stack.length){fail(a,code.length,'outside');break;}
   if(code.startsWith('<![CDATA[',i)){
    if(!stack.length){fail(a,code.length,'cdataOutside');break;}
    const j=code.indexOf(']]>',i+9);
    if(j<0){fail(a,code.length,'cdataMissing');break;}
    i=j+3;save(a,i,'cdata');
   }else if(code[i]==='<'){
    const close=code.startsWith('</',i),start=i+(close?2:1),j=code.indexOf('>',start);
    if(j<0){fail(a,code.length,'angleMissing');break;}
    const name=code.slice(start,j);
    if(!/^[A-Z]{1,9}$/.test(name)){fail(a,j+1,'name');break;}
    if(close){
     if(!stack.length||stack.at(-1)!==name){fail(a,j+1,'mismatch',{name,expected:stack.at(-1)||'∅'});break;}
     stack.pop();
    }else stack.push(name);
    i=j+1;save(a,i,close?'close':'open',{name});
   }else{
    if(!stack.length){fail(a,code.length,'outside');break;}
    // Group ordinary text only; Python advances one character at a time.
    while(i<code.length&&code[i]!=='<')i++;
    save(a,i,'text');
   }
  }
  if(result===null){result=code.length>0&&!stack.length;save(i,i,result?'accept':'unfinished');}
  return frames;
 }
 const api={presets,trace};root.TagValidator=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
