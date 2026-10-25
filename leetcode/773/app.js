'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=PuzzleCore;
let manual=['123405'],preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
function board(s,interactive=false){
 const el=document.createElement('div');el.className='board';el.setAttribute('role','group');if(!interactive)el.tabIndex=0;el.setAttribute('aria-label',t('boardLabel',{s}));
 const legal=C.neighbors[s.indexOf('0')];
 s.split('').forEach((v,i)=>{const cell=document.createElement(interactive?'button':'span');cell.className='tile'+(v==='0'?' blank':'');cell.textContent=v;
 if(interactive){cell.type='button';cell.dataset.step='0';cell.disabled=!legal.includes(i);cell.setAttribute('aria-label',v==='0'?t('blank'):t('tile',{r:Math.floor(i/3)+1,c:i%3+1,v,action:t(legal.includes(i)?'legal':'illegal')}));cell.onclick=()=>{const zero=s.indexOf('0');manual.push(C.swap(s,i));renderHand();$('manualBoard').children[zero].focus();};}el.append(cell);});return el;
}
function renderHand(){
 const s=manual[manual.length-1],el=board(s,true);$('manualBoard').replaceChildren(...el.childNodes);$('manualBoard').setAttribute('aria-label',t('boardLabel',{s}));
 $('manualRead').textContent=t('manualRead',{n:manual.length-1,status:t(s==='123450'?'solved':'notSolved')});$('manualHistory').textContent=manual.join(' → ');$('undo').disabled=manual.length===1;
}
function renderTrace(){
 const f=frames[at];$('inputRead').textContent=t('preset'+preset);
 $('frameRead').textContent=t('frame',{i:at,n:frames.length-1,d:f.depth,count:f.front.length,seen:f.seen,result:f.result===null?t('pending'):f.result===-1?t('exhausted'):t('found',{d:f.result})});
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
 $('emptyFront').hidden=!!f.front.length;
 $('frontiers').replaceChildren(...f.front.map(s=>{const wrap=document.createElement('div');wrap.className='board-wrap'+(s==='123450'?' goal':'');const name=document.createElement('div');name.className='state-name';name.textContent=s+(s==='123450'?' ✓':'');wrap.append(name,board(s));return wrap;}));
 $('emptyLedger').hidden=!!f.history.length;
 $('ledger').replaceChildren(...f.history.map(row=>{const li=document.createElement('li');li.textContent=t('layerRow',row);return li;}));
 $('sampleParent').textContent=f.parent?t('sampleParent',{s:f.parent}):t('noExpansion');
 $('sample').replaceChildren(...f.sample.map(row=>{const li=document.createElement('li');li.textContent=t('candidate',{...row,decision:t(row.fresh?'admit':'reject')});return li;}));
}
function renderPrediction(){
 $('reveal').disabled=selected===null;
 $('predictionFeedback').textContent=revealed?t(selected===1?'correct':'incorrect')+' '+t('answer'):t('await');
 $('predictionFeedback').classList.toggle('correct',revealed&&selected===1);
}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('undo').onclick=()=>{if(manual.length>1)manual.pop();renderHand();};
$('manualReset').onclick=()=>{manual=['123405'];renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('tracePrev').onclick=()=>{if(at>0)at--;renderTrace();};$('traceNext').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};$('traceLast').onclick=()=>{at=frames.length-1;renderTrace();};
for(const radio of document.querySelectorAll('[name="prediction"]'))radio.onchange=()=>{selected=Number(radio.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};
$('predictionReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(x=>x.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceDetails').open=true;$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav'),sections=[...document.querySelectorAll('.step')];let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
