'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let handMask=0,frames=Chunks.trace(Chunks.presets[0]),at=0,choice=null,revealed=false,copyState='';
const fmt=a=>'['+a.join(', ')+']';
function renderChunks(id,chunks){
 $(id).replaceChildren(...chunks.map((c,k)=>{const el=document.createElement('div');el.className='chunk';const label=document.createElement('span');label.textContent=t('chunkLabel',{k:k+1});const v=document.createElement('b');v.textContent=fmt(c);el.append(label,v);return el;}));
}
function renderHand(){
 const p=Chunks.partition([2,1,3],handMask);renderChunks('handOriginal',p.chunks);renderChunks('handSorted',p.sorted);
 for(let i=0;i<2;i++)$('cut'+i).setAttribute('aria-pressed',String(!!(handMask&(1<<i))));
 $('handRead').textContent=t('handRead',{joined:fmt(p.joined),status:t(p.valid?'valid':'invalid'),count:p.chunks.length});
}
function describeCut(c){return t('cut',{...c,sign:c.safe?'≤':'>',decision:t(c.safe?'safe':'unsafe')});}
function describe(f){
 if(f.op==='cut')return describeCut(f.cuts.at(-1));
 return t(f.op,{i:f.i,v:f.a[f.i],j:f.i+1,r:f.suffix[f.i+1],s:f.suffix[f.i]});
}
function renderTrace(){
 const f=frames[at],n=f.a.length;
 $('input').textContent=t('input',{a:fmt(f.a)});
 $('progress').textContent=t('progress',{at,total:frames.length-1,tested:f.cuts.length,cuts:n-1,safe:f.safe});$('operation').textContent=describe(f);
 $('values').replaceChildren(...f.a.map((v,i)=>{
  const e=document.createElement('div');e.className='value-card'+(f.i===i?' current':'');
  const label=document.createElement('span');label.textContent=t('index',{i});const value=document.createElement('b');value.textContent=v;
  const caption=document.createElement('span');caption.textContent=t('suffixLabel');const s=document.createElement('b');s.textContent=f.suffix[i]===null?'—':f.suffix[i];e.append(label,value,caption,s);return e;
 }));
 const items=f.cuts.map(c=>{const li=document.createElement('li');li.className=c.safe?'pass':'fail';li.textContent=describeCut(c);return li;});
 if(!items.length){const li=document.createElement('li');li.textContent=t('noHistory');items.push(li);}$('history').replaceChildren(...items);
 const mask=f.cuts.reduce((m,c)=>c.safe?m|(1<<c.i):m,0);
 $('final').textContent=at===frames.length-1?t('final',{safe:f.safe,answer:f.safe+1,chunks:Chunks.partition(f.a,mask).chunks.map(fmt).join(' | ')}):t('notFinal');
 $('prev').disabled=$('reset').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
}
function renderQuiz(){
 $('reveal').disabled=choice===null||revealed;$('quizReset').disabled=choice===null;
 $('feedback').textContent=revealed?t(choice===1?'correct':'incorrect')+' '+t('answer'):t(choice===null?'wait':'selected');
}
for(let i=0;i<2;i++)$('cut'+i).onclick=()=>{handMask^=1<<i;renderHand();};
$('prev').onclick=()=>{at=Math.max(0,at-1);renderTrace();};$('next').onclick=()=>{at=Math.min(frames.length-1,at+1);renderTrace();};
$('reset').onclick=()=>{at=0;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};
$('preset').onchange=()=>{frames=Chunks.trace(Chunks.presets[+$('preset').value]);at=0;renderTrace();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{choice=+r.value;revealed=false;renderQuiz();});
$('reveal').onclick=()=>{revealed=true;renderQuiz();};$('quizReset').onclick=()=>{choice=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(r=>r.checked=false);renderQuiz();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{
 try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}
 catch(_){copyState='manual';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}
 $('copyStatus').textContent=t(copyState);
};
locale.onChange(()=>{renderHand();renderTrace();renderQuiz();if(copyState)$('copyStatus').textContent=t(copyState);});locale.init();
function updateNavigation(){let current='step0';for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=150)current=s.id;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let queued=false;addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;updateNavigation();});}},{passive:true});addEventListener('resize',updateNavigation);updateNavigation();
