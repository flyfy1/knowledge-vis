'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=ThreeCore;
let hand=false,preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
function windowCards(container,input,f){
 const w=Array.from({length:input.nums.length-input.k+1},(_,i)=>input.nums.slice(i,i+input.k).reduce((a,b)=>a+b,0));
 container.replaceChildren(...w.map((v,i)=>{
  const el=document.createElement('div'),active=f&&f.i===i,chosen=f&&f.kind==='middle'&&f.ledger.at(-1).candidate.includes(i);
  el.className='window'+(active?' active':'')+(chosen?' chosen':'');
  for(const [tag,text] of [['small',t('window',{i})],['b',JSON.stringify(input.nums.slice(i,i+input.k))],['span',t('sum',{v})],['small',chosen?t('chosenMark'):active?t('activeMark'):'']]){const n=document.createElement(tag);n.textContent=text;el.append(n);}
  return el;
 }));
}
function renderHand(){windowCards($('handWindows'),C.presets[0],null);$('handRead').textContent=t(hand?'handAnswer':'handHidden');$('handToggle').textContent=t(hand?'handHide':'handShow');$('handToggle').setAttribute('aria-expanded',String(hand));}
function renderTrace(){
 const f=frames[at],input=C.presets[preset];let action=t('init');
 if(f.kind==='left'||f.kind==='right'){
  const pick=(f.kind==='left'?f.left:f.right)[f.i];
  action=f.old===null?t('seed',{i:f.i,side:f.kind==='left'?'L':'R'}):t(f.kind,{i:f.i,v:f.w[f.i],old:f.old,ov:f.w[f.old],truth:t((f.kind==='left'?f.w[f.i]>f.w[f.old]:f.w[f.i]>=f.w[f.old])?'true':'false'),pick});
 }else if(f.kind==='middle'){
  const row=f.ledger.at(-1);action=t('middle',{j:row.j,l:row.j-input.k,r:row.j+input.k,candidate:JSON.stringify(row.candidate),terms:row.candidate.map(i=>f.w[i]).join('+'),total:row.total});
 }
 $('inputRead').textContent='nums='+JSON.stringify(input.nums)+'; k='+input.k+'; W='+JSON.stringify(f.w);
 $('frameRead').textContent=t('progress',{at,last:frames.length-1,action});
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
 windowCards($('windows'),input,f);
 $('summaryRows').replaceChildren(...f.w.map((v,i)=>{const tr=document.createElement('tr');if(f.i===i)tr.className='changed';[i,v,f.left[i]??t('pending'),f.right[i]??t('pending')].forEach((text,j)=>{const cell=document.createElement(j===0?'th':'td');if(j===0)cell.scope='row';cell.textContent=text;tr.append(cell);});return tr;}));
 $('bestRead').textContent=f.best?t(at===frames.length-1?'final':'best',{best:JSON.stringify(f.best),sum:f.bestSum}):t('noBest');
 document.querySelector('[data-i18n="empty"]').hidden=f.ledger.length>0;
 $('ledger').replaceChildren(...f.ledger.map(row=>{const li=document.createElement('li');li.textContent=t('ledgerRow',{...row,candidate:JSON.stringify(row.candidate),terms:row.candidate.map(i=>f.w[i]).join('+'),decision:t(row.update?'update':'keep'),best:JSON.stringify(row.best)});return li;}));
}
function renderPrediction(){$('reveal').disabled=selected===null;$('predictionFeedback').textContent=revealed?t(selected===2?'correct':'incorrect')+' '+t('answer'):t('await');$('predictionFeedback').classList.toggle('correct',revealed&&selected===2);}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('handToggle').onclick=()=>{hand=!hand;renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('tracePrev').onclick=()=>{if(at>0)at--;renderTrace();};$('traceNext').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};$('traceLast').onclick=()=>{at=frames.length-1;renderTrace();};
for(const radio of document.querySelectorAll('[name="prediction"]'))radio.onchange=()=>{selected=Number(radio.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(x=>x.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav'),sections=[...document.querySelectorAll('.step')];let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
