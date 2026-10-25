'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let s='DI',frames=DICore.trace(s),pos=0,prediction=null,revealed=false,copyState='';
function render(){
 const f=frames[pos];
 $('prev').disabled=pos===0;$('next').disabled=pos===frames.length-1;
 $('progress').textContent=t('progress',{s,pos,last:frames.length-1,i:f.i,n:s.length});
 let html='<caption>'+t('table')+'</caption><thead><tr><th scope="col">'+t('prefix')+'</th>';
 for(let j=0;j<=s.length;j++)html+='<th scope="col">'+j+'</th>';
 html+='</tr></thead><tbody>';
 for(let i=0;i<=s.length;i++){
  html+='<tr><th scope="row">'+(i===0?t('base'):s.slice(0,i))+'</th>';
  for(let j=0;j<=s.length;j++){
   const current=i===f.i&&j===f.j,source=i===f.i-1&&f.sources.includes(j);
   const value=j>i?'—':f.rows[i]?.[j]??'·';
   html+='<td class="'+(current?'current':source?'source':'')+'">'+(current?'→ ':source?'* ':'')+value+'</td>';
  }html+='</tr>';
 }
 $('counts').innerHTML=html+'</tbody>';
 $('sum').textContent=pos===0?t('initial'):t('sum',{ch:s[f.i-1],j:f.j,ks:f.sources.length?'{'+f.sources.join(', ')+'}':t('empty'),terms:f.terms.length?f.terms.join(' + '):'0',v:f.value});
 const done=f.j===f.i,all=pos===frames.length-1;
 $('answer').textContent=all?t('final',{v:f.rows[f.i].reduce((a,b)=>a+b,0)}):done&&pos>0?t('rowDone',{v:f.rows[f.i].reduce((a,b)=>a+b,0)}):pos===0?'':t('partial');
 $('reveal').disabled=prediction===null;
 $('feedback').hidden=!revealed;
 $('feedback').textContent=revealed?t(prediction===1?'correct':'incorrect')+' '+t('explanation'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('prev').onclick=()=>{if(pos>0){pos--;render();}};
$('next').onclick=()=>{if(pos<frames.length-1){pos++;render();}};
$('reset').onclick=()=>{pos=0;render();};
$('preset').onchange=()=>{s=$('preset').value;frames=DICore.trace(s);pos=0;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{prediction=Number(el.value);revealed=false;render();});
$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{
 try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
 catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}
 render();
};
function updateNav(){
 const sections=[...document.querySelectorAll('.step')];
 const edge=document.querySelector('.step-nav').getBoundingClientRect().height+80;
 const active=sections.filter(el=>el.getBoundingClientRect().top<=edge).at(-1)||sections[0];
 document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active.id));
}
window.addEventListener('scroll',updateNav,{passive:true});
window.addEventListener('resize',updateNav);
locale.onChange(render);locale.init();updateNav();
