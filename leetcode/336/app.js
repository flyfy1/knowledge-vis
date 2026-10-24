'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,frames=PairLesson.trace(PairLesson.presets[0]),nodes=PairLesson.build(PairLesson.presets[0]);
let prediction=null,revealed=false,copyState='';
const show=x=>JSON.stringify(x);
function eventText(f){
  return t(f.kind,{...f,word:f.i<0?'':show(PairLesson.presets[preset][f.i]),path:show(f.path),suffix:show(f.suffix||''),ok:t(f.ok?'yes':'no'),pal:show(f.pal),emitted:show(f.emitted||[])});
}
function render(){
  const f=frames[index],words=PairLesson.presets[preset];
  $('langToggle').setAttribute('aria-label',t('langLabel'));document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
  $('tree').setAttribute('aria-label',t('treeLabel'));$('history').setAttribute('aria-label',t('historyLabel'));
  $('position').max=frames.length-1;$('position').value=index;
  $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
  $('progress').textContent=t('progress',{k:index,total:frames.length-1,count:f.pairs.length});
  $('event').textContent=eventText(f);
  $('words').replaceChildren(...words.map((w,i)=>{const el=document.createElement('div');el.className='word'+(i===f.i?' active':'');el.textContent=(i===f.i?'▶ ':'')+i+': '+show(w);return el;}));
  $('treeBody').replaceChildren(...nodes.map((node,id)=>{
    const row=document.createElement('tr');row.className=id===f.id?'active-row':'';
    [(id===f.id?'▶ ':'')+show(node.path),node.end,show(node.pal)].forEach(value=>{const cell=document.createElement('td');cell.textContent=value;row.append(cell);});return row;
  }));
  // Keep the active path visible inside the scrollable tree, without moving the page.
  const activeRow=$('treeBody').querySelector('.active-row');
  if(activeRow){
    const box=$('tree').getBoundingClientRect(),row=activeRow.getBoundingClientRect();
    const scale=box.width/$('tree').offsetWidth;
    const header=$('tree').querySelector('thead').getBoundingClientRect().height;
    if(row.bottom>box.bottom)$('tree').scrollTop+=(row.bottom-box.bottom+2*scale)/scale;
    else if(row.top<box.top+header)$('tree').scrollTop+=(row.top-box.top-header-2*scale)/scale;
  }
  $('ledger').replaceChildren();
  if(!f.pairs.length)$('ledger').textContent=t('emptyPairs');
  f.pairs.forEach(([i,j])=>{const el=document.createElement('span');el.className='ledger-item';el.textContent=`[${i},${j}] → ${words[i]+words[j]}`;$('ledger').append(el);});
  $('historyBody').replaceChildren(...frames.slice(1,index+1).map((entry,k)=>{
    const row=document.createElement('tr');row.className=k===index-1?'active-row':'';
    const cell=document.createElement('th');cell.scope='row';cell.textContent=k+1;const reason=document.createElement('td');reason.textContent=eventText(entry);row.append(cell,reason);return row;
  }));
  $('reveal').disabled=prediction===null;$('feedback').hidden=!revealed;
  if(revealed)$('feedback').textContent=t(prediction==='1'?'correct':'incorrect')+' '+t('quizExplain');
  $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{preset=Number(e.target.value);index=0;frames=PairLesson.trace(PairLesson.presets[preset]);nodes=PairLesson.build(PairLesson.presets[preset]);render();});
$('prev').addEventListener('click',()=>{index=Math.max(0,index-1);render();});
$('next').addEventListener('click',()=>{index=Math.min(frames.length-1,index+1);render();});
$('reset').addEventListener('click',()=>{index=0;render();});
$('end').addEventListener('click',()=>{index=frames.length-1;render();});
$('position').addEventListener('input',e=>{index=Number(e.target.value);render();});
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{prediction=el.value;revealed=false;render();}));
$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
  catch(_){copyState='fallbackStatus';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}
  render();
});
const links=[...document.querySelectorAll('.step-nav a')],sections=[...document.querySelectorAll('.step')];
let queued=false;
function updateActive(){queued=false;const boundary=document.querySelector('nav').getBoundingClientRect().height+40;let active=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<=boundary)active=section;links.forEach(a=>{const yes=a.hash==='#'+active.id;a.classList.toggle('active',yes);if(yes)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
function queueActive(){if(!queued){queued=true;requestAnimationFrame(updateActive);}}
window.addEventListener('scroll',queueActive,{passive:true});window.addEventListener('resize',()=>{render();queueActive();});
locale.onChange(render);locale.onChange(queueActive);locale.init();
