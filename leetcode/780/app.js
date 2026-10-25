'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=ReachingCore;
let hand=[[1,1]],preset=0,at=0,frames=C.trace(C.presets[0]),selection=null,revealed=false,copyState='';
function renderHand(){
 const [x,y]=hand[hand.length-1];$('handPoint').textContent=`(${x}, ${y})`;
 $('handRead').textContent=t('handRead',{x,y,n:hand.length-1,status:t(x===3&&y===5?'hit':'exploring')});
 $('addX').disabled=$('addY').disabled=x+y>20;$('undo').disabled=hand.length===1;
 $('handPath').replaceChildren(...hand.map(([a,b])=>{const li=document.createElement('li');li.textContent=`(${a}, ${b})`;return li;}));
}
function rowText(row){
 if(row.kind==='mod')return t('modRow',{...row,bx:row.before[0],by:row.before[1],x:row.after[0],y:row.after[1]});
 return t(row.kind,{...row,r:row.d%row.b,status:t(row.result?'true':'false')});
}
function renderTrace(){
 const f=frames[at],[sx,sy]=C.presets[preset];$('scenario').textContent=t('scenario'+preset);
 $('frameRead').textContent=t('frame',{i:at,n:frames.length-1,sx,sy,x:f.x,y:f.y,status:t(f.result===null?'pending':f.result?'true':'false')});
 $('tracePoint').textContent=`(${f.x}, ${f.y})`;$('operation').textContent=f.row?rowText(f.row):t('start');
 $('prev').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
 $('emptyHistory').hidden=f.history.length>0;
 $('traceHistory').replaceChildren(...f.history.map(row=>{const li=document.createElement('li');li.textContent=rowText(row);return li;}));
}
function renderPrediction(){
 $('reveal').disabled=selection===null;
 $('feedback').textContent=revealed?t(selection===2?'correct':'incorrect')+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&selection===2);
}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
for(const axis of ['X','Y'])$('add'+axis).onclick=()=>{const [x,y]=hand[hand.length-1];if(x+y<=20)hand.push(axis==='X'?[x+y,y]:[x,x+y]);renderHand();};
$('undo').onclick=()=>{if(hand.length>1)hand.pop();renderHand();};$('handReset').onclick=()=>{hand=[[1,1]];renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('prev').onclick=()=>{if(at>0)at--;renderTrace();};$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};
for(const r of document.querySelectorAll('[name="prediction"]'))r.onchange=()=>{selection=Number(r.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=()=>{selection=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(r=>r.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('sourceDetails').open=true;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav');let current=document.querySelector('.step');for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
