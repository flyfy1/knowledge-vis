'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY), t=locale.t;
const $=id=>document.getElementById(id);
let preset=0, index=0, frames=PalindromeLesson.trace(PalindromeLesson.presets[0]);
let prediction=null,revealed=false,copyState='';
function render(){
  const f=frames[index],n=f.s.length;
  $('langToggle').setAttribute('aria-label',t('langLabel'));
  document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
  $('matrix').setAttribute('aria-label',t('matrixTitle'));
  $('history').setAttribute('aria-label',t('historyTitle'));
  $('position').max=frames.length-1;$('position').value=index;
  $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;
  $('end').disabled=index===frames.length-1;
  $('progress').textContent=t('progress',{i:index,total:frames.length-1,done:f.done,n});
  if(index===0){$('event').textContent=t('initial');$('comparison').hidden=true;}
  else{
    let reason=!f.equal?t('endpointFail',{a:f.s[f.l],b:f.s[f.r]}):f.short?t('shortPass'):t('innerCheck',{l:f.l+1,r:f.r-1,value:f.inner?'T':'F',result:f.p[f.l][f.r]?'T':'F'});
    $('event').textContent=t('event',{l:f.l,r:f.r,part:f.s.slice(f.l,f.r+1),reason});
    $('comparison').hidden=false;
    $('comparison').textContent=f.candidate===null?t('reject',{k:f.r+1,after:f.after}):t('update',{k:f.r+1,l:f.l,old:f.old,candidate:f.candidate,after:f.after});
  }
  $('dp').innerHTML=f.dp.map((v,k)=>{
    const state=k<=f.done?'complete':v===null?'untested':'provisional';
    return `<div class="dp-cell ${f.r!==null&&k===f.r+1?'current':''}"><small>k=${k} · ${k?f.s.slice(0,k):'∅'}</small><b>dp[${k}]=${v===null?'?':v}</b><small>${t(state)}</small></div>`;
  }).join('');
  $('matrix').innerHTML=`<table aria-labelledby="matrixCaption"><thead><tr><th scope="col">l / r</th>${[...f.s].map((c,r)=>`<th scope="col">${r}: ${c}</th>`).join('')}</tr></thead><tbody>${f.p.map((row,l)=>`<tr><th scope="row">${l}: ${f.s[l]}</th>${row.map((v,r)=>`<td class="${l===f.l&&r===f.r?'current ':''}${v===true?'true':v===false?'false':''}">${l>r?'—':v===null?'?':v?'T':'F'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  $('emptyLog').hidden=index!==0;$('history').hidden=index===0;
  $('historyBody').innerHTML=f.log.map((e,i)=>`<tr class="${i===f.log.length-1?'active-row':''}"><th scope="row">[${e.l},${e.r}] ${f.s.slice(e.l,e.r+1)}</th><td>${f.p[e.l][e.r]?'T':'F'}</td><td>dp[${e.r+1}]</td><td>${e.old}</td><td>${e.candidate===null?'—':e.candidate}</td><td>${e.after}</td></tr>`).join('');
  $('final').hidden=index!==frames.length-1;
  if(!$('final').hidden)$('final').textContent=t('final',{pieces:f.dp[n],cuts:f.dp[n]-1});
  $('reveal').disabled=prediction===null;
  $('feedback').hidden=!revealed;
  if(revealed)$('feedback').textContent=t(prediction==='2'?'correct':'incorrect')+' '+t('quizExplain');
  $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{preset=Number(e.target.value);index=0;frames=PalindromeLesson.trace(PalindromeLesson.presets[preset]);render();});
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
const links=[...document.querySelectorAll('.step-nav a')];
const sections=[...document.querySelectorAll('.step')];
let scrollQueued=false;
function updateActive(){
  scrollQueued=false;
  const boundary=document.querySelector('nav').getBoundingClientRect().height+40;
  let activeSection=sections[0];
  for(const section of sections)if(section.getBoundingClientRect().top<=boundary)activeSection=section;
  links.forEach(a=>{const active=a.hash==='#'+activeSection.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
}
function queueActive(){if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateActive);}}
window.addEventListener('scroll',queueActive,{passive:true});
window.addEventListener('resize',queueActive);
locale.onChange(queueActive);queueActive();
locale.onChange(render);locale.init();
