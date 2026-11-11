'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t;
const $=id=>document.getElementById(id);
const presets=[[3,8],[3,19],[5,501],[100,100000000],[3,1],[2,200000000]];
let trace=LessonCore.trace(...presets[0]),step=0,selected=null,revealed=false,copyState='';
function render(){
 const hand={7:['3+3+3/3',3],8:['3*3−3/3',3],9:['3*3',1]}[$('hand').value];
 $('handResult').textContent=t('handOut',{expression:hand[0],count:hand[1],target:$('hand').value});
 $('progress').textContent=t('progress',{x:trace.x,target:trace.target,done:step,total:trace.rows.length});
 $('prev').disabled=step===0;$('next').disabled=step===trace.rows.length;$('end').disabled=step===trace.rows.length;
 $('ledger').replaceChildren();
 if(!step){const p=document.createElement('p');p.textContent=t('empty');$('ledger').append(p);}
 for(const row of trace.rows.slice(0,step)){
  const li=document.createElement('li'),h=document.createElement('h3'),p=document.createElement('p'),m=document.createElement('p');
  h.textContent=t('rowTitle',row);
  p.textContent=row.k===0?t('rowBase',{...row,x:trace.x}):t('rowCalc',{...row,a:row.pc[0],b:row.pc[1],c:row.nc[0],d:row.nc[1]});
  m.textContent=t('rowMeaning',{...row,complement:row.power*trace.x-row.S});
  li.append(h,p,m);$('ledger').append(li);
 }
 $('result').textContent=step===trace.rows.length?t('final',{D:step,p:trace.finalP,n:trace.rows.at(-1).n,carry:trace.finalN,answer:trace.answer}):t('pending');
 $('reveal').disabled=selected===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t(selected===1?'correct':'wrong')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';
 document.querySelector('.step-nav').setAttribute('aria-label',t('navLabel'));
 $('langToggle').setAttribute('aria-label',t('langLabel'));
}
$('hand').addEventListener('change',render);
$('preset').addEventListener('change',()=>{trace=LessonCore.trace(...presets[Number($('preset').value)]);step=0;render();});
$('next').onclick=()=>{step=Math.min(step+1,trace.rows.length);render();};
$('prev').onclick=()=>{step=Math.max(0,step-1);render();};
$('reset').onclick=()=>{step=0;render();};$('end').onclick=()=>{step=trace.rows.length;render();};
document.querySelectorAll('[name=prediction]').forEach(input=>input.addEventListener('change',()=>{selected=Number(input.value);revealed=false;render();}));
$('reveal').onclick=()=>{revealed=true;render();};
$('code').textContent=window.PYTHON_SOURCE;
$('fallbackSource').value=window.PYTHON_SOURCE;
const downloadURL=URL.createObjectURL(new Blob([window.PYTHON_SOURCE],{type:'text/x-python;charset=utf-8'}));$('download').href=downloadURL;
$('copy').onclick=async()=>{
 try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';}
 catch(_){$('sourceDetails').open=true;$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();copyState='fallback';}
 render();
};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));},{rootMargin:'-10% 0px -65% 0px'});
document.querySelectorAll('.step').forEach(section=>observer.observe(section));
