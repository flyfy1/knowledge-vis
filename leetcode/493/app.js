'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=ReverseCore;
let base=0,pair=0,preset=2,at=0,frames=C.trace(C.presets[preset]),selected=null,revealed=false,copyState='';
const hand=C.pairs([4,2,1]);
function value(text,cls=''){const el=document.createElement('div');el.className='value '+cls;el.textContent=text;return el;}
function renderBase(){
 $('handValues').replaceChildren(...[4,2,1].map((x,i)=>value(`nums[${i}] = ${x}`)));
 $('baseRows').replaceChildren(...hand.slice(0,base).map(r=>{const tr=document.createElement('tr');[`(${r.i},${r.j})`,`(${r.x},${r.y})`,`${r.x} > ${2*r.y}`,t(r.yes?'yes':'no')].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});return tr;}));
 $('baseStatus').textContent=t('baseStatus',{n:base,count:hand.slice(0,base).filter(r=>r.yes).length});$('basePrev').disabled=base===0;$('baseNext').disabled=base===3;
}
function renderPair(){const x=[3,5,8][pair],right=[1,2,4],q=right.filter(y=>x>2*y).length;
 $('prefixValues').replaceChildren(...right.map((y,i)=>value(t('cell',{i,y,x,double:2*y,decision:t(i<q?'yes':'no')}),i<q?'valid':'')));
 $('pairRead').textContent=t('pairRead',{x,q});}
function renderTrace(){const f=frames[at];
 $('inputRead').textContent=t('inputRead',{nums:C.presets[preset].join(', ')});
 $('frameRead').textContent=t('frameRead',{n:at,max:frames.length-1,total:f.total});
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
 $('halves').hidden=!f.left;
 if(f.kind==='count'){
 $('operationRead').textContent=t('countRead',f);
 $('leftValues').replaceChildren(...f.left.map((x,i)=>value(`L[${i}]=${x}`,i===f.i?'active':'')));
 $('rightValues').replaceChildren(...f.right.map((y,i)=>value(t('cell',{i,y,x:f.x,double:2*y,decision:t(i<f.q?'yes':'no')}),i<f.q?'valid':'')));
 }else if(f.kind==='merge'){
 $('operationRead').textContent=t('mergeRead',{...f,merged:f.merged.join(', ')});$('leftValues').replaceChildren(...f.left.map(x=>value(x)));$('rightValues').replaceChildren(...f.right.map(x=>value(x)));
 }else $('operationRead').textContent=f.kind==='start'?t('startRead'):t('doneRead',{sorted:f.sorted.join(', ')});
 $('emptyLedger').hidden=f.ledger.length>0;
 $('countLedger').replaceChildren(...f.ledger.map(r=>{const li=document.createElement('li');li.textContent=t('ledgerRow',r);return li;}));
}
function renderPrediction(){
 $('reveal').disabled=selected===null;
 $('predictionFeedback').textContent=revealed?t(selected===4?'correct':'incorrect')+' '+t('answer'):t('await');
 $('predictionFeedback').classList.toggle('correct',revealed&&selected===4);
}
function render(){renderBase();renderPair();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('basePrev').onclick=()=>{if(base>0)base--;renderBase();};$('baseNext').onclick=()=>{if(base<3)base++;renderBase();};$('baseReset').onclick=()=>{base=0;renderBase();};
$('pairSelect').onchange=e=>{pair=Number(e.target.value);renderPair();};
$('preset').onchange=e=>{preset=Number(e.target.value);frames=C.trace(C.presets[preset]);at=0;renderTrace();};
$('tracePrev').onclick=()=>{if(at>0)at--;renderTrace();};$('traceNext').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};$('traceLast').onclick=()=>{at=frames.length-1;renderTrace();};
for(const input of document.querySelectorAll('[name="prediction"]'))input.onchange=()=>{selected=Number(input.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(x=>x.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';}catch(_){copyState='fallback';$('sourceDetails').open=true;$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();} $('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){
 const nav=document.querySelector('.step-nav'),sections=[...document.querySelectorAll('.step')];
 const edge=nav.getBoundingClientRect().bottom+40;
 let current=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<=edge)current=section;
 document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
