'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=BusCore;
let manual=[],preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
function el(tag,text,cls){const node=document.createElement(tag);node.textContent=text;if(cls)node.className=cls;return node;}
function reachable(){const reached=new Set([1]);manual.forEach(bus=>(bus===0?[1,7]:[7,6]).forEach(s=>reached.add(s)));return reached;}
function renderHand(){
 const reached=reachable();
 $('manualRead').textContent=t('manualRead',{n:manual.length,status:t(reached.has(6)?'arrived':'notArrived')});
 $('manualStops').replaceChildren(...[...reached].map(s=>el('span',String(s),'stop-chip')));
 $('manualHistory').textContent=t('manualHistory',{h:manual.length?manual.map(x=>x===0?'A':'B').join(' → '):t('none')});
 $('undo').disabled=!manual.length;$('boardA').disabled=manual.includes(0);$('boardB').disabled=manual.includes(1)||!reached.has(7);
}
function renderTrace(){
 const input=C.presets[preset],f=frames[at],used=new Map(f.used);
 $('inputRead').textContent=t('input',{r:JSON.stringify(input.routes),s:input.source,t:input.target});
 $('frameRead').textContent=t('frame',{i:at,n:frames.length-1,d:f.depth,count:f.dist.length,used:f.used.length,status:f.result===null?t('pending'):f.result===-1?t('exhausted'):t('found',{d:f.result})});
 $('routeRows').replaceChildren(...input.routes.map((stops,b)=>el('div',t(used.has(b)?'routeUsed':'routeUnused',{b,stops:stops.join(', '),d:used.get(b)}),'route-row'+(used.has(b)?' used':''))));
 $('stopRows').replaceChildren(...f.dist.map(([s,d])=>{const front=f.front.includes(s),goal=s===input.target;return el('span',t('chip',{s,d,flags:(front?t('frontFlag'):'')+(goal?t('targetFlag'):'')}),'stop-chip'+(front?' front':'')+(goal?' goal':''));}));
 $('events').replaceChildren(...f.events.map(x=>el('li',t('event',{...x,fresh:x.fresh.join(', ')}))));$('emptyEvents').hidden=!!f.events.length;
 $('ledger').replaceChildren(...f.history.map(x=>el('li',t('layer',x))));$('emptyLedger').hidden=!!f.history.length;
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
}
function renderPrediction(){
 $('reveal').disabled=selected===null;
 $('predictionFeedback').textContent=revealed?t(selected===2?'correct':'incorrect')+' '+t('answer'):t('await');
 $('predictionFeedback').classList.toggle('correct',revealed&&selected===2);
}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('boardA').onclick=()=>{manual.push(0);renderHand();};$('boardB').onclick=()=>{manual.push(1);renderHand();};$('undo').onclick=()=>{manual.pop();renderHand();};$('manualReset').onclick=()=>{manual=[];renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('tracePrev').onclick=()=>{if(at)at--;renderTrace();};$('traceNext').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};$('traceLast').onclick=()=>{at=frames.length-1;renderTrace();};
for(const radio of document.querySelectorAll('[name=prediction]'))radio.onchange=()=>{selected=Number(radio.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name=prediction]').forEach(x=>x.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceDetails').open=true;$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav'),sections=[...document.querySelectorAll('.step')];let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
