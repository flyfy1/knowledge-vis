'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=RangeCore;
let hand='A',preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
function renderHand(){
 $('handRead').textContent=t('hand'+hand);
 for(const x of ['A','B'])$('choose'+x).setAttribute('aria-pressed',String(hand===x));
}
function renderTrace(){
 const f=frames[at];
 $('inputRead').textContent=JSON.stringify(C.presets[preset]);
 $('frameRead').textContent=t('frame',{n:at+1,total:frames.length});
 $('tracePrev').disabled=at===0;$('traceNext').disabled=f.done;$('traceLast').disabled=f.done;
 $('transitionRead').textContent=f.previous?t('transition',{...f.previous,r:f.previous.row+1}):t('initial');
 $('rows').replaceChildren(...C.presets[preset].map((row,r)=>{
  const el=document.createElement('div');el.className='list-row';
  const label=document.createElement('span');label.className='list-label';label.textContent=t('row',{r:r+1});
  const cells=document.createElement('div');cells.className='cells';
  row.forEach((v,j)=>{const c=document.createElement('span');c.className='cell'+(j===f.p[r]?' selected':'');c.textContent=v+(j===f.p[r]?' · '+t('selected'):'');cells.append(c);});el.append(label,cells);return el;
 }));
 $('candidateRead').textContent=t('candidate',{lo:f.lo,hi:f.hi,w:f.hi-f.lo});
 $('bestRead').textContent=t('best',{lo:f.best[0],hi:f.best[1],w:f.best[1]-f.best[0]});
 $('actionRead').textContent=t(f.done?'stopped':'continue',{x:f.lo,r:f.row+1});
 $('ledger').replaceChildren(...f.ledger.map(r=>{const el=document.createElement('li');el.textContent=t('ledgerRow',{...r,w:r.hi-r.lo,a:r.best[0],b:r.best[1]});return el;}));
}
function renderPrediction(){
 $('reveal').disabled=selected===null;
 $('predictionFeedback').textContent=revealed?t(selected===1?'correct':'incorrect')+' '+t('answer'):t('await');
 $('predictionFeedback').classList.toggle('correct',revealed&&selected===1);
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
