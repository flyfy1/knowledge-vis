'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=ChessCore;
let hand=[C.clone(C.presets[1])],preset=0,at=0,frames=C.trace(C.presets[0]),selection=null,revealed=false,copyState='';
function board(id,b,event=null){
 const table=document.createElement('table');table.className='board';
 const caption=table.createCaption();caption.textContent=t('boardCaption');
 const header=table.insertRow();header.appendChild(document.createElement('th'));for(let j=0;j<b.length;j++){const th=document.createElement('th');th.scope='col';th.textContent='c'+j;header.appendChild(th);}
 b.forEach((row,i)=>{const tr=table.insertRow();const th=document.createElement('th');th.scope='row';th.textContent='r'+i;tr.appendChild(th);
 if(event?.kind==='rowCheck'&&event.i===i)tr.classList.add('active');
 row.forEach((x,j)=>{const td=tr.insertCell();td.textContent=x;td.classList.toggle('one',x===1);if((event?.kind==='structureFail'&&event.i===i&&event.j===j)||(event?.kind==='swap'&&(event.axis==='rows'?[event.a,event.z].includes(i):[event.a,event.z].includes(j))))td.classList.add('mark');});});
 $(id).replaceChildren(table);
}
function isChess(b){return b.every((r,i)=>r.every((x,j)=>(!i||x!==b[i-1][j])&&(!j||x!==r[j-1])));}
function renderHand(){const b=hand[hand.length-1];board('handOriginal',hand[0]);board('handCurrent',b);$('handRead').textContent=t('handRead',{n:hand.length-1,status:t(isChess(b)?'chess':'notChess')});$('undo').disabled=hand.length===1;$('handPath').replaceChildren(...hand.map((b,i)=>{const li=document.createElement('li');li.textContent=i+': '+b.map(r=>r.join('')).join(' / ');return li;}));}
function eventText(e){return t(e.kind,{...e,axis:e.axis?t(e.axis):'',relation:e.relation?t(e.relation):''});}
function renderTrace(){const f=frames[at];board('traceOriginal',C.presets[preset]);board('traceCurrent',f.board,f.event);$('frameRead').textContent=t('frame',{i:at,n:frames.length-1,moves:f.moves,result:f.result===null?t('pending'):f.result});$('operation').textContent=eventText(f.event);$('prev').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;$('traceHistory').replaceChildren(...f.history.map(e=>{const li=document.createElement('li');li.textContent=eventText(e);return li;}));}
function renderPrediction(){$('reveal').disabled=selection===null;$('feedback').textContent=revealed?t(selection===2?'correct':'incorrect')+' '+t('answer'):t('await');$('feedback').classList.toggle('correct',revealed&&selection===2);}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('swapHand').onclick=()=>{const b=C.clone(hand[hand.length-1]);for(const row of b)[row[1],row[2]]=[row[2],row[1]];hand.push(b);renderHand();};
$('undo').onclick=()=>{if(hand.length>1)hand.pop();renderHand();};$('handReset').onclick=()=>{hand=[C.clone(C.presets[1])];renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('prev').onclick=()=>{if(at>0)at--;renderTrace();};$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};
for(const r of document.querySelectorAll('[name="prediction"]'))r.onchange=()=>{selection=Number(r.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=()=>{selection=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(r=>r.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('sourceDetails').open=true;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav');let current=document.querySelector('.step');for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
