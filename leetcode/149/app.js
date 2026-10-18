'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let frames=LineLesson.trace(LineLesson.presets[0]),index=0,prediction=null,revealed=false,copyState='';
function draw(f){
  const xs=f.points.map(p=>p[0]),ys=f.points.map(p=>p[1]);
  const xmin=Math.min(0,...xs)-1,xmax=Math.max(0,...xs)+1,ymin=Math.min(0,...ys)-1,ymax=Math.max(0,...ys)+1;
  const sx=x=>50+(x-xmin)/(xmax-xmin)*325,sy=y=>285-(y-ymin)/(ymax-ymin)*250;
  let svg='';
  for(let x=xmin;x<=xmax;x++)svg+=`<line class="plot-grid" x1="${sx(x)}" y1="35" x2="${sx(x)}" y2="285"/><text x="${sx(x)}" y="307" text-anchor="middle">${x}</text>`;
  for(let y=ymin;y<=ymax;y++)svg+=`<line class="plot-grid" x1="50" y1="${sy(y)}" x2="375" y2="${sy(y)}"/><text x="38" y="${sy(y)+5}" text-anchor="end">${y}</text>`;
  svg+=`<line class="plot-axis" x1="50" y1="${sy(0)}" x2="375" y2="${sy(0)}"/><line class="plot-axis" x1="${sx(0)}" y1="35" x2="${sx(0)}" y2="285"/><text x="397" y="307">x</text><text x="20" y="20">y</text>`;
  const [ax,ay]=f.points[f.i];
  f.log.forEach((e,k)=>{const [x,y]=f.points[e.j];svg+=`<line class="plot-edge ${k===f.log.length-1?'new':''}" x1="${sx(ax)}" y1="${sy(ay)}" x2="${sx(x)}" y2="${sy(y)}"/>`;});
  f.points.forEach(([x,y],k)=>{
    const anchor=k===f.i,target=f.event&&k===f.event.j,done=f.log.some(e=>e.j===k);
    svg+=`<circle class="plot-node ${anchor?'anchor':target?'target':done?'done':''}" cx="${sx(x)}" cy="${sy(y)}" r="12"/><text class="node-label" x="${sx(x)}" y="${sy(y)}">${k}</text>`;
    if(anchor||target)svg+=`<text x="${sx(x)+16}" y="${sy(y)-14}">${anchor?'A':'T'}</text>`;
  });
  $('plot').innerHTML=svg;
}
function render(){
  const f=frames[index];
  $('langToggle').setAttribute('aria-label',t('langLabel'));document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
  $('plot').setAttribute('aria-label',t('plotLabel'));$('plotWrap').setAttribute('aria-label',t('plotLabel'));$('history').setAttribute('aria-label',t('historyTitle'));
  $('position').max=frames.length-1;$('position').value=index;
  $('prev').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
  $('progress').textContent=t('progress',{i:index,total:frames.length-1,anchor:f.i});
  $('event').textContent=f.event?t('event',f.event):t('start',{i:f.i,point:`(${f.points[f.i]})`});
  $('local').textContent=f.local;$('best').textContent=f.best;draw(f);
  $('points').innerHTML=f.points.map((p,k)=>{
    const role=k===f.i?'anchorRole':f.event&&k===f.event.j?'targetRole':k<f.i?'earlierRole':f.log.some(e=>e.j===k)?'processedRole':'pendingRole';
    return `<li>#${k} (${p}) · ${t(role)}</li>`;
  }).join('');
  $('buckets').innerHTML=Object.entries(f.buckets).length?Object.entries(f.buckets).map(([key,members])=>`<div class="bucket-item">${t('bucket',{key,count:members.length,members:members.map(j=>'#'+j).join(', '),line:members.length+1})}</div>`).join(''):`<p class="hint">${t('emptyBuckets')}</p>`;
  $('emptyLog').hidden=!!f.log.length;$('history').hidden=!f.log.length;
  $('historyBody').innerHTML=f.log.map((e,k)=>`<tr class="${k===f.log.length-1?'active-row':''}"><th scope="row">#${e.j}</th><td>(${e.dy},${e.dx})</td><td>(${e.key})</td><td>${e.before} → ${e.after}</td></tr>`).join('');
  $('completed').innerHTML=f.completed.length?f.completed.map(c=>`<div class="completed-item">${t('completed',c)}</div>`).join(''):`<p class="hint">${t('noCompleted')}</p>`;
  $('final').hidden=index!==frames.length-1;
  $('final').textContent=$('final').hidden?'':t('final',{best:f.best});
  $('reveal').disabled=prediction===null;$('feedback').hidden=!revealed;
  $('feedback').textContent=revealed?t(prediction==='1'?'correct':'incorrect')+' '+t('quizExplain'):'';
  $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{frames=LineLesson.trace(LineLesson.presets[Number(e.target.value)]);index=0;render();});
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
let scrollQueued=false;
function updateActive(){
  scrollQueued=false;const boundary=document.querySelector('nav').getBoundingClientRect().height+40;let section=sections[0];
  sections.forEach(s=>{if(s.getBoundingClientRect().top<=boundary)section=s;});
  links.forEach(a=>{const active=a.hash==='#'+section.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
}
function queueActive(){if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateActive);}}
window.addEventListener('scroll',queueActive,{passive:true});window.addEventListener('resize',queueActive);
locale.onChange(render);locale.onChange(queueActive);locale.init();queueActive();
