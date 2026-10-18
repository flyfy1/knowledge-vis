'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,frames=Ladder.trace(Ladder.presets[0]),choice=null,revealed=false,copyState=null;
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
function render(){
 const p=Ladder.presets[preset],f=frames[index];
 $('dictionary').textContent=t('dictionary',{words:p.words.join(', '),begin:p.begin,end:p.end});
 $('progress').textContent=t('progress',{i:index,n:frames.length-1,p:f.history.length});
 $('position').max=frames.length-1;$('position').value=index;
 $('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===frames.length-1;
 $('queue').textContent=t('queue',{q:f.queue.map(([w,d])=>`(${w}, ${d})`).join(' → ')||t('empty')});
 $('layers').replaceChildren();
 for(let d=1;d<=Math.max(...f.nodes.map(n=>n.d));d++){
  const layer=document.createElement('div');layer.className='layer';const title=document.createElement('h3');title.textContent=t('layer',{d});layer.append(title);const row=document.createElement('div');row.className='words';
  f.nodes.filter(n=>n.d===d).forEach(n=>{const card=document.createElement('div');card.className='word'+(n.word===f.word?' current':'');const word=document.createElement('b');word.textContent=n.word;const label=document.createElement('p');label.textContent=t('from',{p:n.parent||t('origin'),state:t(n.done?'done':'pending')});card.append(word,label);row.append(card);});layer.append(row);$('layers').append(layer);
 }
 $('history').replaceChildren(...f.history.map(h=>{const li=document.createElement('li');li.textContent=t('entry',{w:h.word,d:h.d,a:h.added.join(', ')||t('none')});return li;}));
 $('event').textContent=t(f.event==='empty'?'exhausted':f.event,{w:f.word,t:f.tried,a:f.added.join(', ')||t('none'),r:f.result});
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t('answer',{verdict:t(choice==='2'?'correct':'incorrect')});
 $('copyStatus').textContent=copyState?t(copyState):'';
 document.querySelector('.step-nav').setAttribute('aria-label',t('navLabel'));$('langToggle').setAttribute('aria-label',t('langLabel'));document.querySelector('pre').setAttribute('aria-label',t('codeLabel'));
}
$('preset').addEventListener('change',e=>{preset=+e.target.value;index=0;frames=Ladder.trace(Ladder.presets[preset]);render();});
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};$('position').oninput=e=>{index=+e.target.value;render();};
for(const r of document.querySelectorAll('[name=prediction]'))r.onchange=()=>{choice=r.value;revealed=false;render();};$('reveal').onclick=()=>{revealed=true;render();};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+e.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('.step').forEach(s=>observer.observe(s));
