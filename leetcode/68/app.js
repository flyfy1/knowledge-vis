'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
let run=Justify68.trace(Justify68.presets[0].words,8),index=0,selected=null,revealed=false,copyState='';
function render(){
 const f=run.frames[index];
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===run.frames.length-1;
 $('position').max=run.frames.length-1;$('position').value=index;$('widthValue').textContent=run.width;
 $('progress').textContent=t('progress',{i:index,n:run.frames.length-1,w:run.width});
 $('words').replaceChildren(...run.words.map((w,k)=>{const el=document.createElement('span');el.className='word'+(k===f.j&&f.kind==='test'?' active':k<f.j?' used':'');el.textContent=w+(k===f.j&&f.kind==='test'?' · '+t('candidate'):k<f.j?' · '+t('passed'):'');return el;}));
 $('current').textContent=t('current',{words:run.words.slice(f.i,f.j).join(' / ')||t('empty'),L:f.letters,count:f.j-f.i});
 let message=t(f.kind==='start'?'start':f.kind==='done'?'done':f.kind==='accept'?'accept':f.kind==='test'?'test':'emit',{
 word:f.candidate||f.word,L:f.letters,len:(f.candidate||'').length,g:f.kind==='test'?f.j-f.i:f.g,need:f.need,decision:t(f.accept?'fits':'over'),S:f.S,
 rule:f.kind==='emit'?t(f.last?'last':f.g===0?'single':'even',{q:f.q,r:f.r}):''});
 $('message').textContent=message;$('noLines').hidden=f.lines.length>0;
 $('history').replaceChildren(...f.lines.map((line,i)=>{const box=document.createElement('div');box.className='line-scroll';box.tabIndex=0;box.setAttribute('role','region');box.setAttribute('aria-label',t('lineArea'));const label=document.createElement('div');label.className='line-label';label.textContent=t('lineLabel',{i:i+1,n:line.length});const strip=document.createElement('div');strip.className='strip';strip.textContent=line.replaceAll(' ','·');box.append(label,strip);return box;}));
 $('reveal').disabled=selected===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(selected==='2'?'correct':'incorrect')+' '+t('explanation'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
function restart(){index=0;run=Justify68.trace(Justify68.presets[Number($('preset').value)].words,Number($('width').value));render();}
$('preset').onchange=()=>{const p=Justify68.presets[Number($('preset').value)];$('width').min=Math.max(...p.words.map(w=>w.length));$('width').value=p.width;restart();};
$('width').oninput=restart;$('prev').onclick=()=>{index--;render();};$('next').onclick=()=>{index++;render();};$('reset').onclick=()=>{index=0;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(r=>r.onchange=()=>{selected=r.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
locale.onChange(render);locale.init();
function updateStep(){const current=[...document.querySelectorAll('.step')].filter(s=>s.getBoundingClientRect().top<=120).pop()||$('step0');document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateStep,{passive:true});window.addEventListener('resize',updateStep);updateStep();
