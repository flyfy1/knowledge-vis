'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let handMask=0,selectedPreset=0,at=0,frames=Swaps.trace(...Swaps.presets[0]),choice=null,revealed=false,copyState='';
const number=v=>v===Infinity?'∞':String(v);
function node(tag,content,cls){const el=document.createElement(tag);el.textContent=content;if(cls)el.className=cls;return el;}
function pairs(id,a,b,current=-1,mask=0){
 $(id).replaceChildren(...a.map((v,i)=>{const e=node('div','','pair'+(i===current?' current':'')+(mask&(1<<i)?' chosen':''));e.append(node('span',t('index',{i})),node('span',t('top')),node('b',v),node('span',t('bottom')),node('b',b[i]));return e;}));
}
for(let i=0;i<4;i++){const b=node('button','','btn');b.type='button';b.id='swap'+i;b.dataset.step='0';b.onclick=()=>{handMask^=1<<i;renderHand();};$('handButtons').append(b);}
function renderHand(){const h=Swaps.orient(...Swaps.presets[0],handMask);pairs('handPairs',h.x,h.y,-1,handMask);for(let i=0;i<4;i++){$('swap'+i).textContent=t('toggle',{i});$('swap'+i).setAttribute('aria-pressed',String(!!(handMask&(1<<i))));}$('handRead').textContent=t('handRead',{cost:h.cost,status:t(h.valid?'yes':'no')});}
function renderTrace(){
 const [a,b]=Swaps.presets[selectedPreset],f=frames[at];pairs('original',a,b,f.i);
 $('progress').textContent=t('progress',{done:at+1,n:a.length,i:f.i});
 $('history').replaceChildren(...frames.slice(0,at+1).map(g=>{
  const card=node('article','','trace-card');card.dataset.i=g.i;
  if(!g.i){card.append(node('h3',t('init')));return card;}
  card.append(node('h3',t('card',{i:g.i,k:number(g.oldK),w:number(g.oldW)})));
  card.append(node('p',t('sRead',{a:a[g.i-1],b:a[g.i],c:b[g.i-1],d:b[g.i],result:t(g.s?'pass':'fail')}),'guard'));
  card.append(node('p',t('cRead',{a:a[g.i-1],b:b[g.i],c:b[g.i-1],d:a[g.i],result:t(g.c?'pass':'fail')}),'guard'));
  const list=node('div','','candidates');
  for(const [label,guard,cost,extra] of [['edgeKK',g.s,g.oldK,0],['edgeWK',g.c,g.oldW,0],['edgeWW',g.s,g.oldW,1],['edgeKW',g.c,g.oldK,1]]){
   const e=node('div','','candidate'),val=guard?cost+extra:Infinity;
   e.append(node('b',t(label)),node('span',t('candidate',{v:number(val),reason:t(!guard?'blocked':cost===Infinity?'unreachable':'allowed')})));list.append(e);
  }
  card.append(list,node('p',t('costs',{k:number(g.k),w:number(g.w)})));return card;
 }));
 $('final').textContent=at===frames.length-1?t('final',{answer:number(Math.min(f.k,f.w))}):t('notFinal');
 $('prev').disabled=$('reset').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
}
function renderQuiz(){$('reveal').disabled=choice===null||revealed;$('quizReset').disabled=choice===null;$('feedback').textContent=revealed?t(choice===2?'correct':'incorrect')+' '+t('answer'):t(choice===null?'wait':'selected');}
$('prev').onclick=()=>{at=Math.max(0,at-1);renderTrace();};$('next').onclick=()=>{at=Math.min(frames.length-1,at+1);renderTrace();};$('reset').onclick=()=>{at=0;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};
$('preset').onchange=()=>{selectedPreset=+$('preset').value;frames=Swaps.trace(...Swaps.presets[selectedPreset]);at=0;renderTrace();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{choice=+r.value;revealed=false;renderQuiz();});$('reveal').onclick=()=>{revealed=true;renderQuiz();};$('quizReset').onclick=()=>{choice=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(r=>r.checked=false);renderQuiz();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='manual';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(()=>{renderHand();renderTrace();renderQuiz();if(copyState)$('copyStatus').textContent=t(copyState);});locale.init();
function updateNavigation(){let current='step0';for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=150)current=s.id;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let queued=false;addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;updateNavigation();});}},{passive:true});addEventListener('resize',updateNavigation);updateNavigation();
