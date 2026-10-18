'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let index=0,frames=PalindromeLesson.trace(PalindromeLesson.presets[0]);
let prediction=null,revealed=false,copyState='';
function render(){
  const f=frames[index],done=f.pi.filter(x=>x!==null).length;
  $('langToggle').setAttribute('aria-label',t('langLabel'));
  document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
  $('chars').setAttribute('aria-label',t('arrayLabel'));
  $('history').setAttribute('aria-label',t('historyLabel'));
  $('position').max=frames.length-1;$('position').value=index;
  $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
  $('progress').textContent=t('progress',{k:index,total:frames.length-1,done,n:f.t.length});
  $('event').textContent=t(f.kind,{i:f.i,a:f.t[f.i],b:f.t[f.before],before:f.before,after:f.after,p:f.before-1});
  $('chars').replaceChildren(...[...f.t].map((c,k)=>{
    const el=document.createElement('div');
    el.className='cell'+(f.pi[k]!==null?' done':'')+(index>0&&(k===f.i||k===f.before)?' current':'');
    const pos=document.createElement('small');pos.textContent='i='+k;
    const ch=document.createElement('b');ch.textContent=c;
    const value=document.createElement('div');value.textContent='pi='+ (f.pi[k]===null?'?':f.pi[k]);
    const mark=document.createElement('small');mark.className='mark';mark.textContent=index===0?'':(k===f.i?'C':'')+(k===f.before?'P':'');
    el.append(pos,ch,value,mark);return el;
  }));
  const end=f.kind==='fallback'?f.i:f.i+1,j=f.kind==='initial'?0:f.after;
  $('prefixPiece').textContent=f.t.slice(0,j)||'∅';
  $('suffixPiece').textContent=f.t.slice(end-j,end)||'∅';
  $('pieceNote').textContent=t(f.kind==='fallback'?'candidateNote':'commitNote',{i:f.i,j});
  $('final').hidden=index!==frames.length-1;
  if(!$('final').hidden){
    const ell=f.pi[f.pi.length-1],add=[...f.s.slice(ell)].reverse().join('');
    $('final').textContent=t('final',{last:f.t.length-1,ell,add:add||'∅',result:(add+f.s)||'∅',count:add.length});
  }
  $('emptyLog').hidden=index!==0;$('history').hidden=index===0;
  $('historyBody').innerHTML=f.log.map((e,k)=>`<tr class="${k===f.log.length-1?'active-row':''}"><th scope="row">${k+1}</th><td>t[${e.i}]=${e.left} ${e.left===e.right?'=':'≠'} t[${e.before}]=${e.right}</td><td>${e.before}</td><td>${e.after}</td><td>${t({fallback:'actFallback',match:'actMatch',zero:'actZero'}[e.kind])}</td></tr>`).join('');
  $('reveal').disabled=prediction===null;$('feedback').hidden=!revealed;
  if(revealed)$('feedback').textContent=t(prediction==='1'?'correct':'incorrect')+' '+t('quizExplain');
  $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{index=0;frames=PalindromeLesson.trace(PalindromeLesson.presets[Number(e.target.value)]);render();});
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
function updateActive(){
  queued=false;
  const boundary=document.querySelector('nav').getBoundingClientRect().height+40;
  let active=sections[0];
  for(const section of sections)if(section.getBoundingClientRect().top<=boundary)active=section;
  links.forEach(a=>{const yes=a.hash==='#'+active.id;a.classList.toggle('active',yes);if(yes)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
}
function queueActive(){if(!queued){queued=true;requestAnimationFrame(updateActive);}}
window.addEventListener('scroll',queueActive,{passive:true});window.addEventListener('resize',queueActive);
locale.onChange(render);locale.onChange(queueActive);locale.init();
