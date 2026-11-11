'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=window.FZFCore;
let x=24,preset=2,at=0,frames=C.trace(C.presets[2]),selection=null,revealed=false,copyState='';
function renderHand(){
 $('handX').value=x;$('handValue').textContent=`${x}!`;
 $('handRead').textContent=t('handRead',{x,z:C.zeros(x)});
 $('minus').disabled=x===0;$('plus').disabled=x===30;
 $('layers').replaceChildren(...[5,25].map(d=>{const li=document.createElement('li'),items=[];for(let a=d;a<=x;a+=d)items.push(a);li.textContent=t('layer',{d,items:items.length?items.join(', '):t('none'),n:items.length});return li;}));
}
function renderBlocks(){
 $('blocks').replaceChildren(...[0,5,20,25,30].map(a=>{const box=document.createElement('div');box.className='block';const b=document.createElement('b'),s=document.createElement('span');b.textContent=t('block',{a,b:a+4});s.textContent=t('blockOutput',{z:C.zeros(a)});box.append(b,s);return box;}));
}
function rowText(r){return t(r.z<r.target?'rowLow':'rowHigh',{...r,a:r.before[0],b:r.before[1]});}
function renderTrace(){
 const f=frames[at],k=C.presets[preset];
 $('frameRead').textContent=t('frame',{i:at,n:frames.length-1,phase:f.phase+1,k,target:f.target});
 $('loValue').textContent=f.lo;$('hiValue').textContent=f.hi;
 $('operation').textContent=f.row?rowText(f.row):t('start',f);
 $('boundary').textContent=f.lo===f.hi?t('boundaryDone',f):'';
 $('result').textContent=f.result!==undefined?t('result',{k,kp:k+1,right:f.lo,left:f.left,result:f.result}):f.left!==null?t('leftDone',{k,left:f.left}):t('waiting');
 $('prev').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
 document.querySelector('[data-i18n="empty"]').hidden=f.history.length>0;
 $('traceHistory').replaceChildren(...f.history.map(r=>{const li=document.createElement('li');li.textContent=`L(${r.target}) · `+rowText(r);return li;}));
}
function renderPrediction(){
 $('reveal').disabled=selection===null;
 const correct=selection===($('quiz').value==='29'?0:1);
 $('feedback').textContent=revealed?t(correct?'correct':'incorrect')+' '+t('answer'+$('quiz').value):t('await');
 $('feedback').classList.toggle('correct',revealed&&correct);
}
function resetPrediction(){selection=null;revealed=false;document.querySelectorAll('[name=prediction]').forEach(r=>r.checked=false);renderPrediction();}
function render(){renderHand();renderBlocks();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('minus').onclick=()=>{if(x>0)x--;renderHand();};$('plus').onclick=()=>{if(x<30)x++;renderHand();};
$('handX').oninput=e=>{x=Number(e.target.value);renderHand();};$('handReset').onclick=()=>{x=24;renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('prev').onclick=()=>{if(at>0)at--;renderTrace();};$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};
for(const r of document.querySelectorAll('[name=prediction]'))r.onchange=()=>{selection=Number(r.value);revealed=false;renderPrediction();};
$('quiz').onchange=resetPrediction;$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=resetPrediction;
$('preset').value=String(preset);
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{copyState='copying';$('copyStatus').textContent=t(copyState);try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav');let current=document.querySelector('.step');for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
