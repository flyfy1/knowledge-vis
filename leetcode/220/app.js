'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let frames=BucketLesson.trace(BucketLesson.presets[0]),at=0,handK=2,prediction=null,revealed=false,copyState='';
function eventText(e){
  const f=frames[at],i=e.i,x=f.nums[i],base={...e,x,k:f.k,n:f.nums.length};
  if(e.phase==='start')return t('eventStart');
  if(e.phase==='expire')return e.expired===null?t('eventExpireNone',base):t('eventExpire',{...base,old:f.nums[e.expired],gap:i-e.expired});
  if(e.phase==='probe')return t('eventProbe',{...base,outcome:e.pair?t('hit',{j:e.pair[0],i}):t('miss')});
  if(e.phase==='insert')return t('eventInsert',base);
  return t('eventEnd',base);
}
function render(){
  $('langToggle').setAttribute('aria-label',t('langLabel'));
  document.querySelector('nav').setAttribute('aria-label',t('navLabel'));
  $('handTable').setAttribute('aria-label',t('handTask'));
  $('k1').setAttribute('aria-pressed',String(handK===1));$('k2').setAttribute('aria-pressed',String(handK===2));
  const nums=[1,8,3],pairs=[[0,1],[1,2],[0,2]];
  $('handBody').innerHTML=pairs.map(([i,j])=>'<tr><th scope="row">('+i+','+j+')</th><td>'+(j-i)+' ≤ '+handK+' · '+t(j-i<=handK?'yes':'no')+'</td><td>'+Math.abs(nums[i]-nums[j])+' ≤ 2 · '+t(Math.abs(nums[i]-nums[j])<=2?'yes':'no')+'</td><td>'+t(j-i<=handK&&Math.abs(nums[i]-nums[j])<=2?'yes':'no')+'</td></tr>').join('');
  $('handResult').textContent=t('handResult',{k:handK,result:handK===2?'true':'false'});
  const f=frames[at];
  $('position').max=frames.length-1;$('position').value=at;
  $('prev').disabled=at===0;$('next').disabled=at===frames.length-1;$('end').disabled=at===frames.length-1;
  $('progress').textContent=t('progress',{at,total:frames.length-1,n:f.nums.length,k:f.k,t:f.t,w:f.width});
  $('event').textContent=eventText(f);
  $('values').innerHTML=f.nums.map((x,j)=>{
    const isPair=f.pair&&f.pair.includes(j),isCurrent=j===f.i;
    const role=isPair?'witness':isCurrent?'current':f.entries.some(e=>e.j===j)?'stored':j>f.i?'pending':'removed';
    return '<li class="'+(isCurrent?'current ':'')+(isPair?'witness':'')+'"><b>'+x+'</b><span>'+t('item',{j,role:t(role)})+'</span></li>';
  }).join('');
  $('buckets').innerHTML=f.entries.length?f.entries.map(e=>'<div class="bucket"><b>'+t('bucketLabel',{b:e.b,lo:e.b*f.width,hi:(e.b+1)*f.width-1})+'</b><span>'+t('bucketValue',e)+'</span></div>').join(''):'<p>'+t('empty')+'</p>';
  $('timing').textContent=['expire','probe'].includes(f.phase)?(f.i===0?t('probeEmpty'):t('probeTiming',{lo:Math.max(0,f.i-f.k),hi:f.i-1})):f.phase==='insert'?t('insertTiming',{lo:Math.max(0,f.i-f.k),hi:f.i}):t('startTiming');
  $('checks').innerHTML=f.probes?f.probes.map(e=>'<li>'+(e.j===null?t('checkEmpty',e):t('checkValue',{...e,t:f.t,pass:t(e.hit?'yes':'no')}))+'</li>').join(''):'<li>'+t('noChecks')+'</li>';
  $('history').innerHTML=f.history.length?f.history.map(e=>'<li>'+eventText(e)+'</li>').join(''):'<li>'+t('noHistory')+'</li>';
  $('reveal').disabled=prediction===null;$('feedback').hidden=!revealed;
  $('feedback').textContent=revealed?t(prediction==='1'?'correct':'incorrect')+' '+t('quizExplain'):'';
  $('copyStatus').textContent=copyState?t(copyState):'';
}
$('k1').addEventListener('click',()=>{handK=1;render();});$('k2').addEventListener('click',()=>{handK=2;render();});
$('preset').addEventListener('change',e=>{frames=BucketLesson.trace(BucketLesson.presets[Number(e.target.value)]);at=0;render();});
$('prev').addEventListener('click',()=>{at=Math.max(0,at-1);render();});
$('next').addEventListener('click',()=>{at=Math.min(frames.length-1,at+1);render();});
$('end').addEventListener('click',()=>{at=frames.length-1;render();});
$('reset').addEventListener('click',()=>{at=0;render();});
$('position').addEventListener('input',e=>{at=Number(e.target.value);render();});
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
  queued=false;const boundary=document.querySelector('nav').getBoundingClientRect().height+40;let current=sections[0];
  sections.forEach(s=>{if(s.getBoundingClientRect().top<=boundary)current=s;});
  links.forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
}
function queueActive(){if(!queued){queued=true;requestAnimationFrame(updateActive);}}
window.addEventListener('scroll',queueActive,{passive:true});window.addEventListener('resize',queueActive);
locale.onChange(render);locale.onChange(queueActive);locale.init();queueActive();
