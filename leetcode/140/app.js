'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let index=0,frames=WordBreakLesson.trace(WordBreakLesson.presets[0]),prediction=null,revealed=false,copyState='';
const list=xs=>'['+xs.map(s=>s?JSON.stringify(s):'ε').join(', ')+']';
function render(){
 const f=frames[index],e=f.event;
 $('langToggle').setAttribute('aria-label',t('langLabel'));
 document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
 $('position').max=frames.length-1;$('position').value=index;
 $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
 $('progress').textContent=t('progress',{i:index,total:frames.length-1,done:f.done});
 $('event').textContent=e?t('event',{...e,reason:!e.match?t('absent'):f.values[e.j].length?t('combine',{j:e.j,count:f.values[e.j].length}):t('dead',{j:e.j})}):t('initial');
 $('comparison').hidden=!e;
 if(e)$('comparison').textContent=t('compare',{i:e.i,before:list(e.before),added:list(e.added),after:list(e.after)});
 $('ledger').replaceChildren(...f.values.map((xs,i)=>{
  const cell=document.createElement('div');cell.className='suffix-cell'+(e&&i===e.i?' current':'');
  const label=document.createElement('b');label.textContent=`F[${i}] · ${f.s.slice(i)||t('suffixEmpty')}`;
  const status=document.createElement('small');status.textContent=t(i>=f.done?'complete':xs===null?'unknown':'partial');
  const val=document.createElement('div');val.textContent=xs===null?'?':list(xs);
  cell.append(label,status,val);return cell;
 }));
 $('final').hidden=index!==frames.length-1;
 if(!$('final').hidden)$('final').textContent=t('final',{answer:list(f.values[0]),count:f.values[0].length});
 $('emptyLog').hidden=index!==0;$('history').hidden=index===0;
 $('historyBody').innerHTML=f.log.map(v=>`<tr><th scope="row">[${v.i},${v.j}) ${v.word}</th><td>${t(v.match?'yes':'no')}</td><td>${list(v.added)}</td></tr>`).join('');
 $('reveal').disabled=prediction===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t(prediction==='1'?'correct':'incorrect')+' '+t('quizExplain');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{index=0;frames=WordBreakLesson.trace(WordBreakLesson.presets[Number(e.target.value)]);render();});
$('prev').addEventListener('click',()=>{index=Math.max(0,index-1);render();});
$('next').addEventListener('click',()=>{index=Math.min(frames.length-1,index+1);render();});
$('end').addEventListener('click',()=>{index=frames.length-1;render();});
$('reset').addEventListener('click',()=>{index=0;render();});
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
function updateActive(){queued=false;let active=sections[0];const boundary=document.querySelector('nav').getBoundingClientRect().height+40;for(const s of sections)if(s.getBoundingClientRect().top<=boundary)active=s;links.forEach(a=>{const yes=a.hash==='#'+active.id;a.classList.toggle('active',yes);if(yes)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
function queueActive(){if(!queued){queued=true;requestAnimationFrame(updateActive);}}
window.addEventListener('scroll',queueActive,{passive:true});window.addEventListener('resize',queueActive);
locale.onChange(render);locale.onChange(queueActive);locale.init();queueActive();
