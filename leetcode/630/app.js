'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=CourseCore;
let hand='A',preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
function renderHand(){
 $('handRead').textContent=t('hand'+hand);
 for(const x of ['A','B'])$('choose'+x).setAttribute('aria-pressed',String(hand===x));
}
function renderTrace(){
 const f=frames[at],input=C.presets[preset],retained=new Set(f.kept);
 $('inputRead').textContent=JSON.stringify(input);
 $('frameRead').textContent=t('frame',{k:f.k,n:input.length,count:f.kept.length,total:f.total});
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
 $('courses').replaceChildren(...f.order.map((c,pos)=>{
  const el=document.createElement('div');el.className='course'+(retained.has(c.id)?' kept':'')+(pos===f.k-1?' current':'');
  const title=document.createElement('b');title.textContent=t('course',c);
  const status=document.createElement('span');status.textContent=(pos===f.k-1?t('justProcessed')+' · ':'')+t(pos>=f.k?'pending':retained.has(c.id)?'kept':'rejected');el.append(title,status);return el;
 }));
 let finish=0;
 $('schedule').replaceChildren(...(f.kept.length?f.order.filter(c=>retained.has(c.id)).map(c=>{finish+=c.d;const el=document.createElement('span');el.textContent=t('finish',{...c,finish});return el;}):[document.createTextNode(t('empty'))]));
 $('emptyLedger').hidden=!!f.ledger.length;
 $('ledger').replaceChildren(...f.ledger.map(r=>{const li=document.createElement('li');const action=r.removed===null?t('keepAction'):t('removeAction',{id:r.removed,d:input[r.removed][0]});li.textContent=t('row',{...r,action});return li;}));
}
function renderPrediction(){
 $('reveal').disabled=selected===null;
 $('predictionFeedback').textContent=revealed?t(selected===3?'correct':'incorrect')+' '+t('answer'):t('await');
 $('predictionFeedback').classList.toggle('correct',revealed&&selected===3);
}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
for(const x of ['A','B'])$('choose'+x).onclick=()=>{hand=x;renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('tracePrev').onclick=()=>{if(at>0)at--;renderTrace();};$('traceNext').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};$('traceLast').onclick=()=>{at=frames.length-1;renderTrace();};
for(const radio of document.querySelectorAll('[name="prediction"]'))radio.onchange=()=>{selected=Number(radio.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};
$('predictionReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(x=>x.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';}catch(_){copyState='fallback';$('sourceDetails').open=true;$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav'),sections=[...document.querySelectorAll('.step')];let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
