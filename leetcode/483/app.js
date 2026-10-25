'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
const presets=['13','31','4681','3','1000000000000000000','16'];
let model=Base483.trace(presets[0]),pos=0,choice=null,revealed=false,copyState='';
function elem(tag,text){const el=document.createElement(tag);el.textContent=text;return el;}
function render(){
 const f=model.frames[pos],last=model.frames.length-1,params={...f,N:model.N,digits:f.m+1};
 $('progress').textContent=t('progress',{i:pos,n:last,N:model.N});
 $('prev').disabled=pos===0;$('next').disabled=pos===last;$('reset').disabled=pos===0;$('end').disabled=pos===last;
 $('position').max=last;$('position').value=pos;
 const trial=!!f.terms;
 $('comparison').hidden=!trial;$('sequenceLabel').hidden=!trial;$('sequence').hidden=!trial;$('sumNote').hidden=!trial;$('after').hidden=!trial;
 $('event').textContent=t(f.kind==='start'&&f.m<2?'startSmall':f.kind,params);
 if(trial){
  $('comparison').textContent=t('comparison',params);$('sequenceLabel').textContent=t('sequence',params);
  $('sequence').replaceChildren(...f.terms.map((v,i)=>elem('span',(i?'→ ':'')+String(v))));
  $('sumNote').textContent=t(f.terms.length<f.m+1?'stopped':'complete');
  $('after').textContent=t(f.kind==='equal'?'matched':f.lo>f.hi?'exhausted':'after',params);
 }
 $('empty').hidden=!!f.history.length;
 $('ledger').replaceChildren(...f.history.map(r=>{const row=document.createElement('tr');[r.m,r.k,r.total,t(r.kind==='low'?'small':r.kind==='high'?'large':'hit')].forEach(v=>row.append(elem('td',String(v))));return row;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('explanation');
 $('copyStatus').textContent=copyState?t(copyState):'';
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('nav'));
 document.querySelector('.table-wrap').setAttribute('aria-label',t('history'));
}
$('prev').onclick=()=>{pos=Math.max(0,pos-1);render();};$('next').onclick=()=>{pos=Math.min(model.frames.length-1,pos+1);render();};$('reset').onclick=()=>{pos=0;render();};$('end').onclick=()=>{pos=model.frames.length-1;render();};$('position').oninput=()=>{pos=Number($('position').value);render();};
$('preset').onchange=()=>{model=Base483.trace(presets[Number($('preset').value)]);pos=0;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=Number(el.value);revealed=false;render();});
$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+e.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}},{rootMargin:'-20% 0px -60% 0px'});
document.querySelectorAll('section.step').forEach(e=>observer.observe(e));
locale.onChange(render);locale.init();
