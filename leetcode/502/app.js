'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=IPOCore;
let hand='A',preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
function renderHand(){
 $('handRead').textContent=t('hand'+hand);
 for(const x of ['A','B'])$('choose'+x).setAttribute('aria-pressed',String(hand===x));
}
function renderTrace(){
 const f=frames[at],input=C.presets[preset],readyIds=new Set(f.heap.map(x=>x[1]));
 $('inputRead').textContent=t('inputRead',{k:input.k,w:input.w,c:input.c.join(', '),p:input.p.join(', ')});
 $('frameRead').textContent=t('frameRead',{at,max:frames.length-1,w:f.w,count:f.done.length,limit:Math.min(input.k,input.c.length),j:f.j,n:input.c.length});
 $('operationRead').textContent=t(f.kind+'Read',f);
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
 $('projectRows').replaceChildren(...f.order.map(([need,profit,id],pos)=>{
  const row=document.createElement('tr');
  [pos,'#'+id,need,profit,t(f.done.includes(id)?'used':readyIds.has(id)?'ready':'locked')].forEach(v=>{const td=document.createElement('td');td.textContent=v;row.append(td);});
  return row;
 }));
 $('heap').replaceChildren(...(f.heap.length?f.heap.map(([neg,id],h)=>{const el=document.createElement('div');el.className='heap-item';el.textContent=t('heapCell',{h,id,neg,p:-neg});return el;}):[document.createTextNode(t('emptyHeap'))]));
 $('emptyLedger').hidden=!!f.ledger.length;
 $('ledger').replaceChildren(...f.ledger.map(r=>{const li=document.createElement('li');li.textContent=t('ledgerRow',r);return li;}));
}
function renderPrediction(){
 $('reveal').disabled=selected===null;
 $('predictionFeedback').textContent=revealed?t(selected===13?'correct':'incorrect')+' '+t('answer'):t('await');
 $('predictionFeedback').classList.toggle('correct',revealed&&selected===13);
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
