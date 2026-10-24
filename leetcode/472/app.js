'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let index=0,frames=ConcatLesson.trace(ConcatLesson.presets[0]),prediction=null,revealed=false,copyState='';
function render(){
 const f=frames[index],e=f.event;
 $('langToggle').setAttribute('aria-label',t('langLabel'));document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
 $('position').max=frames.length-1;$('position').value=index;
 $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
 $('context').textContent=t('context',{word:f.word,words:JSON.stringify(f.words)});
 $('progress').textContent=t('progress',{i:index,total:frames.length-1,done:f.completed});
 $('event').textContent=e?t('event',{...e,reason:t(e.reason),before:e.before?'T':'F',after:e.after?'T':'F'}):t('initial');
 $('ledger').replaceChildren(...f.dp.map((v,i)=>{
  const cell=document.createElement('div');cell.className='prefix-cell'+(e&&i===e.i?' current':'');
  const name=document.createElement('b');name.textContent=`dp[${i}] · ${f.word.slice(0,i)||t('emptyPrefix')}`;
  const status=document.createElement('small');status.textContent=t(i<=f.completed?'complete':e&&i===e.i?'partial':'unknown');
  const value=document.createElement('div');value.className='value';value.textContent=i<=f.completed||(e&&i===e.i)?v?'T':'F':'?';
  cell.append(name,status,value);return cell;
 }));
 $('final').hidden=index!==frames.length-1;if(!$('final').hidden)$('final').textContent=t(f.dp[f.word.length]?'finalYes':'finalNo');
 $('emptyLog').hidden=index!==0;$('history').hidden=index===0;
 $('historyBody').replaceChildren(...f.log.map(v=>{const tr=document.createElement('tr'),a=document.createElement('th'),b=document.createElement('td');a.scope='row';a.textContent=`${v.j} → ${v.i} / ${v.piece}`;b.textContent=t(v.reason);tr.append(a,b);return tr;}));
 $('reveal').disabled=prediction===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t(prediction==='1'?'correct':'incorrect')+' '+t('quizExplain');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{index=0;frames=ConcatLesson.trace(ConcatLesson.presets[Number(e.target.value)]);render();});
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
window.addEventListener('scroll',queueActive,{passive:true});window.addEventListener('resize',queueActive);locale.onChange(render);locale.onChange(queueActive);locale.init();queueActive();
