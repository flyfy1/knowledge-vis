'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,poison=1,index=0,choice=null,revealed=false,copyStatus='';
let model;
function rebuild(){const {b,d,t:time}=Pigs.presets[preset];model=Pigs.experiment(b,d,time,poison);index=0;}
function node(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function list(xs){return xs.length?xs.join(', '):t('none');}
function pigName(p){return t('pig',{p:String.fromCharCode(65+p)});}
function observed(x,i){return x?t('observedDead',{r:x}):t('observedAlive',{i});}
function render(){
 const f=model.frames[index];
 document.querySelectorAll('.table-wrap').forEach(e=>{e.setAttribute('role','region');e.setAttribute('aria-label',e.querySelector('caption').textContent);});
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));
 $('poison').replaceChildren(...Array.from({length:model.b},(_,i)=>{const o=node('option',t('bucketOption',{b:i+1}));o.value=i+1;return o;}));$('poison').value=poison;
 $('summary').textContent=t('summary',{b:model.b,t:model.t,d:model.d,r:model.rounds,s:model.states,p:model.pigs});
 $('capacity').replaceChildren(...model.ledger.map((e,i)=>node('div',t('capacityItem',{p:e.pigs,c:e.capacity}),'ledger-item'+(i===model.ledger.length-1?' final':''))));
 $('position').max=model.rounds;$('position').value=index;
 $('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===model.rounds;
 $('progress').textContent=t('progress',{i:index,r:model.rounds,time:f.time,n:f.candidates.length,c:list(f.candidates)});
 $('leftover').textContent=t('leftover',{time:model.rounds*model.d,t:model.t,left:model.t-model.rounds*model.d});
 $('pigs').replaceChildren();
 if(!model.pigs)$('pigs').append(node('p',t('noPigs')));
 for(let p=0;p<model.pigs;p++){
  const card=node('div','','pig-card');card.append(node('h3',pigName(p)));
  card.append(node('p',t('never',{b:list(model.codes.flatMap((c,i)=>c[p]===0?[i+1]:[]))})));
  for(let r=1;r<=model.rounds;r++)card.append(node('p',t('plan',{r,time:(r-1)*model.d,b:list(model.plan[r-1][p])})));
  card.append(node('p',observed(f.observed[p],index),'readout'));$('pigs').append(card);
 }
 $('buckets').replaceChildren(...model.codes.map((c,i)=>{
  const possible=f.candidates.includes(i+1),found=possible&&f.candidates.length===1;
  const card=node('div','','bucket-card'+(possible?'':' excluded')+(found?' found':''));card.dataset.bucket=i+1;card.dataset.candidate=String(possible);
  card.append(node('b',t('bucketHeading',{b:i+1})),node('span',t('digits',{digits:c.length?c.join(', '):t('emptyVector')})),node('span',t(found?'found':possible?'possible':'excluded')));return card;
 }));
 $('history').replaceChildren();
 if(!f.history.length)$('history').append(node('p',t('noHistory'),'hint'));
 for(const h of f.history){const entry=node('div','','history-entry');entry.append(node('b',t('historyRound',{r:h.round,time:h.time})));
  if(!model.pigs)entry.append(node('p',t('noPigs')));
  h.feeds.forEach((feed,p)=>entry.append(node('p',feed.skipped?t('skipHistory',{p:pigName(p)}):t('feedHistory',{p:pigName(p),b:list(feed.buckets),result:observed(h.observed[p],h.round)}))));$('history').append(entry);
 }
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
 $('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('quizReason'):'';
 $('copyStatus').textContent=copyStatus?t(copyStatus):'';
 syncNav();
}
$('preset').addEventListener('change',e=>{preset=Number(e.target.value);poison=1;rebuild();render();});
$('poison').addEventListener('change',e=>{poison=Number(e.target.value);rebuild();render();});
$('prev').onclick=()=>{if(index>0)index--;render();};$('next').onclick=()=>{if(index<model.rounds)index++;render();};
$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=model.rounds;render();};
$('position').addEventListener('input',e=>{index=Number(e.target.value);render();});
document.querySelectorAll('[name=prediction]').forEach(e=>e.addEventListener('change',()=>{choice=e.value;revealed=false;render();}));
$('reveal').onclick=()=>{if(choice!==null)revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyStatus='copyOk';$('manualCopy').hidden=true;}catch(_){copyStatus='copyFallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});const strip=document.querySelector('.step-nav-inner');document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on){a.setAttribute('aria-current','step');const r=a.getBoundingClientRect(),s=strip.getBoundingClientRect();if(r.left<s.left)strip.scrollLeft-=s.left-r.left+12;else if(r.right>s.right)strip.scrollLeft+=r.right-s.right+12;}else a.removeAttribute('aria-current');});}
rebuild();locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
