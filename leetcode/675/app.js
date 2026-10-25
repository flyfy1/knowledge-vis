'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=ForestCore;
let hand=false,preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
function renderHand(){
 $('handRead').textContent=t(hand?'handAnswer':'handHidden');$('handToggle').textContent=t(hand?'handHide':'handShow');$('handToggle').setAttribute('aria-expanded',String(hand));
}
function renderTrace(){
 const f=frames[at],input=C.presets[preset],front=new Set(f.front.map(x=>x.join(',')));
 const d=f.dist[f.target[1]][f.target[2]];
 const action=t(f.kind,{d:f.kind==='layer'?f.depth:d,count:f.front.length,total:f.total});
 $('inputRead').textContent=t('preset'+preset)+' · '+JSON.stringify(input);
 $('frameRead').textContent=t('frame',{i:at,n:frames.length-1,h:f.target[0],r:f.target[1],c:f.target[2],action,total:f.total});
 $('tracePrev').disabled=at===0;$('traceNext').disabled=at===frames.length-1;$('traceLast').disabled=at===frames.length-1;
 $('board').style.setProperty('--cols',input[0].length);$('board').setAttribute('aria-label',t('gridName'));
 $('board').replaceChildren(...input.flatMap((row,r)=>row.map((h,c)=>{
  const el=document.createElement('div'),isFront=front.has([r,c].join(',')),isTarget=r===f.target[1]&&c===f.target[2],isCut=f.cut.includes(h),dist=f.dist[r][c];
  el.className='cell'+(isFront?' front':'')+(isTarget?' target':'')+(h===0?' wall':'');
  const marks=[isFront?'F':'',isTarget?'T':'',isCut?'×':''].filter(Boolean).join(' ');
  const top=document.createElement('b');top.textContent=h;const bottom=document.createElement('span');bottom.textContent=h===0?'#':dist===null?'d ·':'d '+dist;const tag=document.createElement('span');tag.textContent=marks||'·';
  el.setAttribute('aria-label',t('cell',{r,c,h,d:h===0?t('wall'):dist===null?t('unknown'):dist,marks:[isFront?t('front'):'',isTarget?t('target'):'',isCut?t('cutMark'):''].filter(Boolean).join(', ')}));el.append(top,bottom,tag);return el;
 })));
 $('emptyLedger').hidden=!!f.ledger.length;
 $('ledger').replaceChildren(...f.ledger.map(row=>{const li=document.createElement('li');li.textContent=t('row',{...row,sr:row.from[0],sc:row.from[1],tr:row.to[0],tc:row.to[1]});return li;}));
}
function renderPrediction(){
 $('reveal').disabled=selected===null;
 $('predictionFeedback').textContent=revealed?t(selected===5?'correct':'incorrect')+' '+t('answer'):t('await');
 $('predictionFeedback').classList.toggle('correct',revealed&&selected===5);
}
function render(){renderHand();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('handToggle').onclick=()=>{hand=!hand;renderHand();};
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
