'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=SimilarCore;
let hand=['abc'],preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
function el(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function renderHand(){const n=hand.length-1;$('manualRead').textContent=t('manualRead',{n,s:hand[n]});$('manualHistory').replaceChildren(...hand.map(s=>el('li',s)));$('swapA').disabled=n!==0;$('swapB').disabled=n!==1;$('undo').disabled=n===0;}
function renderTrace(){
 const [a,b]=C.presets[preset],f=frames[at];$('inputRead').textContent=t('input',{a,b});
 $('frameRead').textContent=t('frame',{at,max:frames.length-1,d:f.depth,seen:f.seen,status:f.result===null?t('pending'):t('found',{d:f.result})});
 $('frontier').replaceChildren(...f.front.map(s=>el('span',s+(s===b?' ✓':''),'state-string'+(s===b?' target':''))));
 $('events').replaceChildren(...f.events.map(x=>{const e=el('div','','event');e.append(el('p',t('event',{...x,js:x.candidates.join(', ')})));const list=el('ul','');list.append(...x.children.map(c=>el('li',t('child',{i:x.i,...c,status:t(c.fresh?'fresh':'duplicate')}))));e.append(list);return e;}));$('emptyEvents').hidden=f.events.length>0;
 $('ledger').replaceChildren(...f.history.map(x=>el('li',t('layer',{d:x.depth,s:x.front.join(', ')}))));$('emptyHistory').hidden=f.history.length>0;
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
}
function renderPrediction(){$('reveal').disabled=selected===null;$('predictionFeedback').textContent=revealed?t(selected===1?'correct':'incorrect')+' '+t('answer'):t('await');$('predictionFeedback').classList.toggle('correct',revealed&&selected===1);}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('swapA').onclick=()=>{hand.push('bac');renderHand();};$('swapB').onclick=()=>{hand.push('bca');renderHand();};$('undo').onclick=()=>{hand.pop();renderHand();};$('manualReset').onclick=()=>{hand=['abc'];renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('tracePrev').onclick=()=>{if(at)at--;renderTrace();};$('traceNext').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};$('traceLast').onclick=()=>{at=frames.length-1;renderTrace();};
for(const radio of document.querySelectorAll('[name=prediction]'))radio.onchange=()=>{selected=Number(radio.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name=prediction]').forEach(x=>x.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceDetails').open=true;$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav'),sections=[...document.querySelectorAll('.step')];let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
